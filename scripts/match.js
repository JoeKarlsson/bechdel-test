#!/usr/bin/env node
/**
 * Guess the film for every script not yet in scripts/manifest.json, by title
 * on OMDB, and add the guesses. Each guess shows how many of the script's
 * main speakers are characters in the film's cast; one or none usually means
 * a remake, a TV series or another film of that title. Check those: fix a
 * wrong id by hand in the manifest (or put the year in the file name and
 * delete the entry to retry), and set null for a script with no released film.
 *
 *   npm run match
 */
const fs = require('fs');
const path = require('path');
const { matchScriptByTitle, fetchCast } = require('../src/fetchMetadata');
const { loadManifest, saveManifest, listScriptPaths, scriptPathFor } = require('../src/manifest');
const { speakersInCast, CONFIRMED_AT } = require('../src/castCheck');

/** "cast 7" when the script's speakers are in the film's cast, or a warning to check it */
const castFit = async (file, imdbId) => {
	try {
		const shared = speakersInCast(fs.readFileSync(scriptPathFor(file), 'utf8'), await fetchCast(imdbId)).length;
		return shared >= CONFIRMED_AT ? `cast ${shared}` : `CHECK: ${shared} speakers in the cast`;
	} catch (error) {
		return `CHECK: ${error.message}`;
	}
};

const main = async () => {
	process.loadEnvFile(path.resolve(__dirname, '../.env'));
	const manifest = loadManifest();
	const unmatched = listScriptPaths().map(scriptPath => path.basename(scriptPath)).filter(file => !(file in manifest));
	const idsInUse = new Map(Object.entries(manifest).filter(([, id]) => id).map(([file, id]) => [id, file]));
	let failures = 0;
	const toCheck = [];
	for (const file of unmatched) {
		try {
			const film = await matchScriptByTitle(path.basename(file, '.txt'));
			const clash = idsInUse.get(film.imdbId);
			if (clash) throw new Error(`matched ${film.title} (${film.year}), already used by ${clash}`);
			manifest[file] = film.imdbId;
			idsInUse.set(film.imdbId, file);
			const fit = await castFit(file, film.imdbId);
			if (fit.startsWith('CHECK')) toCheck.push(file);
			console.log(`${file.padEnd(48)} ${film.imdbId.padEnd(11)} ${`${film.title} (${film.year})`.padEnd(50)} ${fit}`);
		} catch (error) {
			failures++;
			console.log(`${file.padEnd(48)} NOT MATCHED: ${error.message}`);
		}
	}
	saveManifest(manifest);
	console.log(`\n${unmatched.length - failures} matched, ${failures} not.`);
	if (toCheck.length > 0) console.log(`Check these ${toCheck.length} by hand: ${toCheck.join(' ')}`);
	if (failures > 0) process.exitCode = 1;
};

main().catch(error => {
	console.error(error.message);
	process.exitCode = 1;
});
