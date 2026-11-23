#!/usr/bin/env node
/**
 * Score page vs screen against the hand labels in data/eval/screen-gold.json
 * (docs/page-vs-screen/METHODS.md §6).
 *
 *   npm run screen:eval          tune the line thresholds on the dev films, and report the dev films only
 *   npm run screen:eval -- --test-only  score the test films with the thresholds in src/pageVsScreen.js (once, after freezing)
 *
 * Script lines were sampled evenly across the predicted labels, so each is
 * weighted by how many lines of its film it stands for: the scores describe
 * whole films, not the sample.
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { compareFilmOnDisk, loadFilmRecords, ROOT } = require('../src/screenOnDisk');
const { METHOD } = require('../src/pageVsScreen');
const { bootstrap, cohensKappa, verdictChanges, wilson } = require('../src/stats');

const gold = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/eval/screen-gold.json'), 'utf8'));
const LABELS = ['kept', 'changed', 'cut'];
const hashOf = text => crypto.createHash('sha1').update(text).digest('hex').slice(0, 12);
const labelWith = (t, share) => (share >= t.kept ? 'kept' : share >= t.changed ? 'changed' : 'cut');

/** Every labelled script line, with its share of words heard and its sampling weight */
const loadItems = async () => {
	const records = loadFilmRecords();
	const items = [];
	const notInScript = [];
	for (const entry of gold.films) {
		const { detail } = await compareFilmOnDisk(records.find(f => f._id === entry._id), { primaryId: entry.primary });
		const share = s => s.matched / s.words;
		const eligible = detail.pageShares.filter(s => s.words >= 2);
		const stratumSize = label => eligible.filter(s => labelWith(gold.sampledThresholds, share(s)) === label).length;
		// only lines with a usable label count: an "unsure" line stands for nothing
		const sampled = entry.items.filter(item => item.kind === 'page' && !['unsure', undefined].includes(gold.labels[`${entry._id}:page:${item.line}`]));
		const sampledIn = label => sampled.filter(item => labelWith(gold.sampledThresholds, share(detail.pageShares[item.line])) === label).length;
		for (const item of entry.items) {
			const text = item.kind === 'page' ? detail.dialogue[item.line].text : detail.screenLines[item.line].text;
			if (hashOf(text) !== item.hash) throw new Error(`${entry.title}: line ${item.line} changed since sampling`);
			const truth = gold.labels[`${entry._id}:${item.kind}:${item.line}`];
			if (!truth || truth === 'unsure') continue;
			if (item.kind === 'screen') {
				// precision counts only lines the current alignment still leaves out of the script
				if (detail.lineOwner[item.line] === null) notInScript.push({ film: entry._id, split: entry.split, correct: truth === 'not in script' });
				continue;
			}
			const s = detail.pageShares[item.line];
			const stratum = labelWith(gold.sampledThresholds, share(s));
			items.push({ key: `${entry._id}:page:${item.line}`, film: entry._id, split: entry.split, truth, share: share(s), weight: stratumSize(stratum) / sampledIn(stratum) });
		}
	}
	return { items, notInScript };
};

/** Weighted precision, recall and F1 per label, and their mean (macro F1) */
const score = (items, t) => {
	const perLabel = Object.fromEntries(LABELS.map(label => {
		const predicted = items.filter(i => labelWith(t, i.share) === label);
		const actual = items.filter(i => i.truth === label);
		const both = predicted.filter(i => i.truth === label);
		const sum = xs => xs.reduce((a, i) => a + i.weight, 0);
		const precision = sum(predicted) ? sum(both) / sum(predicted) : null;
		const recall = sum(actual) ? sum(both) / sum(actual) : null;
		const f1 = precision && recall ? (2 * precision * recall) / (precision + recall) : 0;
		return [label, { precision, recall, f1 }];
	}));
	return { perLabel, macroF1: LABELS.reduce((a, l) => a + perLabel[l].f1, 0) / LABELS.length };
};

/** Resample films, not lines: lines from one film aren't independent */
const byFilmBootstrap = (items, statistic) => {
	const films = [...new Set(items.map(i => i.film))].map(film => items.filter(i => i.film === film));
	return bootstrap(films, sample => statistic(sample.flat()), { resamples: 2000, seed: 'screen-eval' });
};

const report = (name, items, t) => {
	const s = score(items, t);
	const ci = byFilmBootstrap(items, sample => score(sample, t).macroF1);
	const f = x => (x === null ? '  ?  ' : x.toFixed(3));
	console.log(`\n${name}: ${items.length} script lines from ${new Set(items.map(i => i.film)).size} films, macro F1 ${f(s.macroF1)} [${f(ci[0])}, ${f(ci[1])}]`);
	for (const label of LABELS) {
		const p = s.perLabel[label];
		console.log(`  ${label.padEnd(8)} precision ${f(p.precision)}  recall ${f(p.recall)}  F1 ${f(p.f1)}`);
	}
};

