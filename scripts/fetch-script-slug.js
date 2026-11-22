#!/usr/bin/env node
/**
 * Download every film script on Script Slug whose film isn't in the manifest
 * yet, as text in scripts/local/ (gitignored: Script Slug's scripts belong to
 * their writers, so we analyze them but don't republish them). Each page
 * names its film's IMDb id, so the manifest entry is written here too and
 * `npm run match` isn't needed. Scanned PDFs are OCRed. Needs pdftotext
 * and pdftoppm (brew install poppler) and tesseract (brew install tesseract).
 *
 *   npm run fetch-script-slug
 */
const fs = require('fs');
const path = require('path');
const { SITEMAP_URL, parseSitemap, parseScriptPage, scriptFileName } = require('../src/scriptSlug');
const { pdfToText } = require('../src/pdfText');
const { loadManifest, saveManifest, scriptPathFor, LOCAL_SCRIPTS_DIR } = require('../src/manifest');
const { cleanScriptText } = require('../src/scriptText');
const { fetchBytes, MIN_SCRIPT_CHARACTERS } = require('../src/downloadScripts');

// Pages fetched at once, to stay gentle on Script Slug
const CONCURRENCY = 4;

const main = async () => {
	fs.mkdirSync(LOCAL_SCRIPTS_DIR, { recursive: true });
	const manifest = loadManifest();
	// Only films whose script is on disk: a manifest entry whose download was lost gets fetched again
	const filmsWeHave = new Set(Object.entries(manifest).filter(([file, imdbId]) => imdbId && scriptPathFor(file)).map(([, imdbId]) => imdbId));
	const queue = parseSitemap((await fetchBytes(SITEMAP_URL)).toString())
		.filter(url => manifest[scriptFileName(url)] !== null && !scriptPathFor(scriptFileName(url)));
	console.log(`${queue.length} script pages to check\n`);

	let added = 0;
	let skipped = 0;
	const failures = [];
	const worker = async () => {
		while (queue.length > 0) {
			const pageUrl = queue.shift();
			try {
				const film = parseScriptPage((await fetchBytes(pageUrl)).toString());
				// Not a film with an IMDb id (a TV episode, say), or a film we already have
				if (!film || filmsWeHave.has(film.imdbId)) {
					skipped++;
					continue;
				}
				filmsWeHave.add(film.imdbId);
				const text = await pdfToText(await fetchBytes(film.pdfUrl));
				if (text.trim().length < MIN_SCRIPT_CHARACTERS) {
					throw new Error(`only ${text.trim().length} characters of text in the PDF`);
				}
				const file = scriptFileName(pageUrl);
				fs.writeFileSync(path.join(LOCAL_SCRIPTS_DIR, file), cleanScriptText(text));
				manifest[file] = film.imdbId;
				added++;
				console.log(`${file.padEnd(60)} ${film.imdbId.padEnd(11)} ${film.title} (${film.year})`);
			} catch (error) {
				failures.push(`${pageUrl}: ${error.message}`);
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
	console.log(`\n${added} added to scripts/local/ and the manifest; ${skipped} skipped (not a film, or a film we have).`);
};

main().catch(error => {
	console.error(error.message);
	process.exitCode = 1;
});
