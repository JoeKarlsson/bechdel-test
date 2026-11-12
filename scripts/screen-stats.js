#!/usr/bin/env node
/**
 * The shelf-wide page vs screen results (docs/page-vs-screen/METHODS.md §9),
 * from data/screen/*.json, printed and written to data/eval/page-vs-screen.json.
 *
 *   npm run screen:stats
 */
const fs = require('fs');
const path = require('path');
const { median, quantile, bootstrap, wilson, wilcoxonSignedRank, mcnemar } = require('../src/stats');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data/eval/page-vs-screen.json');
const MIN_LINES = 20;
const SEED = 'page-vs-screen-stats-2026-11-12';

const films = fs.readdirSync(path.join(ROOT, 'data/screen')).filter(f => f.endsWith('.json')).map(f => {
	const screen = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/screen', f), 'utf8'));
	const film = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/films', f), 'utf8'));
	return { ...screen, year: film.year, title: film.title };
});
const compared = films.filter(f => !f.excluded);
// below chance: measured, but left out of the headline (METHODS.md §7)
const chanceLevel = films.filter(f => f.excluded && f.words);

const summary = xs => ({ n: xs.length, median: median(xs), q1: quantile(xs, 0.25), q3: quantile(xs, 0.75) });
const survival = f => f.words.kept / f.words.page;
const notInScript = f => f.words.notInScript / f.words.screen;
const by = (fs, keyOf) => Object.fromEntries([...new Set(fs.map(keyOf))].sort().map(key => {
	const group = fs.filter(f => keyOf(f) === key);
	return [key, { survival: summary(group.map(survival)), notInScript: summary(group.map(notInScript)) }];
}));
const decade = f => `${Math.floor(f.year / 10) * 10}s`;

/** RQ3 and RQ4 on a set of films, so the robustness checks rerun them unchanged */
const headline = (fs, label) => {
	const both = fs.filter(f => f.byGender.w.lines >= MIN_LINES && f.byGender.m.lines >= MIN_LINES);
	const differences = both.map(f => f.byGender.w.cut / f.byGender.w.lines - f.byGender.m.cut / f.byGender.m.lines);
	const decided = fs.filter(f => f.bechdel.change !== 'unclear');
	const changed = decided.filter(f => f.bechdel.change !== 'same');
	const passToFail = decided.filter(f => f.bechdel.change === 'page-pass-screen-fail').length;
	const failToPass = decided.filter(f => f.bechdel.change === 'page-fail-screen-pass').length;
	return {
		label,
		films: fs.length,
		survival: summary(fs.map(survival)),
		notInScript: summary(fs.map(notInScript)),
		cutWomenMinusMen: {
			films: both.length,
			median: median(differences),
			ci95: bootstrap(differences, median, { seed: `${SEED}:${label}` }),
			wilcoxon: wilcoxonSignedRank(differences),
		},
		verdict: {
			decided: decided.length,
			unclear: fs.length - decided.length,
			changed: changed.length,
			share: decided.length ? changed.length / decided.length : null,
			ci95: wilson(changed.length, decided.length),
			passToFail,
			failToPass,
			mcnemar: mcnemar(passToFail, failToPass),
		},
	};
};

const results = {
	method: compared[0]?.method.version ?? null,
	films: films.length,
	excluded: Object.fromEntries([...new Set(films.filter(f => f.excluded).map(f => f.excluded))].map(reason => [reason, films.filter(f => f.excluded === reason).length])),
	all: headline(compared, 'all'),
	byDraft: by(compared, f => f.script.draft),
	byDecade: by(compared, decade),
	bySdh: by(compared, f => (f.subtitles.sdh ? 'SDH' : 'regular')),
	subtitleAgreement: summary(compared.map(f => f.subtitles.meanAgreement).filter(x => x !== null)),
	robustness: [
		headline(compared.filter(f => f.subtitles.sdh), 'SDH primary only'),
		headline(compared.filter(f => f.script.draft === 'shooting'), 'shooting drafts only'),
		headline(compared.filter(f => (f.subtitles.meanAgreement ?? 0) >= 0.8), 'versions agree on 80%+'),
		headline([...compared, ...chanceLevel], 'with the chance-level films put back'),
	],
	changedFilms: compared.filter(f => ['page-pass-screen-fail', 'page-fail-screen-pass'].includes(f.bechdel.change))
		.map(f => ({ _id: f._id, title: f.title, year: f.year, change: f.bechdel.change })),
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(results, null, '\t')}\n`);

const pct = x => (x === null ? '?' : `${(x * 100).toFixed(1)}%`);
console.log(`${results.films} films; ${compared.length} compared; excluded: ${JSON.stringify(results.excluded)}`);
for (const h of [results.all, ...results.robustness]) {
	console.log(`\n${h.label} (${h.films} films)`);
	console.log(`  RQ1 word survival: median ${pct(h.survival.median)} (IQR ${pct(h.survival.q1)}-${pct(h.survival.q3)})`);
	console.log(`  RQ2 not in script: median ${pct(h.notInScript.median)} (IQR ${pct(h.notInScript.q1)}-${pct(h.notInScript.q3)})`);
	const c = h.cutWomenMinusMen;
	console.log(`  RQ3 women's minus men's cut rate: median ${pct(c.median)} [${pct(c.ci95[0])}, ${pct(c.ci95[1])}], Wilcoxon p = ${c.wilcoxon.p.toFixed(4)} (${c.films} films)`);
	const v = h.verdict;
	console.log(`  RQ4 verdict differs: ${v.changed} of ${v.decided} (${pct(v.share)} [${pct(v.ci95[0])}, ${pct(v.ci95[1])}]); pass->fail ${v.passToFail}, fail->pass ${v.failToPass}, McNemar p = ${v.mcnemar.p.toFixed(4)}; ${v.unclear} unclear`);
}
console.log(`\nwritten to ${path.relative(ROOT, OUT)}`);
