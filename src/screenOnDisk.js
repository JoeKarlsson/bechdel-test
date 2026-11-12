// Page vs screen for a film on this machine: its script, cached cast and
// runtime, and the subtitles npm run fetch-subtitles downloaded. Shared by
// npm run screen, screen:label and screen:eval.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { fetchCast, fetchTmdbDetails } = require('./fetchMetadata');
const { scriptPathFor } = require('./manifest');
const { charactersFromCast, analyzeScriptText } = require('./analyzeFilm');
const { parseOpusXml } = require('./opus');
const { compareFilm } = require('./pageVsScreen');

const ROOT = path.resolve(__dirname, '..');
const FILMS_DIR = path.join(ROOT, 'data/films');
const SCREEN_DIR = path.join(ROOT, 'data/screen');
const SUBTITLES_DIR = path.join(ROOT, 'subtitles/local');
const GENDER_OVERRIDES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/gender-overrides.json'), 'utf8'));

const loadFilmRecords = () => fs.readdirSync(FILMS_DIR).filter(f => f.endsWith('.json'))
	.map(f => JSON.parse(fs.readFileSync(path.join(FILMS_DIR, f), 'utf8')));

const hasSubtitles = film => fs.existsSync(path.join(SUBTITLES_DIR, film.idIMDB));

const loadVersions = imdbId => {
	const dir = path.join(SUBTITLES_DIR, imdbId);
	return fs.readdirSync(dir).filter(f => f.endsWith('.xml.gz')).sort().map(f => ({
		id: f.replace(/\.xml\.gz$/, ''),
		...parseOpusXml(zlib.gunzipSync(fs.readFileSync(path.join(dir, f))).toString('utf8')),
	}));
};

/** compareFilm for a data/films record; throws when its script or subtitles aren't on this machine */
const compareFilmOnDisk = async (film, { primaryId = null } = {}) => {
	const scriptPath = scriptPathFor(film.script.file);
	if (!scriptPath) throw new Error('script not on this machine');
	if (!hasSubtitles(film)) throw new Error('no subtitles; run npm run fetch-subtitles');
	const scriptText = fs.readFileSync(scriptPath, 'utf8');
	const characters = charactersFromCast(await fetchCast(film.idIMDB));
	const { screenplay, resolved } = analyzeScriptText(scriptText, characters, GENDER_OVERRIDES[film.script.file]);
	const { runtime } = await fetchTmdbDetails(film.idIMDB);
	return compareFilm({
		scriptText, screenplay, resolved, characters,
		// the score on the site, so a film analyzed with an older parser stops here
		pageScore: film.bechdelResults.bechdelScore,
		versions: loadVersions(film.idIMDB),
		runtimeSeconds: runtime ? runtime * 60 : null,
		primaryId,
	});
};

module.exports = { compareFilmOnDisk, loadFilmRecords, hasSubtitles, SCREEN_DIR, ROOT };
