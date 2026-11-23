#!/usr/bin/env node
/**
 * Hand-label a sample of page vs screen results, blind to what the pipeline
 * decided (docs/page-vs-screen/METHODS.md §6). Labels go to
 * data/eval/screen-gold.json as line numbers and text hashes, never text.
 *
 *   npm run screen:label             draw the sample (first run), then label what's left; quit any time
 *   npm run screen:label -- --again  label a fixed 100 of the items a second time, for agreement between labellers
 *   npm run screen:label -- --audio  for test-set lines labelled cut or changed, note what the film's audio says
 *   npm run screen:label -- --check  label the same 100 items yourself, to check both labellings against
 *   npm run screen:label -- --verdicts  for 30 films that lose a pass on screen and every film that gains one, judge
 *                                       from the film whether it passes on screen
 *   --missed (export and import only)   the same question, blind, for 50 films that fail on both page and screen and
 *                                       20 whose screen readings disagree: verdict changes the method may have missed
 *
 * For labelling outside this prompt (docs/page-vs-screen/CODEBOOK.md):
 *   npm run screen:label -- --export <dir> [--again|--check|--audio|--verdicts|--missed]  each film's items, with context and no
 *                                    prediction, plus its full script and subtitles to search (text: keep the folder off the repo)
 *   npm run screen:label -- --import <labels.json> [same flag]  { "<item key>": "<label>" } into the gold file
 *   npm run screen:label-web -- <dir>  label an exported folder in the browser
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline/promises');
const { compareFilmOnDisk, loadComparisonInput, loadFilmRecords, SCREEN_DIR, ROOT } = require('../src/screenOnDisk');
const { METHOD, compareFilm, screenScreenplay } = require('../src/pageVsScreen');
const { runTest } = require('../src/bechdel/score');

const GOLD_FILE = path.join(ROOT, 'data/eval/screen-gold.json');
const SEED = 'screen-gold-2026-11-12';
const FILMS = 20;
const PAGE_ITEMS = 30;
const SCREEN_ITEMS = 10;
const AGAIN_ITEMS = 100;
const AUDIO_ITEMS = 100;
const VERDICT_PASS_TO_FAIL = 30;

const order = key => crypto.createHash('sha1').update(`${SEED}:${key}`).digest('hex');
const seeded = (items, keyOf) => [...items].sort((a, b) => order(keyOf(a)).localeCompare(order(keyOf(b))));
const hashOf = text => crypto.createHash('sha1').update(text).digest('hex').slice(0, 12);
const itemKey = (film, item) => `${film._id}:${item.kind}:${item.line}`;
const save = gold => fs.writeFileSync(GOLD_FILE, `${JSON.stringify(gold, null, '\t')}\n`);

/** 20 films, round-robin over era x SDH strata in seeded order, alternately to dev and test */
const drawFilms = films => {
	const era = year => (year < 1990 ? 'before 1990' : year <= 2005 ? '1990-2005' : 'after 2005');
	const strata = new Map();
	for (const film of seeded(films, f => f._id)) {
		const key = `${era(film.year)} / ${film.screen.subtitles.sdh ? 'SDH' : 'regular'}`;
		strata.set(key, [...(strata.get(key) ?? []), film]);
	}
	const picked = [];
	for (let round = 0; picked.length < FILMS && [...strata.values()].some(fs => fs.length > round); round++) {
		[...strata].sort().forEach(([stratum, fs], index) => {
			// a stratum's films alternate between dev and test from round to round, and neighbouring strata start on opposite
			// sides, so each split gets ten films and the same mix (alternating by pick order alone lined up with SDH or not)
			if (fs[round] && picked.length < FILMS) picked.push({ film: fs[round], stratum, split: (index + round) % 2 === 0 ? 'dev' : 'test' });
		});
	}
	return picked;
};

