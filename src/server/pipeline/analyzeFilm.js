// Turns a script plus its metadata into the film record the site reads
// (data/films/<id>.json). The static analysis needs no API keys; the AI second
// opinion is a separate, optional step.
const BechdelResults = require('../methods/bechdel/BechdelResults');
const extractScenes = require('../methods/bechdel/extractScenes');
const { scriptAnalysis, scriptGenderAnalytics } = require('../methods/bechdel/scriptAnalysis/scriptAnalysis');
const dataParser = require('../methods/getFilmData/dataParser');
const { parseImageData } = require('../model/parseData');
const scriptCleaner = require('../methods/scriptCleaner');
const ClaudeAnalyzer = require('../methods/claudeAnalyzer');

// The fields of the Bechdel analysis the site reads; the analysis object also
// carries every scene's full text, which would bloat the JSON.
const BECHDEL_FIELDS = [
	'pass', 'bechdelScore', 'numScenesPass', 'numScenesDontPass',
	'numOfFemalesChars', 'numOfMaleChars', 'numOfFemalesCharsWithDialogue', 'numOfMaleCharsWithDialogue',
	'totalLinesFemaleDialogue', 'totalLinesMaleDialogue', 'scenesThatPass',
];

// enhancedAnalytics keys produced by plain parsing; every other key is the AI's
const STATIC_ANALYTICS_KEYS = ['scriptOptimization', 'characterDialogue', 'keyScenes'];

/** TMDB cast -> the character list the analysis matches script names against */
const charactersFromCast = cast => dataParser(cast);

/**
 * Bechdel score, cast gender counts, and who-talks data, from the script text alone.
 * `characters` comes from charactersFromCast (TMDB genders: 1 = woman, 2 = man).
 */
const analyzeScriptText = (scriptText, characters) => {
	const results = new BechdelResults();
	results.characters = characters;
	scriptGenderAnalytics(characters, scriptText, results);
	const analysis = scriptAnalysis(characters, extractScenes(scriptText), results);
	const bechdelResults = Object.fromEntries(BECHDEL_FIELDS.map(field => [field, analysis[field]]));

	const cleaned = scriptCleaner.cleanScript(scriptText);
	const staticAnalytics = {
		scriptOptimization: { tokenReduction: cleaned.tokenReduction },
		characterDialogue: cleaned.characterDialogue,
		keyScenes: scriptCleaner.extractKeyScenes(scriptText),
	};
	return { bechdelResults, staticAnalytics, cleaned };
};

/**
 * The AI second opinion. Throws if any section failed, so a film never ships
 * with a half-empty AI read.
 */
const runAiAnalysis = async ({ apiKey, cleaned, characters, bechdelResults }) => {
	const ai = await new ClaudeAnalyzer(apiKey).analyzeScript(cleaned, characters, bechdelResults);
	const failed = Object.entries(ai)
		.filter(([, section]) => section && (section.failed || section.parseError))
		.map(([name, section]) => `${name}: ${section.error || 'unparseable reply'}`);
	if (failed.length > 0) {
		throw new Error(`AI analysis failed (${failed.join('; ')})`);
	}
	return ai;
};

/** The AI's sections of a stored enhancedAnalytics, without the parsed-script data */
const aiSectionsOf = enhancedAnalytics =>
	Object.fromEntries(Object.entries(enhancedAnalytics || {}).filter(([key]) => !STATIC_ANALYTICS_KEYS.includes(key)));

// OMDB says "N/A" for missing values
const omdbValue = value => (value && value !== 'N/A' ? value : null);
const omdbList = value => (omdbValue(value) ? value.split(',').map(name => ({ name: name.trim() })) : []);
const omdbInt = value => {
	const n = parseInt(omdbValue(value), 10);
	return Number.isNaN(n) ? null : n;
};

/** The film record in the shape site/src/lib/films.mjs reads */
const buildFilmRecord = ({ id, dateUploaded, omdb, cast, images, bechdelResults, enhancedAnalytics, bechdelData }) => ({
	_id: id,
	title: omdb.Title,
	genres: omdbValue(omdb.Genre) ? omdb.Genre.split(',').map(genre => genre.trim()) : [],
	bechdelResults,
	images: parseImageData(images),
	...(bechdelData ? { bechdelData } : {}),
	enhancedAnalytics,
	actors: cast.map(member => ({
		actorName: member.name,
		character: member.character,
		...(member.gender ? { actorActress: String(member.gender) } : {}),
	})),
	directors: omdbList(omdb.Director),
	writers: omdbList(omdb.Writer),
	awards: omdbValue(omdb.Awards) ? [{ name: omdb.Awards }] : [],
	dateUploaded,
	plot: omdbValue(omdb.Plot),
	simplePlot: omdbValue(omdb.Plot),
	year: omdbInt(omdb.Year),
	releaseDate: omdbValue(omdb.Released),
	rated: omdbValue(omdb.Rated),
	urlPoster: omdbValue(omdb.Poster),
	idIMDB: omdb.imdbID,
	rating: omdbValue(omdb.imdbRating),
	metascore: omdbInt(omdb.Metascore),
	urlIMDB: `https://www.imdb.com/title/${omdb.imdbID}/`,
});

module.exports = {
	charactersFromCast,
	analyzeScriptText,
	runAiAnalysis,
	aiSectionsOf,
	buildFilmRecord,
};
