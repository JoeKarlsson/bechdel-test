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
const { LISTING_PAGES, parseListing, filmTitle } = require('../src/dailyScript');
const { downloadScripts, fetchBytes } = require('../src/downloadScripts');
const { queueNewTitles } = require('../src/scriptList');

const main = async () => {
	const listed = [];
	for (const page of LISTING_PAGES) {
		listed.push(...parseListing((await fetchBytes(page)).toString('latin1')).map(script => ({ ...script, title: filmTitle(script.title) })));
	}
	const queue = queueNewTitles(listed);
	console.log(`${queue.length} scripts to download\n`);
	let added = 0;
	const failures = await downloadScripts(queue, script => {
		added++;
		console.log(`${script.file.padEnd(60)} ${script.title}`);
	});
	if (failures.length > 0) {
		console.log(`\nNot downloaded (${failures.length}):\n${failures.join('\n')}`);
	}
	console.log(`\n${added} added to scripts/local/. Next: npm run match, and check the matches in scripts/manifest.json.`);
};

main().catch(error => {
	console.error(error.message);
	process.exitCode = 1;
});
