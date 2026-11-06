// Film metadata by IMDb id: OMDB (title, year, plot, ratings) and TMDB (cast
// with genders, poster and backdrop). Responses are cached on disk under
// .cache/http/, so re-running a film doesn't call the APIs again; delete that
// folder to refetch. bechdeltest.com's API is gone (HTTP 410), so readers'
// scores are no longer fetched; films that already have one keep it.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.resolve(__dirname, '../.cache/http');

const requireKey = name => {
	const value = process.env[name];
	if (!value) {
		throw new Error(`${name} is not set. Add it to .env (see .env.example).`);
	}
	return value;
};

// Cache key is the URL without its API key, so rotating a key keeps the cache
const cacheFileFor = url => {
	const keyless = url.replace(/(api_?key)=[^&]+/gi, '$1=');
	return path.join(CACHE_DIR, `${crypto.createHash('sha1').update(keyless).digest('hex')}.json`);
};

const fetchJsonCached = async url => {
	const cacheFile = cacheFileFor(url);
	if (fs.existsSync(cacheFile)) {
		return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
	}
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`HTTP ${response.status} from ${new URL(url).host}`);
	}
	const body = await response.json();
	fs.mkdirSync(CACHE_DIR, { recursive: true });
	fs.writeFileSync(cacheFile, JSON.stringify(body));
	return body;
};

/** "deep-cover-1992" -> { title: "deep cover", year: "1992" }; "heat" -> { title: "heat", year: null } */
const titleFromScriptName = scriptName => {
	const words = scriptName.replace(/[-_]+/g, ' ').trim();
	const match = words.match(/^(.*\S)\s+((?:19|20)\d{2})$/);
	return match ? { title: match[1], year: match[2] } : { title: words, year: null };
};

const fetchOmdb = async params => {
	const query = new URLSearchParams({ ...params, plot: 'full', r: 'json', apikey: requireKey('OMDB') });
	const omdb = await fetchJsonCached(`https://www.omdbapi.com/?${query}`);
	if (omdb.Response === 'False') {
		throw new Error(`OMDB has no match for ${JSON.stringify(params)}: ${omdb.Error}`);
	}
	return omdb;
};

/** A title as file-name words, for comparing: "The King's Speech" -> "kings speech" */
const comparableTitle = title => title
	.toLowerCase()
	.normalize('NFD').replace(/[̀-ͯ]/g, '')
	.replace(/&/g, ' and ')
	.replace(/['’]/g, '')
	.replace(/[^a-z0-9]+/g, ' ')
	.trim()
	.replace(/^(the|a|an) /, '');

/**
 * Best guess at a script's film from its file name (a trailing year pins it).
 * Only for scripts not yet in scripts/manifest.json; check the guess there.
 * Throws when OMDB's film has another title ("birds" -> Birds of Prey): OMDB
 * answers a title search with its closest film, not only an exact one.
 */
const matchScriptByTitle = async scriptName => {
	const { title, year } = titleFromScriptName(scriptName);
	const omdb = await fetchOmdb(year ? { t: title, y: year } : { t: title });
	if (comparableTitle(omdb.Title) !== comparableTitle(title)) {
		throw new Error(`OMDB's closest film is ${omdb.Title} (${omdb.Year}, ${omdb.imdbID}); set the id by hand if that's it`);
	}
	return { imdbId: omdb.imdbID, title: omdb.Title, year: omdb.Year };
};

const fetchTmdb = (imdbId, resource, query = '') =>
	fetchJsonCached(`https://api.themoviedb.org/3/movie/${imdbId}/${resource}?api_key=${requireKey('THEMOVIEDB')}${query}`);

// The top-billed actors whose ages at release are looked up (one TMDB call each)
const AGED_CAST = 10;

const fetchTmdbDetails = imdbId =>
	fetchJsonCached(`https://api.themoviedb.org/3/movie/${imdbId}?api_key=${requireKey('THEMOVIEDB')}`);

/** TMDB's cast, with genders: all the eval needs, and no OMDB call (OMDB's free tier allows 1,000 a day) */
const fetchCast = async imdbId => {
	const credits = await fetchTmdb(imdbId, 'credits');
	if (!Array.isArray(credits.cast) || credits.cast.length === 0) throw new Error(`TMDB has no cast for ${imdbId}`);
	return credits.cast;
};

/** The release year, from TMDB */
const fetchReleaseYear = async imdbId => parseInt((await fetchTmdbDetails(imdbId)).release_date, 10) || null;

const fetchTmdbPerson = personId =>
	fetchJsonCached(`https://api.themoviedb.org/3/person/${personId}?api_key=${requireKey('THEMOVIEDB')}`);

/**
 * Everything the analysis and the film page need about one film: OMDB's
 * record, TMDB's cast and crew (with genders), images, details (budget,
 * revenue) and the top-billed actors' birthdays. Throws if TMDB has no cast:
 * without genders the Bechdel analysis is meaningless.
 */
const fetchMetadata = async imdbId => {
	const [omdb, credits, images, details] = await Promise.all([
		fetchOmdb({ i: imdbId }),
		fetchTmdb(imdbId, 'credits'),
		fetchTmdb(imdbId, 'images', '&language=en&include_image_language=en,null'),
		fetchTmdbDetails(imdbId),
	]);
	if (!Array.isArray(credits.cast) || credits.cast.length === 0) {
		throw new Error(`TMDB has no cast for ${omdb.Title} (${imdbId})`);
	}
	const people = await Promise.all(credits.cast.slice(0, AGED_CAST).map(member => fetchTmdbPerson(member.id)));
	const birthdays = new Map(people.filter(p => p.birthday).map(p => [p.id, p.birthday]));
	return { omdb, cast: credits.cast, crew: credits.crew || [], images, details, birthdays };
};

module.exports = { fetchMetadata, fetchCast, fetchReleaseYear, matchScriptByTitle, titleFromScriptName, comparableTitle };
