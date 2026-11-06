#!/usr/bin/env node
/**
 * Score the static analysis against bechdeltest.com's reader ratings
 * (data/eval/bechdeltest-ratings.json) for every script that has one. Uses
 * the cached OMDB/TMDB responses, writes nothing, calls no AI.
 *
 *   npm run eval              summary
 *   npm run eval -- --list    plus every film the parser gets wrong
 */
const fs = require('fs');
const path = require('path');
const { fetchCast } = require('../src/fetchMetadata');
const { loadManifest, scriptPathFor } = require('../src/manifest');
const { charactersFromCast, analyzeScriptText } = require('../src/analyzeFilm');

const ROOT = path.resolve(__dirname, '..');
const RATINGS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/eval/bechdeltest-ratings.json'), 'utf8'));
const GENDER_OVERRIDES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/gender-overrides.json'), 'utf8'));

const pct = (n, d) => `${n}/${d} (${Math.round((100 * n) / d)}%)`;

const main = async () => {
	process.loadEnvFile(path.join(ROOT, '.env'));
	const list = process.argv.includes('--list');
	const rows = [];
	const unscored = [];
	for (const [file, imdbId] of Object.entries(loadManifest())) {
		const truth = imdbId && RATINGS[imdbId];
		if (!truth) continue;
		const scriptPath = scriptPathFor(file);
		if (!scriptPath) {
			unscored.push(`${file}: not on this machine (a scripts/local/ script)`);
			continue;
		}
		const cast = await fetchCast(imdbId);
		const scriptText = fs.readFileSync(scriptPath, 'utf8');
		try {
			const { bechdelResults } = analyzeScriptText(scriptText, charactersFromCast(cast), GENDER_OVERRIDES[file]);
			rows.push({ file, title: truth.title, truth: truth.rating, ours: bechdelResults.bechdelScore });
		} catch (error) {
			unscored.push(`${file}: ${error.message}`);
		}
	}

	const n = rows.length;
	const passAgree = rows.filter(r => (r.truth === 3) === (r.ours === 3)).length;
	const exact = rows.filter(r => r.truth === r.ours).length;
	const truePasses = rows.filter(r => r.truth === 3);
	const ourPasses = rows.filter(r => r.ours === 3);
	const caught = truePasses.filter(r => r.ours === 3).length;
	const right = ourPasses.filter(r => r.truth === 3).length;
	console.log(`${n} films with a reader rating (${truePasses.length} pass)${unscored.length ? `; ${unscored.length} not scored:\n  ${unscored.join('\n  ')}` : ''}`);
	console.log(`pass/fail agrees:   ${pct(passAgree, n)}   (calling everything a fail: ${pct(n - truePasses.length, n)})`);
	console.log(`exact score:        ${pct(exact, n)}`);
	console.log(`real passes found:  ${pct(caught, truePasses.length)}`);
	console.log(`our passes correct: ${ourPasses.length ? pct(right, ourPasses.length) : 'none'}`);
	console.log('\nreaders (rows) vs parser (columns)');
	console.log(`     ${[0, 1, 2, 3].map(s => String(s).padStart(4)).join('')}`);
	for (const t of [0, 1, 2, 3]) {
		console.log(`  ${t}  ${[0, 1, 2, 3].map(o => String(rows.filter(r => r.truth === t && r.ours === o).length).padStart(4)).join('')}`);
	}
	if (list) {
		console.log('\nwrong on pass/fail:');
		rows.filter(r => (r.truth === 3) !== (r.ours === 3)).forEach(r => console.log(`  ${r.title} (${r.file}): readers ${r.truth}, parser ${r.ours}`));
	}
};

main().catch(error => {
	console.error(error.message);
	process.exitCode = 1;
});
