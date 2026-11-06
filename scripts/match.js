#!/usr/bin/env node
/**
 * Guess the film for every script not yet in scripts/manifest.json, by title
 * on OMDB, and add the guesses. Check each one: fix a wrong id by hand in the
 * manifest (or put the year in the file name and delete the entry to retry),
 * and set null for a script with no released film.
 *
 *   npm run match
 */
const path = require('path');
const { matchScriptByTitle } = require('../src/fetchMetadata');
const { loadManifest, saveManifest, listScriptPaths } = require('../src/manifest');

const main = async () => {
	process.loadEnvFile(path.resolve(__dirname, '../.env'));
	const manifest = loadManifest();
	const unmatched = listScriptPaths().map(scriptPath => path.basename(scriptPath)).filter(file => !(file in manifest));
	const idsInUse = new Map(Object.entries(manifest).filter(([, id]) => id).map(([file, id]) => [id, file]));
	let failures = 0;
	for (const file of unmatched) {
		try {
			const film = await matchScriptByTitle(path.basename(file, '.txt'));
			const clash = idsInUse.get(film.imdbId);
			if (clash) throw new Error(`matched ${film.title} (${film.year}), already used by ${clash}`);
			manifest[file] = film.imdbId;
			idsInUse.set(film.imdbId, file);
			console.log(`${file.padEnd(48)} ${film.imdbId.padEnd(11)} ${film.title} (${film.year})`);
		} catch (error) {
			failures++;
			console.log(`${file.padEnd(48)} NOT MATCHED: ${error.message}`);
		}
	}
	saveManifest(manifest);
	console.log(`\n${unmatched.length - failures} matched, ${failures} not. Check the matches in scripts/manifest.json.`);
	if (failures > 0) process.exitCode = 1;
};

main().catch(error => {
	console.error(error.message);
	process.exitCode = 1;
});