/** Up to 30 script lines spread over the predicted labels, and 10 subtitle lines predicted not in the script */
const drawItems = (filmId, detail) => {
	const labelOf = s => (s.matched / s.words >= METHOD.thresholds.kept ? 'kept' : s.matched / s.words >= METHOD.thresholds.changed ? 'changed' : 'cut');
	const pageLines = detail.pageShares.map((s, line) => ({ line, s })).filter(({ s }) => s.words >= 2);
	const byLabel = ['kept', 'changed', 'cut'].map(label => seeded(pageLines.filter(({ s }) => labelOf(s) === label), x => `${filmId}:${x.line}`));
	const page = [];
	for (let k = 0; page.length < PAGE_ITEMS && byLabel.some(list => list.length > k); k++) {
		for (const list of byLabel) if (list[k] && page.length < PAGE_ITEMS) page.push(list[k].line);
	}
	const screen = seeded(detail.screenLines.map((l, line) => ({ line, l }))
		.filter(({ line }) => detail.lineOwner[line] === null && detail.screenShares[line].words >= 2), x => `${filmId}:s${x.line}`)
		.slice(0, SCREEN_ITEMS).map(x => x.line);
	const items = [
		...page.map(line => ({ kind: 'page', line, hash: hashOf(detail.dialogue[line].text) })),
		...screen.map(line => ({ kind: 'screen', line, hash: hashOf(detail.screenLines[line].text) })),
	];
	return seeded(items, item => `${filmId}:${item.kind}:${item.line}`);
};

const clock = seconds => {
	const s = Math.round(seconds ?? 0);
	return `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

/** The subtitle line nearest where script line i would be, from its neighbours' matches (never its own) */
const anchorFor = (detail, i) => {
	for (let d = 1; d < detail.dialogue.length; d++) {
		for (const k of [i - d, i + d]) {
			const j = detail.lineOwner.indexOf(k);
			if (k >= 0 && k < detail.dialogue.length && j >= 0) return j;
		}
	}
	return 0;
};

/** The script line nearest subtitle line j, from its neighbours' matches */
const scriptAnchorFor = (detail, j) => {
	for (let d = 1; d < detail.screenLines.length; d++) {
		for (const k of [j - d, j + d]) if (detail.lineOwner[k] !== null && detail.lineOwner[k] !== undefined) return detail.lineOwner[k];
	}
	return 0;
};

const showSubtitles = (detail, center, radius, mark = -1) => {
	for (let j = Math.max(0, center - radius); j <= Math.min(detail.screenLines.length - 1, center + radius); j++) {
		console.log(`${j === mark ? '  >>' : '    '} ${clock(detail.screenLines[j].start)}  ${detail.screenLines[j].text}`);
	}
};
const showScript = (detail, center, radius, mark = -1) => {
	for (let i = Math.max(0, center - radius); i <= Math.min(detail.dialogue.length - 1, center + radius); i++) {
		console.log(`${i === mark ? '  >>' : '    '} ${detail.dialogue[i].speaker}: ${detail.dialogue[i].text}`);
	}
};

const PAGE_KEYS = { k: 'kept', c: 'changed', x: 'cut', u: 'unsure' };
const SCREEN_KEYS = { s: 'scripted', n: 'not in script', u: 'unsure' };

/** Asks about one item until it gets a label; null means quit */
const ask = async (rl, film, item, detail) => {
	let radius = 8;
	for (;;) {
		console.log(`\n=== ${film.title} (${film.year})`);
		if (item.kind === 'page') {
			const line = detail.dialogue[item.line];
			console.log('Script, around the line:');
			showScript(detail, item.line, 2, item.line);
			console.log('\nSubtitles near where it would be:');
			showSubtitles(detail, anchorFor(detail, item.line), radius);
			console.log(`\nIs "${line.speaker}: ${line.text}" said in the film? If it's said somewhere else, judge how closely.`);
		} else {
			console.log('Subtitles, around the line:');
			showSubtitles(detail, item.line, 3, item.line);
			console.log('\nScript near where it would be:');
			showScript(detail, scriptAnchorFor(detail, item.line), radius);
			console.log(`\nIs "${detail.screenLines[item.line].text}" in the script (even reworded)?`);
		}
		const keys = item.kind === 'page' ? PAGE_KEYS : SCREEN_KEYS;
		const options = Object.entries(keys).map(([k, v]) => `[${k}] ${v}`).join('  ');
		const answer = (await rl.question(`${options}  [w] wider  [/word] search  [q] quit > `)).trim().toLowerCase();
		if (answer === 'q') return null;
		if (answer === 'w') { radius *= 3; continue; }
		if (answer.startsWith('/')) {
			const word = answer.slice(1);
			const lines = item.kind === 'page' ? detail.screenLines.map(l => `${clock(l.start)}  ${l.text}`) : detail.dialogue.map(d => `${d.speaker}: ${d.text}`);
			for (const l of lines.filter(l => l.toLowerCase().includes(word)).slice(0, 15)) console.log(`     ${l}`);
			await rl.question('(enter to go back) ');
			continue;
		}
		if (keys[answer]) return keys[answer];
	}
};

