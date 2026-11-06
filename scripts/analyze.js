#!/usr/bin/env node
/**
 * Analyze screenplays and write the site's film data (data/films/<id>.json).
 *
 *   npm run analyze                              every scripts/*.txt not already on the site
 *   npm run analyze -- scripts/heat.txt          one film
 *   npm run analyze -- --force scripts/heat.txt  redo a film that's already on the site
 *   npm run analyze -- --no-ai ...               skip the AI second opinion (a redone film keeps its old one)
 *
 * Each script's film comes from scripts/manifest.json (add new scripts with
 * `npm run match`). Settings come from .env: OMDB, THEMOVIEDB, and for the
 * AI read LITELLM_BASE_URL, LITELLM_API_KEY, AI_MODEL (a LiteLLM alias).
 */
const fs = require('fs');
const path = require('path');
const { fetchMetadata } = require('../src/fetchMetadata');
const { loadManifest } = require('../src/manifest');
const {
	charactersFromCast, analyzeScriptText, runAiAnalysis, aiSectionsOf, buildFilmRecord,
} = require('../src/analyzeFilm');

const ROOT = path.resolve(__dirname, '..');
const FILMS_DIR = path.join(ROOT, 'data/films');
const SCRIPTS_DIR = path.join(ROOT, 'scripts');
const READER_RATINGS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/eval/bechdeltest-ratings.json'), 'utf8'));
// Speaker genders corrected by hand, per script: { "inception.txt": { "ARIADNE": "w" } }
const GENDER_OVERRIDES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/gender-overrides.json'), 'utf8'));
// Films analyzed at once; the AI step makes ~3 large requests per film
const CONCURRENCY = 3;

const parseArgs = argv => {
	const flags = new Set(argv.filter(arg => arg.startsWith('--')));
	const unknown = [...flags].filter(flag => !['--force', '--no-ai'].includes(flag));
	if (unknown.length > 0) {
		throw new Error(`Unknown option ${unknown.join(', ')}`);
	}
	const files = argv.filter(arg => !arg.startsWith('--'));
	return {
		force: flags.has('--force'),
		withAi: !flags.has('--no-ai'),
		scriptPaths: files.length > 0
			? files.map(file => path.resolve(file))
			: fs.readdirSync(SCRIPTS_DIR).filter(file => file.endsWith('.txt')).sort().map(file => path.join(SCRIPTS_DIR, file)),
	};
};

/** Films on the site, findable by the script they came from and by IMDb id */
const loadExistingFilms = () => {
	const byScript = new Map();
	const byImdbId = new Map();
	for (const file of fs.readdirSync(FILMS_DIR).filter(name => name.endsWith('.json'))) {
		const film = JSON.parse(fs.readFileSync(path.join(FILMS_DIR, file), 'utf8'));
		if (film.script?.file) byScript.set(film.script.file, film);
		byImdbId.set(film.idIMDB, film);
	}
	return { byScript, byImdbId };
};

/** bechdeltest.com's reader rating, in the shape the site reads, if the film has one */
const readersRating = imdbId => {
	const rating = READER_RATINGS[imdbId];
	if (!rating) return undefined;
	return { rating: rating.rating, dubious: rating.dubious ? 1 : 0, id: Number(rating.url.match(/\/view\/(\d+)/)?.[1]) || undefined };
};

