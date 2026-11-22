#!/usr/bin/env node
/**
 * Download the screenplays The Pudding used for its film dialogue study
 * (pudding.cool/2017/03/film-dialogue) for films not in the manifest yet,
 * as text in scripts/local/ (gitignored: the scripts belong to their
 * writers, so we analyze them but don't republish them). Their sheet names
 * each film's IMDb id, so the manifest entry is written here too and
 * `npm run match` isn't needed. Many of the 2016 links are dead; those are
 * listed at the end. PDFs need poppler and tesseract, as for Script Slug.
 *
 *   npm run fetch-pudding
 */
const fs = require('fs');
const path = require('path');
const { SOURCES_URL, parseSources } = require('../src/pudding');
const { scriptTextFrom } = require('../src/dailyScript');
const { scriptFileName } = require('../src/imsdb');
const { loadManifest, saveManifest, scriptPathFor, LOCAL_SCRIPTS_DIR } = require('../src/manifest');
const { cleanScriptText } = require('../src/scriptText');

// Files fetched at once; the links spread over many small hosts
const CONCURRENCY = 4;
// Shorter than this, the file holds a stub or an excerpt, not a screenplay
const MIN_SCRIPT_CHARACTERS = 20000;

const fetchOk = async url => {
	const response = await fetch(url, { headers: { 'User-Agent': 'bechdel-test script fetcher' }, signal: AbortSignal.timeout(60000) });
	if (!response.ok) throw new Error(`${response.status}`);
	return response;
};

const main = async () => {
	fs.mkdirSync(LOCAL_SCRIPTS_DIR, { recursive: true });
	const manifest = loadManifest();
	const queue = parseSources(await (await fetchOk(SOURCES_URL)).text(), new Set(Object.values(manifest).filter(Boolean)));
	console.log(`${queue.length} films to fetch\n`);

	let added = 0;
	const failures = [];
	const worker = async () => {
		while (queue.length > 0) {
			const film = queue.shift();
			try {
				const text = await scriptTextFrom(film.url, Buffer.from(await (await fetchOk(film.url)).arrayBuffer()));
				if (text === null) throw new Error('not a format we read');
				if (text.trim().length < MIN_SCRIPT_CHARACTERS) throw new Error(`only ${text.trim().length} characters`);
				// A remake shares its title with the original, so the year tells them apart
				let file = scriptFileName(film.title);
				if (file in manifest || scriptPathFor(file)) file = scriptFileName(`${film.title} ${film.year}`);
				if (file in manifest || scriptPathFor(file)) throw new Error(`${file} is taken`);
				fs.writeFileSync(path.join(LOCAL_SCRIPTS_DIR, file), cleanScriptText(text));
				manifest[file] = film.imdbId;
				added++;
				console.log(`${file.padEnd(60)} ${film.imdbId.padEnd(11)} ${film.title} (${film.year})`);
			} catch (error) {
				failures.push(`${film.title} (${film.year}) ${film.url}: ${error.message}`);
			}
		}
	};
	try {
		await Promise.all(Array.from({ length: CONCURRENCY }, worker));
	} finally {
		saveManifest(manifest);
	}

	if (failures.length > 0) {
		console.log(`\nNot downloaded (${failures.length}):\n${failures.sort().join('\n')}`);
	}
	console.log(`\n${added} added to scripts/local/ and the manifest.`);
};

main().catch(error => {
	console.error(error.message);
	process.exitCode = 1;
});
