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
const { SOURCES_URL, parseSources } = require('../src/pudding');
const { downloadScripts, fetchBytes } = require('../src/downloadScripts');
const { scriptFileName } = require('../src/imsdb');
const { loadManifest, saveManifest, scriptPathFor } = require('../src/manifest');

const main = async () => {
	const manifest = loadManifest();
	const queue = [];
	const taken = file => file in manifest || scriptPathFor(file) || queue.some(film => film.file === file);
	for (const film of parseSources((await fetchBytes(SOURCES_URL)).toString(), new Set(Object.values(manifest).filter(Boolean)))) {
		// A remake shares its title with the original, so the year tells them apart
		const file = [scriptFileName(film.title), scriptFileName(`${film.title} ${film.year}`)].find(name => !taken(name));
		if (file) queue.push({ ...film, file });
	}
	console.log(`${queue.length} films to fetch\n`);

	let added = 0;
	let failures;
	try {
		failures = await downloadScripts(queue, film => {
			manifest[film.file] = film.imdbId;
			added++;
			console.log(`${film.file.padEnd(60)} ${film.imdbId.padEnd(11)} ${film.title} (${film.year})`);
		});
	} finally {
		saveManifest(manifest);
	}

	if (failures.length > 0) {
		console.log(`\nNot downloaded (${failures.length}):\n${failures.join('\n')}`);
	}
	console.log(`\n${added} added to scripts/local/ and the manifest.`);
};

main().catch(error => {
	console.error(error.message);
	process.exitCode = 1;
});
