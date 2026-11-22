#!/usr/bin/env node
/**
 * Save every MovieSum screenplay (2,200, from the MovieSum research dataset)
 * whose film we don't have yet as scripts/local/<title>-<year>.txt, with its
 * IMDb id in scripts/manifest.json, so it needs no `npm run match`.
 *
 *   npm run fetch-moviesum
 */
const fs = require('fs');
const path = require('path');
const { SPLITS, scriptTextOfXml, filmOfRow } = require('../src/movieSum');
const { fetchBytes } = require('../src/downloadScripts');
const { scriptFileName } = require('../src/imsdb');
const { loadManifest, saveManifest, scriptPathFor, LOCAL_SCRIPTS_DIR } = require('../src/manifest');

const main = async () => {
	const manifest = loadManifest();
	const filmsWeHave = new Set(Object.values(manifest));
	fs.mkdirSync(LOCAL_SCRIPTS_DIR, { recursive: true });
	let added = 0;
	for (const split of SPLITS) {
		for (const line of (await fetchBytes(split)).toString('utf8').split('\n').filter(Boolean)) {
			const { title, year, imdbId, xml } = filmOfRow(JSON.parse(line));
			const file = scriptFileName(year ? `${title} ${year}` : title);
			if (filmsWeHave.has(imdbId) || file in manifest || scriptPathFor(file)) continue;
			filmsWeHave.add(imdbId);
			fs.writeFileSync(path.join(LOCAL_SCRIPTS_DIR, file), `${scriptTextOfXml(xml)}\n`);
			manifest[file] = imdbId;
			added++;
			console.log(`${file.padEnd(60)} ${imdbId}`);
		}
	}
	saveManifest(manifest);
	console.log(`\n${added} added to scripts/local/ and scripts/manifest.json.`);
};

main().catch(error => {
	console.error(error.message);
	process.exitCode = 1;
});