const VERDICT_KEYS = { p: 'passes on screen', f: 'fails on screen', u: 'unsure' };

/** Every compared film with its page and screen Bechdel results */
const bechdelOf = records => records.map(film => ({ film, file: path.join(SCREEN_DIR, `${film._id}.json`) }))
	.filter(({ file }) => fs.existsSync(file))
	.map(({ film, file }) => ({ film, screen: JSON.parse(fs.readFileSync(file, 'utf8')) }))
	.filter(({ screen }) => !screen.excluded)
	.map(({ film, screen }) => ({ film, change: screen.bechdel.change, pagePasses: screen.bechdel.page.score === 3 }));

/** The changed verdicts to check: a seeded 30 of the films that lose a pass on screen, and every film that gains one */
const verdictSample = records => {
	const changed = bechdelOf(records);
	const of = change => seeded(changed.filter(c => c.change === change), c => `verdict:${c.film._id}`);
	return seeded([...of('page-pass-screen-fail').slice(0, VERDICT_PASS_TO_FAIL), ...of('page-fail-screen-pass')], c => `verdict-order:${c.film._id}`);
};

/**
 * Verdicts the method may have missed (added after the verdict check found its flags mostly wrong): a seeded 50 of
 * the films that fail on both page and screen, where the simulation says missed gained passes would sit, and 20 of
 * the films whose two screen readings disagree. Judged blind to the method's screen verdict.
 */
const MISSED_FAIL_FAIL = 50;
const MISSED_UNCLEAR = 20;
const missedSample = records => {
	const all = bechdelOf(records);
	const of = (keep, kind, n) => seeded(all.filter(keep), c => `missed:${c.film._id}`).slice(0, n).map(c => ({ ...c, change: kind }));
	return seeded([
		...of(c => c.change === 'same' && !c.pagePasses, 'fail-fail', MISSED_FAIL_FAIL),
		...of(c => c.change === 'unclear', 'unclear', MISSED_UNCLEAR),
	], c => `missed-order:${c.film._id}`);
};

const VERDICT_SHOWN = 3;

/**
 * The conversations a verdict rests on, as titled groups of lines, plus the film's detail. For a changed verdict the
 * summary says which way it changed; for the missed-verdict check ('fail-fail', 'unclear') it says nothing about the
 * method's screen verdict, so the judge is blind to it. pagePasses only matters for 'unclear'.
 */
