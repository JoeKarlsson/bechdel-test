#!/usr/bin/env node
/**
 * Hand-label a sample of page vs screen results, blind to what the pipeline
 * decided (docs/page-vs-screen/METHODS.md §6). Labels go to
 * data/eval/screen-gold.json as line numbers and text hashes, never text.
 *
 *   npm run screen:label             draw the sample (first run), then label what's left; quit any time
 *   npm run screen:label -- --again  label 100 already-labelled items a second time (agreement with yourself)
 *   npm run screen:label -- --audio  for test-set lines labelled cut or changed, note what the film's audio says
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline/promises');
const { compareFilmOnDisk, loadFilmRecords, SCREEN_DIR, ROOT } = require('../src/screenOnDisk');
const { METHOD } = require('../src/pageVsScreen');

const GOLD_FILE = path.join(ROOT, 'data/eval/screen-gold.json');
const SEED = 'screen-gold-2026-11-12';
const FILMS = 20;
const PAGE_ITEMS = 30;
const SCREEN_ITEMS = 10;
const AGAIN_ITEMS = 100;
const AUDIO_ITEMS = 100;

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

const main = async () => {
	process.loadEnvFile(path.join(ROOT, '.env'));
	const mode = process.argv.includes('--again') ? 'again' : process.argv.includes('--audio') ? 'audio' : 'label';
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

	const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
	const details = new Map();
	const detailOf = async entry => {
		if (!details.has(entry._id)) {
			const { detail } = await compareFilmOnDisk(records.find(f => f._id === entry._id));
			if (detail.primary !== entry.primary) throw new Error(`${entry.title}: the subtitle version changed since sampling`);
			details.set(entry._id, detail);
		}
		return details.get(entry._id);
	};
	const textOf = (detail, item) => (item.kind === 'page' ? detail.dialogue[item.line].text : detail.screenLines[item.line].text);

	const todo = gold.films.flatMap(entry => entry.items.map(item => ({ entry, item, key: itemKey(entry, item) })));
	const queue = mode === 'label' ? todo.filter(t => !gold.labels[t.key])
		: mode === 'again' ? seeded(todo.filter(t => gold.labels[t.key] && gold.labels[t.key] !== 'unsure'), t => `again:${t.key}`).slice(0, AGAIN_ITEMS).filter(t => !gold.again[t.key])
			: todo.filter(t => t.entry.split === 'test' && t.item.kind === 'page' && ['cut', 'changed'].includes(gold.labels[t.key])).slice(0, AUDIO_ITEMS).filter(t => !gold.audio[t.key]);
	console.log(`${queue.length} to go`);
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
				(mode === 'label' ? gold.labels : gold.again)[key] = label;
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
