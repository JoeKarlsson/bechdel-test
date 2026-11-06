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
const { SITEMAP_URL, parseSitemap, parseScriptPage, scriptFileName, pdfToText } = require('../src/scriptSlug');
const { loadManifest, saveManifest, scriptPathFor, LOCAL_SCRIPTS_DIR } = require('../src/manifest');

// Pages fetched at once, to stay gentle on Script Slug
const CONCURRENCY = 4;
// Shorter than this, even after OCR, the PDF is an excerpt or unreadable
const MIN_SCRIPT_CHARACTERS = 20000;

const fetchOk = async url => {
	const response = await fetch(url, { headers: { 'User-Agent': 'bechdel-test script fetcher' } });
	if (!response.ok) throw new Error(`${response.status} for ${url}`);
	return response;
};

const main = async () => {
	fs.mkdirSync(LOCAL_SCRIPTS_DIR, { recursive: true });
	const manifest = loadManifest();
	const filmsWeHave = new Set(Object.values(manifest).filter(Boolean));
	const queue = parseSitemap(await (await fetchOk(SITEMAP_URL)).text())
		.filter(url => !(scriptFileName(url) in manifest) && !scriptPathFor(scriptFileName(url)));
	console.log(`${queue.length} script pages to check\n`);

	let added = 0;
	let skipped = 0;
	const failures = [];
	const worker = async () => {
		while (queue.length > 0) {
			const pageUrl = queue.shift();
			try {
				const film = parseScriptPage(await (await fetchOk(pageUrl)).text());
				// Not a film with an IMDb id (a TV episode, say), or a film we already have
				if (!film || filmsWeHave.has(film.imdbId)) {
					skipped++;
					continue;
				}
				filmsWeHave.add(film.imdbId);
				const text = await pdfToText(Buffer.from(await (await fetchOk(film.pdfUrl)).arrayBuffer()));
				if (text.trim().length < MIN_SCRIPT_CHARACTERS) {
					throw new Error(`only ${text.trim().length} characters of text in the PDF`);
				}
				const file = scriptFileName(pageUrl);
				fs.writeFileSync(path.join(LOCAL_SCRIPTS_DIR, file), text);
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