const verdictEvidence = async (film, change, radius, pagePasses) => {
	const input = await loadComparisonInput(film);
	const { resolved, characters, screenplay } = input;
	const { detail } = compareFilm(input);
	const subtitlesAround = center => detail.screenLines
		.slice(Math.max(0, center - radius), center + radius + 1).map(l => `${clock(l.start)}  ${l.text}`);
	const shown = list => Math.min(VERDICT_SHOWN, list.length);
	// script conversations, each followed by the subtitles where it would be (compare: the page marks the closest lines)
	const scriptGroups = exchanges => {
		const indexOfBlock = new Map(screenplay.scenes.flatMap(scene => scene.blocks).filter(block => block.kind === 'dialogue').map((block, i) => [block, i]));
		return exchanges.slice(0, VERDICT_SHOWN).flatMap((exchange, n) => [
			{ title: `Script, conversation ${n + 1}`, lines: exchange.lines.map(line => `${line.speaker}: ${line.text}`) },
			{ title: 'Subtitles where it would be', lines: subtitlesAround(anchorFor(detail, indexOfBlock.get(exchange.lines[0]))), compare: true },
		]);
	};
	const screenGroups = unknownAs => {
		const screen = screenScreenplay(detail.dialogue, detail.screenLines, detail.lineOwner, resolved, unknownAs);
		const { clean } = runTest(screen, resolved, characters, 'w');
		return [clean, clean.slice(0, VERDICT_SHOWN).map((exchange, n) => ({
			title: `Subtitles, conversation ${n + 1}`, lines: exchange.lines.map(line => `${clock(line.start)}  ${line.speaker}: ${line.text}`),
		}))];
	};
	const page = runTest(screenplay, resolved, characters, 'w');
	if (change === 'page-pass-screen-fail') {
		return { detail, summary: `The script passes on ${page.clean.length} conversations. The first ${shown(page.clean)}, and the subtitles where each would be:`, groups: scriptGroups(page.clean) };
	}
	if (change === 'page-fail-screen-pass') {
		const [clean, groups] = screenGroups('SOMEONE UNHEARD');
		return { detail, summary: `The subtitles pass on ${clean.length} conversations, each line with the speaker of the script line it matched. The first ${shown(clean)}:`, groups };
	}
	if (change === 'fail-fail' || (change === 'unclear' && pagePasses)) {
		// fail-fail: rule 2 conversations, which mention a man (the page fails); unclear: the page's passing ones
		const exchanges = change === 'fail-fail' ? page.exchanges : page.clean;
		const women = [...page.named].sort();
		const who = women.length === 0 ? 'No named woman speaks in the script.' : `Named women who speak in the script: ${women.join(', ')}.`;
		const summary = exchanges.length === 0
			? `${who} ${women.length < 2 ? 'Search the subtitles (/) for other women in the film.' : 'The script has no conversation between two of them. Search the subtitles (/) for them.'}`
			: `${who} Conversations between them in the script (${exchanges.length}). The first ${shown(exchanges)}, and the subtitles where each would be:`;
		return { detail, summary, groups: scriptGroups(exchanges) };
	}
	if (change === 'unclear') {
		const [clean, groups] = screenGroups('skip');
		return { detail, summary: `Conversations between named women in the subtitles (${clean.length}), each line with the speaker of the script line it matched, lines with no known speaker left out. The first ${shown(clean)}:`, groups };
	}
	throw new Error(`no evidence for a "${change}" verdict`);
};

/** Shows the conversations a changed verdict rests on, and asks whether the film passes on screen; null means quit */
const askVerdict = async (rl, film, change) => {
	let radius = 6;
	for (;;) {
		const { summary, groups } = await verdictEvidence(film, change, radius);
		console.log(`\n=== ${film.title} (${film.year})\n${summary}`);
		for (const group of groups) {
			console.log(`\n${group.title}:`);
			for (const line of group.lines) console.log(`    ${line}`);
		}
		console.log('\nIn the film, do two named women talk to each other about something other than a man?');
		const options = Object.entries(VERDICT_KEYS).map(([k, v]) => `[${k}] ${v}`).join('  ');
		const answer = (await rl.question(`${options}  [w] wider  [q] quit > `)).trim().toLowerCase();
		if (answer === 'q') return null;
		if (answer === 'w') { radius *= 3; continue; }
		if (VERDICT_KEYS[answer]) return VERDICT_KEYS[answer];
	}
};

/** What the audio check can record for a line: said as written means the subtitles trimmed it */
const AUDIO_LABELS = ['subtitles trimmed', 'really changed', 'really cut', 'unsure'];