const main = async () => {
	process.loadEnvFile(path.join(ROOT, '.env'));
	const testOnly = process.argv.includes('--test-only');
	const { items, notInScript } = await loadItems();
	const dev = items.filter(i => i.split === 'dev');
	const test = items.filter(i => i.split === 'test');
	let chosen = METHOD.thresholds;
	if (!testOnly) {
		let best = null;
		for (let kept = 0.5; kept <= 0.951; kept += 0.05) {
			for (let changed = 0.05; changed < kept - 0.01; changed += 0.05) {
				const t = { kept: +kept.toFixed(2), changed: +changed.toFixed(2), scripted: METHOD.thresholds.scripted };
				const macroF1 = score(dev, t).macroF1;
				if (!best || macroF1 > best.macroF1) best = { t, macroF1 };
			}
		}
		chosen = best.t;
		console.log(`Best on dev: kept >= ${chosen.kept}, changed >= ${chosen.changed} (now in src/pageVsScreen.js: ${METHOD.thresholds.kept} / ${METHOD.thresholds.changed})`);
		report('dev', dev, chosen);
	}
	// the test films are scored once, after the method is frozen (METHODS.md §6)
	if (testOnly) report('test (frozen thresholds)', test, chosen);

	const split = testOnly ? 'test' : 'dev';
	const rows = notInScript.filter(r => r.split === split);
	console.log(`\n"Not in the script" lines (${split}): ${rows.filter(r => r.correct).length} of ${rows.length} confirmed (precision ${(rows.filter(r => r.correct).length / rows.length).toFixed(3)}); recall isn't measured, since only predicted lines were sampled`);

	const again = Object.keys(gold.again).filter(key => gold.labels[key]);
	if (again.length > 0) {
		console.log(`Agreement between the two labellings: Cohen's kappa ${cohensKappa(again.map(k => gold.labels[k]), again.map(k => gold.again[k])).toFixed(3)} over ${again.length} items`);
	}
	const audio = Object.values(gold.audio).filter(a => a !== 'unsure');
	if (audio.length > 0) {
		const trimmed = audio.filter(a => a === 'subtitles trimmed').length;
		const [lo, hi] = wilson(trimmed, audio.length);
		console.log(`Audio check: ${trimmed} of ${audio.length} lines labelled cut or changed were said as written; the subtitles trimmed them (95% CI ${(lo * 100).toFixed(0)}-${(hi * 100).toFixed(0)}%)`);
	}
	const check = Object.keys(gold.check ?? {}).filter(key => gold.check[key] !== 'unsure');
	if (check.length > 0) {
		for (const [name, labels] of [['first labelling', gold.labels], ['second labelling', gold.again]]) {
			const both = check.filter(key => labels[key] && labels[key] !== 'unsure');
			console.log(`Check labels against the ${name}: Cohen's kappa ${cohensKappa(both.map(k => labels[k]), both.map(k => gold.check[k])).toFixed(3)} over ${both.length} items`);
		}
		const lines = items.filter(i => check.includes(i.key));
		const agree = lines.filter(i => labelWith(METHOD.thresholds, i.share) === gold.check[i.key]).length;
		console.log(`The method's label matches the check label on ${agree} of ${lines.length} script lines (unweighted)`);
	}
	const verdicts = Object.values(gold.verdicts ?? {}).filter(v => v.verdict !== 'unsure');
	for (const [change, expected] of [['page-pass-screen-fail', 'fails on screen'], ['page-fail-screen-pass', 'passes on screen']]) {
		const judged = verdicts.filter(v => v.change === change);
		if (judged.length === 0) continue;
		const confirmed = judged.filter(v => v.verdict === expected).length;
		const [lo, hi] = wilson(confirmed, judged.length);
		console.log(`Verdict check, ${change}: the film ${expected} in ${confirmed} of ${judged.length} (95% CI ${(lo * 100).toFixed(0)}-${(hi * 100).toFixed(0)}%)`);
	}
	// verdict changes the method may have missed: a film it fails on both sides that passes on screen, or an unclear
	// film whose judged screen verdict differs from its page verdict
	const missed = Object.values(gold.missed ?? {});
	for (const [change, what] of [['fail-fail', 'fails on both sides but passes on screen'], ['unclear', 'is unclear and changes verdict on screen']]) {
		const { changed, judged } = verdictChanges(missed.filter(m => m.change === change));
		if (judged === 0) continue;
		const [lo, hi] = wilson(changed, judged);
		console.log(`Missed-verdict check: the film ${what} in ${changed} of ${judged} (95% CI ${(lo * 100).toFixed(0)}-${(hi * 100).toFixed(0)}%)`);
	}
};

main().catch(error => {
	console.error(error);
	process.exit(1);
});
