#!/usr/bin/env node
/**
 * Find a clean copy for every local script whose dialogue is unusable (under
 * 90% English words, a bad scan or garbled PDF, or too little dialogue
 * found), on The Daily Script. A copy replaces the file only if its dialogue
 * is clean and it's the same film: same title, year within one, and (when
 * the old text has readable names) shared main speakers. Prints the scripts
 * no source could fix; analyze refuses those.
 *
 *   npm run recover-scripts
 */
const fs = require('fs');
const path = require('path');
const { LISTING_PAGES, parseListing, scriptTextFrom } = require('../src/dailyScript');
const { loadManifest, scriptPathFor, LOCAL_SCRIPTS_DIR } = require('../src/manifest');
const { parseScreenplay } = require('../src/screenplay');
const { comparableTitle, titleFromScriptName } = require('../src/fetchMetadata');
const { cleanScriptText, dialogueEnglishShare } = require('../src/scriptText');
// The bars analyze holds a script to
const { MIN_DIALOGUE_LINES, MIN_DIALOGUE_ENGLISH } = require('../src/analyzeFilm');
// Main speakers a copy must share with the old text to count as the same film
const MIN_SHARED_SPEAKERS = 2;

const fetchBytes = async url => {
	const response = await fetch(url, { headers: { 'User-Agent': 'bechdel-test script fetcher' } });
	if (!response.ok) throw new Error(`${response.status} for ${url}`);
	return Buffer.from(await response.arrayBuffer());
};

/** How usable a script's text is: its dialogue lines, English share, and most frequent speakers */
const measure = text => {
	const dialogue = parseScreenplay(text).scenes.flatMap(scene => scene.blocks).filter(block => block.kind === 'dialogue');
	const counts = {};
	for (const { speaker } of dialogue) counts[speaker] = (counts[speaker] || 0) + 1;
	const speakers = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name]) => name);
	const english = dialogueEnglishShare(dialogue.map(block => block.text)) ?? 0;
	return { lines: dialogue.length, english, speakers, usable: dialogue.length >= MIN_DIALOGUE_LINES && english >= MIN_DIALOGUE_ENGLISH };
};

const main = async () => {
	const listing = [];
	for (const page of LISTING_PAGES) listing.push(...parseListing(new TextDecoder('latin1').decode(await fetchBytes(page))));

	const broken = Object.entries(loadManifest())
		.filter(([file, imdbId]) => imdbId && scriptPathFor(file)?.startsWith(LOCAL_SCRIPTS_DIR))
		.map(([file]) => ({ file, before: measure(fs.readFileSync(scriptPathFor(file), 'utf8')) }))
		.filter(({ before }) => !before.usable);
	console.log(`${broken.length} local scripts with unusable dialogue\n`);

	const unrecovered = [];
	for (const { file, before } of broken) {
		const { title, year } = titleFromScriptName(path.basename(file, '.txt'));
		const candidates = listing.filter(entry => comparableTitle(entry.title) === comparableTitle(title)
			&& (!year || !entry.year || Math.abs(Number(entry.year) - Number(year)) <= 1));
		// Speakers are only a check when the old text's names are readable
		const oldSpeakers = before.lines >= MIN_DIALOGUE_LINES ? before.speakers.slice(0, 5) : [];
		let best = null;
		for (const candidate of candidates) {
			try {
				const raw = await scriptTextFrom(candidate.url, await fetchBytes(candidate.url));
				if (!raw) continue;
				const text = cleanScriptText(raw);
				const after = measure(text);
				const shared = oldSpeakers.filter(name => after.speakers.slice(0, 10).includes(name)).length;
				const sameFilm = oldSpeakers.length < MIN_SHARED_SPEAKERS || shared >= MIN_SHARED_SPEAKERS;
				if (after.usable && sameFilm && (!best || after.english > best.after.english)) best = { candidate, text, after };
			} catch (error) {
				console.log(`${file}: ${candidate.url} failed: ${error.message}`);
			}
		}
		const was = `${before.lines} lines, ${Math.round(before.english * 100)}% English`;
		if (!best) {
			unrecovered.push(`${file.padEnd(55)} ${was}; ${candidates.length ? `${candidates.length} Daily Script copies, none clean or the same film` : 'not on Daily Script'}`);
			continue;
		}
		fs.writeFileSync(scriptPathFor(file), best.text);
		console.log(`${file.padEnd(55)} recovered from ${best.candidate.url}: ${was} -> ${best.after.lines} lines, ${Math.round(best.after.english * 100)}% English`);
	}
	console.log(`\n${broken.length - unrecovered.length} recovered; ${unrecovered.length} still unusable (analyze refuses these):\n${unrecovered.join('\n')}`);
};

main().catch(error => {
	console.error(error.message);
	process.exitCode = 1;
});