const main = async () => {
	process.loadEnvFile(path.join(ROOT, '.env'));
	const argAfter = flag => (process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : null);
	const exportDir = argAfter('--export');
	const importFile = argAfter('--import');
	const mode = ['again', 'audio', 'check', 'verdicts', 'missed'].find(m => process.argv.includes(`--${m}`)) ?? 'label';
	const records = loadFilmRecords();
	let gold = fs.existsSync(GOLD_FILE) ? JSON.parse(fs.readFileSync(GOLD_FILE, 'utf8')) : null;
	if (!gold) {
		const compared = records.map(film => {
			const file = path.join(SCREEN_DIR, `${film._id}.json`);
			return fs.existsSync(file) ? { ...film, screen: JSON.parse(fs.readFileSync(file, 'utf8')) } : null;
		}).filter(film => film && !film.screen.excluded);
		gold = { seed: SEED, sampledWith: METHOD.version, sampledThresholds: METHOD.thresholds, films: [], labels: {}, again: {}, audio: {} };
		for (const { film, stratum, split } of drawFilms(compared)) {
			const { detail } = await compareFilmOnDisk(film);
			gold.films.push({ _id: film._id, title: film.title, year: film.year, stratum, split, primary: detail.primary, items: drawItems(film._id, detail) });
			console.log(`sampled ${film.title} (${film.year}), ${stratum}, ${split}`);
		}
		fs.mkdirSync(path.dirname(GOLD_FILE), { recursive: true });
		save(gold);
	}

	const details = new Map();
	const detailOf = async entry => {
		if (!details.has(entry._id)) {
			const { detail } = await compareFilmOnDisk(records.find(f => f._id === entry._id), { primaryId: entry.primary });
			details.set(entry._id, detail);
		}
		return details.get(entry._id);
	};
	const textOf = (detail, item) => (item.kind === 'page' ? detail.dialogue[item.line].text : detail.screenLines[item.line].text);

	const todo = gold.films.flatMap(entry => entry.items.map(item => ({ entry, item, key: itemKey(entry, item) })));
	// the second labelling's items are fixed by the seed alone, not by the first labels
	const againItems = seeded(todo, t => `again:${t.key}`).slice(0, AGAIN_ITEMS);

	const audioItems = todo.filter(t => t.entry.split === 'test' && t.item.kind === 'page' && ['cut', 'changed'].includes(gold.labels[t.key])).slice(0, AUDIO_ITEMS);

	gold.check ??= {};
	gold.verdicts ??= {};
	gold.missed ??= {};
	// --again and --check label the same seeded 100 items
	const fixedItems = ['again', 'check'].includes(mode);
	if (importFile) {
		const labels = JSON.parse(fs.readFileSync(importFile, 'utf8'));
		if (mode === 'verdicts') {
			const changeOf = new Map(verdictSample(records).map(({ film, change }) => [`verdict:${film._id}`, change]));
			for (const [key, verdict] of Object.entries(labels)) {
				if (!changeOf.has(key)) throw new Error(`${key} isn't a verdict to check`);
				if (!Object.values(VERDICT_KEYS).includes(verdict)) throw new Error(`${key}: "${verdict}" isn't one of ${Object.values(VERDICT_KEYS).join(', ')}`);
				gold.verdicts[key.slice('verdict:'.length)] = { change: changeOf.get(key), verdict };
			}
			save(gold);
			console.log(`${Object.keys(labels).length} verdicts imported; ${Object.keys(gold.verdicts).length} of ${changeOf.size} done`);
			return;
		}
		if (mode === 'missed') {
			const sampleOf = new Map(missedSample(records).map(c => [`missed:${c.film._id}`, c]));
			for (const [key, verdict] of Object.entries(labels)) {
				if (!sampleOf.has(key)) throw new Error(`${key} isn't a film in the missed-verdict check`);
				if (!Object.values(VERDICT_KEYS).includes(verdict)) throw new Error(`${key}: "${verdict}" isn't one of ${Object.values(VERDICT_KEYS).join(', ')}`);
				const { change, pagePasses } = sampleOf.get(key);
				gold.missed[key.slice('missed:'.length)] = { change, pagePasses, verdict };
			}
			save(gold);
			console.log(`${Object.keys(labels).length} answers imported; ${Object.keys(gold.missed).length} of ${sampleOf.size} done`);
			return;
		}
		if (mode === 'audio') {
			const keys = new Set(audioItems.map(t => t.key));
			for (const [key, label] of Object.entries(labels)) {
				if (!keys.has(key)) throw new Error(`${key} isn't a line for the audio check`);
				if (!AUDIO_LABELS.includes(label)) throw new Error(`${key}: "${label}" isn't one of ${AUDIO_LABELS.join(', ')}`);
				gold.audio[key] = label;
			}
			save(gold);
			console.log(`${Object.keys(labels).length} audio answers imported; ${Object.keys(gold.audio).length} of ${keys.size} done`);
			return;
		}
		const target = { again: gold.again, check: gold.check }[mode] ?? gold.labels;
		const allowed = new Map((fixedItems ? againItems : todo).map(t => [t.key, t.item.kind === 'page' ? Object.values(PAGE_KEYS) : Object.values(SCREEN_KEYS)]));
		for (const [key, label] of Object.entries(labels)) {
			if (!allowed.has(key)) throw new Error(`${key} isn't an item to label${fixedItems ? ` with --${mode}` : ''}`);
			if (!allowed.get(key).includes(label)) throw new Error(`${key}: "${label}" isn't one of ${allowed.get(key).join(', ')}`);
			target[key] = label;
		}
		save(gold);
		console.log(`${Object.keys(labels).length} labels imported; ${Object.keys(target).length} of ${allowed.size} done`);
		return;
	}
	const writeFilmFiles = (name, film, items, detail) => {
		fs.writeFileSync(path.join(exportDir, `${name}-items.json`), `${JSON.stringify({ film, items }, null, '\t')}\n`);
		fs.writeFileSync(path.join(exportDir, `${name}-subtitles.txt`), `${detail.screenLines.map(l => `${clock(l.start)}  ${l.text}`).join('\n')}\n`);
		fs.writeFileSync(path.join(exportDir, `${name}-script.txt`), `${detail.dialogue.map(d => `${d.speaker}: ${d.text}`).join('\n')}\n`);
		console.log(`${name}: ${film}, ${items.length} items`);
	};
	if (exportDir && mode === 'verdicts') {
		fs.mkdirSync(exportDir, { recursive: true });
		for (const [n, { film, change }] of verdictSample(records).entries()) {
			const { detail, summary, groups } = await verdictEvidence(film, change, 10);
			const item = { key: `verdict:${film._id}`, kind: 'verdict', change, summary, groups };
			writeFilmFiles(`${String(n + 1).padStart(2, '0')}-${film._id}`, `${film.title} (${film.year})`, [item], detail);
		}
		return;
	}
	if (exportDir && mode === 'missed') {
		fs.mkdirSync(exportDir, { recursive: true });
		for (const [n, { film, change, pagePasses }] of missedSample(records).entries()) {
			const { detail, summary, groups } = await verdictEvidence(film, change, 10, pagePasses);
			// change stays out of the item: the page would show it, and this check is blind to the method's verdict
			const item = { key: `missed:${film._id}`, kind: 'verdict', summary, groups };
			writeFilmFiles(`${String(n + 1).padStart(2, '0')}-${film._id}`, `${film.title} (${film.year})`, [item], detail);
		}
		return;
	}
	if (mode === 'missed') throw new Error('--missed is labelled in the browser: --export <dir> --missed, then npm run screen:label-web -- <dir>');
	if (exportDir && mode === 'audio') {
		fs.mkdirSync(exportDir, { recursive: true });
		for (const [n, entry] of gold.films.entries()) {
			const lines = audioItems.filter(t => t.entry === entry);
			if (lines.length === 0) continue;
			const detail = await detailOf(entry);
			const script = d => `${d.speaker}: ${d.text}`;
			const items = lines.map(({ item, key }) => {
				if (hashOf(textOf(detail, item)) !== item.hash) throw new Error(`${entry.title}: line ${item.line} changed since sampling`);
				const anchor = anchorFor(detail, item.line);
				return {
					key, kind: 'audio', at: clock(detail.screenLines[anchor].start), labelledAs: gold.labels[key],
					line: script(detail.dialogue[item.line]),
					scriptAround: detail.dialogue.slice(Math.max(0, item.line - 2), item.line + 3).map(script),
					subtitlesNearWhereItWouldBe: detail.screenLines.slice(Math.max(0, anchor - 6), anchor + 7).map(l => `${clock(l.start)}  ${l.text}`),
				};
			});
			writeFilmFiles(`${String(n + 1).padStart(2, '0')}-${entry._id}`, `${entry.title} (${entry.year})`, items, detail);
		}
		return;
	}
	if (exportDir) {
		fs.mkdirSync(exportDir, { recursive: true });
		const chosen = new Set((fixedItems ? againItems : todo).map(t => t.key));
		for (const [n, entry] of gold.films.entries()) {
			const detail = await detailOf(entry);
			const items = entry.items.filter(item => chosen.has(itemKey(entry, item))).map(item => {
				if (hashOf(textOf(detail, item)) !== item.hash) throw new Error(`${entry.title}: line ${item.line} changed since sampling`);
				const around = (list, center, radius, show) => list.slice(Math.max(0, center - radius), center + radius + 1).map(show);
				const subtitle = l => `${clock(l.start)}  ${l.text}`;
				const script = d => `${d.speaker}: ${d.text}`;
				return item.kind === 'page'
					? {
						key: itemKey(entry, item), kind: 'script line', question: 'Is this script line said in the film?',
						line: script(detail.dialogue[item.line]),
						scriptAround: around(detail.dialogue, item.line, 2, script),
						subtitlesNearWhereItWouldBe: around(detail.screenLines, anchorFor(detail, item.line), 10, subtitle),
					}
					: {
						key: itemKey(entry, item), kind: 'subtitle line', question: 'Is this subtitle line in the script, even reworded?',
						line: detail.screenLines[item.line].text,
						subtitlesAround: around(detail.screenLines, item.line, 3, subtitle),
						scriptNearWhereItWouldBe: around(detail.dialogue, scriptAnchorFor(detail, item.line), 10, script),
					};
			});
			if (items.length === 0) continue;
			writeFilmFiles(`${String(n + 1).padStart(2, '0')}-${entry._id}`, `${entry.title} (${entry.year})`, items, detail);
		}
		return;
	}

	if (mode === 'verdicts') {
		const queue = verdictSample(records).filter(({ film }) => !gold.verdicts[film._id]);
		console.log(`${queue.length} to go`);
		const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
		try {
			for (const { film, change } of queue) {
				const verdict = await askVerdict(rl, film, change);
				if (verdict === null) break;
				gold.verdicts[film._id] = { change, verdict };
				save(gold);
			}
		} finally {
			rl.close();
		}
		return;
	}

	const queue = mode === 'label' ? todo.filter(t => !gold.labels[t.key])
		: mode === 'again' ? againItems.filter(t => !gold.again[t.key])
			: mode === 'check' ? againItems.filter(t => !gold.check[t.key])
				: audioItems.filter(t => !gold.audio[t.key]);
	console.log(`${queue.length} to go`);
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
	try {
		for (const { entry, item, key } of queue) {
			const detail = await detailOf(entry);
			if (hashOf(textOf(detail, item)) !== item.hash) throw new Error(`${entry.title}: line ${item.line} changed since sampling (parser or subtitles changed)`);
			if (mode === 'audio') {
				const line = detail.dialogue[item.line];
				console.log(`\n=== ${entry.title} (${entry.year}), near ${clock(detail.screenLines[anchorFor(detail, item.line)].start)}`);
				console.log(`You labelled it ${gold.labels[key]}: ${line.speaker}: ${line.text}`);
				const answer = (await rl.question('In the audio: [t] subtitles trimmed it, said as written  [r] really changed or cut  [s] skip  [q] quit > ')).trim().toLowerCase();
				if (answer === 'q') break;
				if (answer === 't' || answer === 'r') gold.audio[key] = answer === 't' ? 'subtitles trimmed' : 'really changed';
			} else {
				const label = await ask(rl, entry, item, detail);
				if (label === null) break;
				gold[{ label: 'labels', again: 'again', check: 'check' }[mode]][key] = label;
			}
			save(gold);
		}
	} finally {
		rl.close();
	}
};

main().catch(error => {
	console.error(error);
	process.exit(1);
});