const analyzeOne = async (scriptPath, context) => {
	const { force, withAi, existingFilms, manifest } = context;
	const script = path.basename(scriptPath);
	if (!(script in manifest)) throw new Error('not in scripts/manifest.json; run npm run match');
	const imdbId = manifest[script];
	if (imdbId === null) return { script, film: '', status: 'skipped (no film in the manifest)' };

	const existing = existingFilms.byScript.get(script) ?? existingFilms.byImdbId.get(imdbId);
	if (existing && !force) {
		return { script, film: `${existing.title} (${existing.year})`, status: 'skipped (on site; --force to redo)' };
	}
	const { omdb, cast, crew, images, details, birthdays } = await fetchMetadata(imdbId);
	const film = `${omdb.Title} (${omdb.Year})`;

	const scriptText = fs.readFileSync(scriptPath, 'utf8');
	const characters = charactersFromCast(cast);
	const { bechdelResults, script: summary, cleaned } = analyzeScriptText(scriptText, characters, GENDER_OVERRIDES[script]);
	// Without a new AI run, keep the old one's whole-script reads, but not its
	// review of the passing scenes: those were the old analysis's scenes
	const ai = withAi
		? await runAiAnalysis({ gateway: context.gateway, cleaned, characters, bechdelResults })
		: aiSectionsOf(existing?.enhancedAnalytics, { keepSceneReview: false });

	// OMDB sometimes changes a film's year (premiere vs. US release), and the
	// year is in the film's URL: a redone film keeps its stored year
	const keepYear = existing && existing.idIMDB === imdbId ? existing.year : undefined;
	const record = buildFilmRecord({
		id: existing ? existing._id : imdbId,
		dateUploaded: existing ? existing.dateUploaded : new Date().toISOString(),
		year: keepYear,
		omdb,
		cast,
		crew,
		details,
		birthdays,
		images,
		bechdelResults,
		script: { file: script, ...summary },
		enhancedAnalytics: Object.keys(ai).length ? ai : undefined,
		bechdelData: readersRating(imdbId) ?? existing?.bechdelData,
	});
	fs.writeFileSync(path.join(FILMS_DIR, `${record._id}.json`), `${JSON.stringify(record, null, 2)}\n`);
	return {
		script,
		film,
		score: bechdelResults.bechdelScore,
		readers: record.bechdelData?.rating,
		status: `${existing ? 'updated' : 'added'}${withAi ? '' : ', no new AI'}`,
	};
};

const printSummary = results => {
	const rows = results.map(r => [
		r.script,
		r.film || '',
		r.score === undefined ? '' : `${r.score}/3 ${r.score === 3 ? 'PASS' : 'fail'}`,
		r.readers === undefined ? '' : `${r.readers}/3`,
		r.error ? `FAILED: ${r.error}` : r.status,
	]);
	const header = ['script', 'film', 'bechdel', 'readers', 'result'];
	const widths = header.map((h, i) => Math.max(h.length, ...rows.map(row => row[i].length)));
	const line = row => row.map((cell, i) => cell.padEnd(widths[i])).join('  ').trimEnd();
	console.log(`\n${line(header)}\n${line(widths.map(w => '-'.repeat(w)))}`);
	rows.forEach(row => console.log(line(row)));
};

const main = async () => {
	if (fs.existsSync(path.join(ROOT, '.env'))) {
		process.loadEnvFile(path.join(ROOT, '.env'));
	}
	const options = parseArgs(process.argv.slice(2));
	const gateway = { baseUrl: process.env.LITELLM_BASE_URL, apiKey: process.env.LITELLM_API_KEY, model: process.env.AI_MODEL };
	const missing = Object.entries({ LITELLM_BASE_URL: gateway.baseUrl, LITELLM_API_KEY: gateway.apiKey, AI_MODEL: gateway.model })
		.filter(([, value]) => !value).map(([name]) => name);
	if (options.withAi && missing.length > 0) {
		throw new Error(`${missing.join(', ')} not set. Add to .env (see .env.example), or pass --no-ai.`);
	}
	const context = { ...options, gateway, existingFilms: loadExistingFilms(), manifest: loadManifest() };

	const results = new Array(options.scriptPaths.length);
	let next = 0;
	const worker = async () => {
		while (next < options.scriptPaths.length) {
			const index = next++;
			const scriptPath = options.scriptPaths[index];
			try {
				results[index] = await analyzeOne(scriptPath, context);
			} catch (error) {
				results[index] = { script: path.basename(scriptPath), error: error.message };
			}
			console.log(`[${results.filter(Boolean).length}/${results.length}] ${results[index].script}: ${results[index].error ? 'failed' : results[index].status}`);
		}
	};
	await Promise.all(Array.from({ length: CONCURRENCY }, worker));

	printSummary(results);
	const failures = results.filter(r => r.error).length;
	if (failures > 0) {
		console.error(`\n${failures} of ${results.length} failed.`);
		process.exitCode = 1;
	}
};

main().catch(error => {
	console.error(error.message);
	process.exitCode = 1;
});
