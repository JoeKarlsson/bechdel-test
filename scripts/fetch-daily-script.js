#!/usr/bin/env node
/**
 * Download every film script on The Daily Script (dailyscript.com) whose
 * title we don't have yet, as scripts/local/<title>-<year>.txt (gitignored:
 * the scripts belong to their writers, so we analyze them but don't
 * republish them). The year in the file name pins `npm run match`, which
 * gives each one its film next. PDFs need poppler and tesseract.
 *
 *   npm run fetch-daily-script
 */
const fs = require('fs');
const path = require('path');
const { LISTING_PAGES, parseListing, filmTitle, scriptTextFrom } = require('../src/dailyScript');
const { scriptFileName } = require('../src/imsdb');
const { comparableTitle, titleFromScriptName } = require('../src/fetchMetadata');
const { loadManifest, listScriptPaths, LOCAL_SCRIPTS_DIR } = require('../src/manifest');
const { cleanScriptText } = require('../src/scriptText');

// Files fetched at once, to stay gentle on The Daily Script
const CONCURRENCY = 4;
// Shorter than this, the file holds a stub or an excerpt, not a screenplay
const MIN_SCRIPT_CHARACTERS = 20000;

const fetchBytes = async url => {
	const response = await fetch(url, { headers: { 'User-Agent': 'bechdel-test script fetcher' }, signal: AbortSignal.timeout(60000) });
	if (!response.ok) throw new Error(`${response.status}`);
	return Buffer.from(await response.arrayBuffer());
};

const main = async () => {
	fs.mkdirSync(LOCAL_SCRIPTS_DIR, { recursive: true });
	const files = [...Object.keys(loadManifest()), ...listScriptPaths().map(scriptPath => path.basename(scriptPath))];
	const titlesWeHave = new Set(files.map(file => comparableTitle(titleFromScriptName(path.basename(file, '.txt')).title)));
	const queue = [];
	for (const page of LISTING_PAGES) {
		for (const script of parseListing((await fetchBytes(page)).toString('latin1'))) {
			const title = filmTitle(script.title);
			if (titlesWeHave.has(comparableTitle(title))) continue;
			// A film listed twice (two drafts) keeps the first
			titlesWeHave.add(comparableTitle(title));
			queue.push({ ...script, title, file: scriptFileName(script.year ? `${title} ${script.year}` : title) });
		}
	}
	console.log(`${queue.length} scripts to download\n`);

	let added = 0;
	const failures = [];
	const worker = async () => {
		while (queue.length > 0) {
			const script = queue.shift();
			try {
				const text = await scriptTextFrom(script.url, await fetchBytes(script.url));
				if (text === null) throw new Error('not a format we read');
				if (text.trim().length < MIN_SCRIPT_CHARACTERS) throw new Error(`only ${text.trim().length} characters`);
				fs.writeFileSync(path.join(LOCAL_SCRIPTS_DIR, script.file), cleanScriptText(text));
				added++;
				console.log(`${script.file.padEnd(60)} ${script.title}`);
			} catch (error) {
				failures.push(`${script.title} ${script.url}: ${error.message}`);
			}
		}
	};
	await Promise.all(Array.from({ length: CONCURRENCY }, worker));

	if (failures.length > 0) {
		console.log(`\nNot downloaded (${failures.length}):\n${failures.sort().join('\n')}`);
	}
	console.log(`\n${added} added to scripts/local/. Next: npm run match, and check the matches in scripts/manifest.json.`);
};

main().catch(error => {
	console.error(error.message);
	process.exitCode = 1;
});
