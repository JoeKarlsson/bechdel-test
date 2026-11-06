#!/usr/bin/env node
/**
 * Download every movie script on IMSDb that we don't have yet, as
 * scripts/local/<title>.txt (gitignored: the scripts belong to their writers,
 * so we analyze them but don't republish them). Then run `npm run match` to
 * give each one its film.
 *
 *   npm run fetch-scripts
 */
const fs = require('fs');
const path = require('path');
const { IMSDB, scriptFileName, parseScriptIndex, parseScriptPageUrl, parseScriptText } = require('../src/imsdb');
const { listScriptPaths, LOCAL_SCRIPTS_DIR } = require('../src/manifest');

// Pages fetched at once, to stay gentle on IMSDb
const CONCURRENCY = 4;
// Shorter than this, the page holds a stub or an excerpt, not a screenplay
const MIN_SCRIPT_CHARACTERS = 20000;

// IMSDb serves ISO-8859-1
const fetchPage = async url => {
	const response = await fetch(url, { headers: { 'User-Agent': 'bechdel-test script fetcher' } });
	if (!response.ok) throw new Error(`${response.status} for ${url}`);
	return new TextDecoder('latin1').decode(await response.arrayBuffer());
};

const downloadScript = async ({ title, moviePageUrl }, file) => {
	const scriptPageUrl = parseScriptPageUrl(await fetchPage(moviePageUrl));
	if (!scriptPageUrl) throw new Error('no script page linked');
	const text = parseScriptText(await fetchPage(scriptPageUrl));
	if (!text) throw new Error(`no <pre> screenplay on ${scriptPageUrl}`);
	if (text.trim().length < MIN_SCRIPT_CHARACTERS) {
		throw new Error(`only ${text.trim().length} characters on ${scriptPageUrl}`);
	}
	fs.writeFileSync(path.join(LOCAL_SCRIPTS_DIR, file), text);
	console.log(`${file.padEnd(60)} ${title}`);
};

const main = async () => {
	fs.mkdirSync(LOCAL_SCRIPTS_DIR, { recursive: true });
	const existing = new Set(listScriptPaths().map(scriptPath => path.basename(scriptPath)));
	const queue = [];
	for (const movie of parseScriptIndex(await fetchPage(`${IMSDB}/all-scripts.html`))) {
		const file = scriptFileName(movie.title);
		// Older scripts were saved without the leading article ("grand-budapest-hotel.txt")
		if (existing.has(file) || existing.has(file.replace(/^(the|a|an)-/, ''))) continue;
		existing.add(file);
		queue.push({ movie, file });
	}
	console.log(`${queue.length} scripts to download\n`);

	const failures = [];
	const worker = async () => {
		while (queue.length > 0) {
			const { movie, file } = queue.shift();
			try {
				await downloadScript(movie, file);
			} catch (error) {
				failures.push(`${movie.title}: ${error.message}`);
			}
		}
	};
	await Promise.all(Array.from({ length: CONCURRENCY }, worker));

	if (failures.length > 0) {
		console.log(`\nNot downloaded (${failures.length}):\n${failures.sort().join('\n')}`);
	}
	console.log('\nNext: npm run match, and check the matches in scripts/manifest.json.');
};

main().catch(error => {
	console.error(error.message);
	process.exitCode = 1;
});
