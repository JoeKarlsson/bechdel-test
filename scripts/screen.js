#!/usr/bin/env node
/**
 * Page vs screen: line up each film's script with its subtitles (downloaded
 * by npm run fetch-subtitles) and write data/screen/<id>.json next to the
 * film's data/films/<id>.json. Method: docs/page-vs-screen/METHODS.md.
 *
 *   npm run screen                               every film with subtitles, not yet compared
 *   npm run screen -- taxi-driver.txt tt0073195  these films (script file or IMDb id)
 *   npm run screen -- --force ...                compare again
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { fetchCast, fetchTmdbDetails } = require('../src/fetchMetadata');
const { scriptPathFor } = require('../src/manifest');
const { charactersFromCast, analyzeScriptText } = require('../src/analyzeFilm');
const { parseOpusXml } = require('../src/opus');
const { compareFilm } = require('../src/pageVsScreen');

const ROOT = path.resolve(__dirname, '..');
const FILMS_DIR = path.join(ROOT, 'data/films');
const SCREEN_DIR = path.join(ROOT, 'data/screen');
const SUBTITLES_DIR = path.join(ROOT, 'subtitles/local');
const GENDER_OVERRIDES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/gender-overrides.json'), 'utf8'));

const loadVersions = imdbId => {
	const dir = path.join(SUBTITLES_DIR, imdbId);
	return fs.readdirSync(dir).filter(f => f.endsWith('.xml.gz')).sort().map(f => ({
		id: f.replace(/\.xml\.gz$/, ''),
		...parseOpusXml(zlib.gunzipSync(fs.readFileSync(path.join(dir, f))).toString('utf8')),
	}));
};

const compareOne = async film => {
	const scriptPath = scriptPathFor(film.script.file);
	if (!scriptPath) return 'skipped (script not on this machine)';
	if (!fs.existsSync(path.join(SUBTITLES_DIR, film.idIMDB))) return 'skipped (no subtitles; npm run fetch-subtitles)';
	const scriptText = fs.readFileSync(scriptPath, 'utf8');
	const characters = charactersFromCast(await fetchCast(film.idIMDB));
	const { screenplay, resolved } = analyzeScriptText(scriptText, characters, GENDER_OVERRIDES[film.script.file]);
	const { runtime } = await fetchTmdbDetails(film.idIMDB);
	const record = compareFilm({
		scriptText, screenplay, resolved, characters,
		// the score on the site, so a film analyzed with an older parser stops here
		pageScore: film.bechdelResults.bechdelScore,
		versions: loadVersions(film.idIMDB),
		runtimeSeconds: runtime ? runtime * 60 : null,
	});
	fs.mkdirSync(SCREEN_DIR, { recursive: true });
	fs.writeFileSync(path.join(SCREEN_DIR, `${film._id}.json`), `${JSON.stringify({ _id: film._id, ...record }, null, '\t')}\n`);
	if (record.excluded) return `excluded: ${record.excluded}`;
	const pct = (n, d) => `${Math.round((100 * n) / d)}%`;
	return `${pct(record.words.kept, record.words.page)} of script words on screen, ${pct(record.words.notInScript, record.words.screen)} of screen words not in the script, ${record.subtitles.used} versions, Bechdel ${record.bechdel.page.score} -> ${record.bechdel.strict.score}/${record.bechdel.lenient.score} (${record.bechdel.change})`;
};

const main = async () => {
	process.loadEnvFile(path.join(ROOT, '.env'));
	const args = process.argv.slice(2);
	const force = args.includes('--force');
	const wanted = new Set(args.filter(arg => !arg.startsWith('--')));
	const films = fs.readdirSync(FILMS_DIR).filter(f => f.endsWith('.json'))
		.map(f => JSON.parse(fs.readFileSync(path.join(FILMS_DIR, f), 'utf8')))
		.filter(film => film.script?.file)
		.filter(film => (wanted.size > 0 ? wanted.has(film.script.file) || wanted.has(film.idIMDB) : fs.existsSync(path.join(SUBTITLES_DIR, film.idIMDB))))
		.filter(film => force || wanted.size > 0 || !fs.existsSync(path.join(SCREEN_DIR, `${film._id}.json`)));
	let failed = 0;
	for (const film of films) {
		let status;
		try {
			status = await compareOne(film);
		} catch (error) {
			failed++;
			status = `FAILED: ${error.message}`;
		}
		console.log(`${film.title} (${film.year}): ${status}`);
	}
	if (failed > 0) process.exitCode = 1;
};

main().catch(error => {
	console.error(error);
	process.exit(1);
});
