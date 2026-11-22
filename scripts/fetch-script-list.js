#!/usr/bin/env node
/**
 * Download the scripts in a JSON list ([{ title, year, url }], from any site)
 * whose titles we don't have yet, as scripts/local/<title>-<year>.txt. Then
 * `npm run match` gives each one its film. PDFs need poppler and tesseract.
 * --slow fetches one file every 8 seconds, for the Wayback Machine and
 * other sites that throttle.
 *
 *   npm run fetch-script-list -- list.json [--slow]
 */
const fs = require('fs');
const { downloadScripts, SLOW_SITE } = require('../src/downloadScripts');
const { queueNewTitles } = require('../src/scriptList');

const main = async () => {
	const args = process.argv.slice(2);
	const listPath = args.find(arg => !arg.startsWith('--'));
	if (!listPath) throw new Error('Usage: npm run fetch-script-list -- list.json [--slow]');
	const queue = queueNewTitles(JSON.parse(fs.readFileSync(listPath, 'utf8')));
	console.log(`${queue.length} scripts to download\n`);
	let added = 0;
	const failures = await downloadScripts(queue, script => {
		added++;
		console.log(`${script.file.padEnd(60)} ${script.title}`);
	}, args.includes('--slow') ? SLOW_SITE : {});
	if (failures.length > 0) {
		console.log(`\nNot downloaded (${failures.length}):\n${failures.join('\n')}`);
	}
	console.log(`\n${added} added to scripts/local/. Next: npm run match, and check the matches in scripts/manifest.json.`);
};

main().catch(error => {
	console.error(error.message);
	process.exitCode = 1;
});
