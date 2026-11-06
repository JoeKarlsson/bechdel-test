#!/usr/bin/env node
/**
 * Analyze screenplays and write the site's film data (data/films/<id>.json).
 *
 *   npm run analyze                              every scripts/*.txt not already on the site
 *   npm run analyze -- scripts/heat.txt          one film
 *   npm run analyze -- --force scripts/heat.txt  redo a film that's already on the site
 *   npm run analyze -- --no-ai ...               skip the AI second opinion (a redone film keeps its old one)
 *
 * Name a script "deep-cover-1992.txt" to pin the year when the title alone
 * matches the wrong film. Keys come from .env: OMDB, THEMOVIEDB, CLAUDE_API_KEY.
 */
const fs = require('fs');
const path = require('path');
const { fetchMetadata } = require('../src/fetchMetadata');
const {
	charactersFromCast, analyzeScriptText, runAiAnalysis, aiSectionsOf, buildFilmRecord,
} = require('../src/analyzeFilm');

const ROOT = path.resolve(__dirname, '..');
const FILMS_DIR = path.join(ROOT, 'data/films');
const SCRIPTS_DIR = path.join(ROOT, 'scripts');
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

const loadExistingFilms = () => {
	const byImdbId = new Map();
	for (const file of fs.readdirSync(FILMS_DIR).filter(name => name.endsWith('.json'))) {
		const film = JSON.parse(fs.readFileSync(path.join(FILMS_DIR, file), 'utf8'));
		byImdbId.set(film.idIMDB, film);
	}
	return byImdbId;
};

const analyzeOne = async (scriptPath, { force, withAi, existingFilms, claimedBy }) => {
	const script = path.basename(scriptPath);
	const { omdb, cast, images } = await fetchMetadata(path.basename(scriptPath, '.txt'));
	const film = `${omdb.Title} (${omdb.Year})`;

	// Two scripts resolving to one film means a title matched the wrong film
	if (claimedBy.has(omdb.imdbID)) {
		throw new Error(`matched ${film}, same as ${claimedBy.get(omdb.imdbID)}; add the year to the file name`);
	}
	claimedBy.set(omdb.imdbID, script);

	const existing = existingFilms.get(omdb.imdbID);
	if (existing && !force) {
		return { script, film, status: 'skipped (on site; --force to redo)' };
	}

	const scriptText = fs.readFileSync(scriptPath, 'utf8');
	const characters = charactersFromCast(cast);
	const { bechdelResults, staticAnalytics, cleaned } = analyzeScriptText(scriptText, characters);
	const ai = withAi
		? await runAiAnalysis({ apiKey: process.env.CLAUDE_API_KEY, cleaned, characters, bechdelResults })
		: aiSectionsOf(existing?.enhancedAnalytics);

	const record = buildFilmRecord({
		id: existing ? existing._id : omdb.imdbID,
		dateUploaded: existing ? existing.dateUploaded : new Date().toISOString(),
		omdb,
		cast,
		images,
		bechdelResults,
		enhancedAnalytics: { ...ai, ...staticAnalytics },
		bechdelData: existing?.bechdelData,
	});
	fs.writeFileSync(path.join(FILMS_DIR, `${record._id}.json`), `${JSON.stringify(record, null, 2)}\n`);
	return {
		script,
		film,
		score: bechdelResults.bechdelScore,
		status: `${existing ? 'updated' : 'added'}${withAi ? '' : ', no new AI'}`,
	};
};

const printSummary = results => {
	const rows = results.map(r => [
		r.script,
		r.film || '',
		r.score === undefined ? '' : `${r.score}/3 ${r.score === 3 ? 'PASS' : 'fail'}`,
		r.error ? `FAILED: ${r.error}` : r.status,
	]);
	const header = ['script', 'film', 'bechdel', 'result'];
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
	if (options.withAi && !process.env.CLAUDE_API_KEY) {
		throw new Error('CLAUDE_API_KEY is not set. Add it to .env, or pass --no-ai.');
	}
	const context = { ...options, existingFilms: loadExistingFilms(), claimedBy: new Map() };

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
