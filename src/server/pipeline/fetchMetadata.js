// Film metadata for one script: OMDB (title, year, plot, IMDb id) then TMDB
// (cast with genders, poster and backdrop). Responses are cached on disk under
// .cache/http/, so re-running a film doesn't call the APIs again; delete that
// folder to refetch. bechdeltest.com's API is gone (HTTP 410), so readers'
// scores are no longer fetched; films that already have one keep it.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.resolve(__dirname, '../../../.cache/http');

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

const fetchOmdb = async (title, year) => {
	const params = new URLSearchParams({ t: title, plot: 'full', r: 'json', apikey: requireKey('OMDB') });
	if (year) params.set('y', year);
	const omdb = await fetchJsonCached(`https://www.omdbapi.com/?${params}`);
	if (omdb.Response === 'False') {
		throw new Error(`OMDB has no match for "${title}"${year ? ` (${year})` : ''}: ${omdb.Error}`);
	}
	return omdb;
};

const fetchTmdb = (imdbId, resource, query = '') =>
	fetchJsonCached(`https://api.themoviedb.org/3/movie/${imdbId}/${resource}?api_key=${requireKey('THEMOVIEDB')}${query}`);

/**
 * Everything the analysis and the film page need about one film.
 * Throws if OMDB has no match or TMDB has no cast: without genders the
 * Bechdel analysis is meaningless.
 */
const fetchMetadata = async scriptName => {
	const { title, year } = titleFromScriptName(scriptName);
	const omdb = await fetchOmdb(title, year);
	const [credits, images] = await Promise.all([
		fetchTmdb(omdb.imdbID, 'credits'),
		fetchTmdb(omdb.imdbID, 'images', '&language=en&include_image_language=en,null'),
	]);
	if (!Array.isArray(credits.cast) || credits.cast.length === 0) {
		throw new Error(`TMDB has no cast for ${omdb.Title} (${omdb.imdbID})`);
	}
	return { omdb, cast: credits.cast, images };
};

module.exports = { fetchMetadata, titleFromScriptName };
