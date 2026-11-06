// Turns a script plus its metadata into the film record the site reads
// (data/films/<id>.json). The static analysis needs no API keys; the AI second
// opinion is a separate, optional step.
const { parseScreenplay } = require('./screenplay');
const { resolveSpeakers } = require('./genders');
const { scoreBechdel } = require('./bechdel/score');
const castParser = require('./castParser');
const scriptCleaner = require('./scriptCleaner');
const AiAnalyzer = require('./aiAnalyzer');

// Below this many lines of dialogue the script didn't parse (a layout the
// parser can't read), and any score would be noise
const MIN_DIALOGUE_LINES = 150;

// enhancedAnalytics keys that held parsed script text before the parsed
// script moved to its own `script` section; every other key is the AI's
const STATIC_ANALYTICS_KEYS = ['scriptOptimization', 'characterDialogue', 'keyScenes'];

/** "INT. HELL'S GATE - LAB - DAY" -> "Hell's gate"; null for a scene with no heading */
const placeOf = heading => {
	const place = String(heading ?? '')
		.replace(/^\d+[A-Z]?\.?\s+/, '')
		.replace(/^(?:INT|EXT|INT\.?\s*\/\s*EXT|EXT\.?\s*\/\s*INT|I\/E|INTERIOR|EXTERIOR)[.\s/:-]*/i, '')
		.split(/\s+[-–—]\s+/)[0]
		.replace(/[\s\d*.]+$/, '')
		.trim();
	return place ? place.charAt(0).toUpperCase() + place.slice(1).toLowerCase() : null;
};

/**
 * What the site draws from the script: every speaker with their gender and
 * line count, and each scene's place and lines per speaker (by index into
 * speakers). No script text is kept.
 */
const summarizeScript = (screenplay, resolved) => {
	const counts = new Map();
	for (const scene of screenplay.scenes) {
		for (const block of scene.blocks) if (block.kind === 'dialogue') counts.set(block.speaker, (counts.get(block.speaker) ?? 0) + 1);
	}
	const speakers = [...counts]
		.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
		.map(([name, lines]) => ({ name, lines, gender: resolved.get(name).gender, named: resolved.get(name).named }));
	const index = new Map(speakers.map((s, i) => [s.name, i]));
	return {
		layout: screenplay.layout,
		dialogueLines: [...counts.values()].reduce((a, b) => a + b, 0),
		speakers,
		scenes: screenplay.scenes.map(scene => {
			const lines = {};
			for (const block of scene.blocks) if (block.kind === 'dialogue') lines[index.get(block.speaker)] = (lines[index.get(block.speaker)] ?? 0) + 1;
			return { place: placeOf(scene.heading), lines };
		}),
	};
};

/** TMDB cast -> the character list the analysis matches script names against */
const charactersFromCast = cast => castParser(cast);

/**
 * Bechdel score, speaker genders and who-talks data, from the script text and
 * the TMDB cast (from charactersFromCast; gender 1 = woman, 2 = man).
 * Throws if the script didn't parse.
 */
const analyzeScriptText = (scriptText, characters) => {
	const screenplay = parseScreenplay(scriptText);
	const blocks = screenplay.scenes.flatMap(scene => scene.blocks);
	const dialogue = blocks.filter(block => block.kind === 'dialogue');
	if (dialogue.length < MIN_DIALOGUE_LINES) {
		throw new Error(`script didn't parse: only ${dialogue.length} lines of dialogue found (${screenplay.layout} layout)`);
	}
	const actionText = blocks.filter(block => block.kind === 'action').map(block => block.text).join('\n');
	const resolved = resolveSpeakers([...new Set(dialogue.map(block => block.speaker))], characters, actionText);
	const { namedWomen, exchanges, ...bechdelResults } = scoreBechdel(screenplay, resolved, characters);

	return {
		bechdelResults,
		script: summarizeScript(screenplay, resolved),
		// The condensed script the AI reads
		cleaned: scriptCleaner.cleanScript(scriptText),
		screenplay,
		resolved,
		details: { namedWomen, exchanges },
	};
};

/**
 * The AI second opinion, through the LiteLLM gateway (`gateway` is
 * { baseUrl, apiKey, model }). Throws if any section failed, so a film never
 * ships with a half-empty AI read. Records the model that answered as aiModel.
 */
const runAiAnalysis = async ({ gateway, cleaned, characters, bechdelResults }) => {
	const analyzer = new AiAnalyzer(gateway);
	const ai = await analyzer.analyzeScript(cleaned, characters, bechdelResults);
	const failed = Object.entries(ai)
		.filter(([, section]) => section && (section.failed || section.parseError))
		.map(([name, section]) => `${name}: ${section.error || 'unparseable reply'}`);
	if (failed.length > 0) {
		throw new Error(`AI analysis failed (${failed.join('; ')})`);
	}
	return { ...ai, aiModel: analyzer.servedModel };
};

/**
 * The AI's sections of a stored enhancedAnalytics, without the parsed-script
 * data; keepSceneReview: false also drops its review of the passing scenes
 */
const aiSectionsOf = (enhancedAnalytics, { keepSceneReview = true } = {}) =>
	Object.fromEntries(Object.entries(enhancedAnalytics || {})
		.filter(([key]) => !STATIC_ANALYTICS_KEYS.includes(key) && (keepSceneReview || key !== 'enhancedBechdelValidation')));

/** TMDB's first poster and backdrop, as full URLs ('' when it has none) */
const imageUrls = images => ({
	backdrop: images.backdrops?.[0] ? `https://image.tmdb.org/t/p/original${images.backdrops[0].file_path}` : '',
	poster: images.posters?.[0] ? `https://image.tmdb.org/t/p/w300${images.posters[0].file_path}` : '',
});

// OMDB says "N/A" for missing values
const omdbValue = value => (value && value !== 'N/A' ? value : null);
const omdbList = value => (omdbValue(value) ? value.split(',').map(name => ({ name: name.trim() })) : []);
const omdbInt = value => {
	const n = parseInt(omdbValue(value), 10);
	return Number.isNaN(n) ? null : n;
};

/** The film record in the shape site/src/lib/films.mjs reads */
const buildFilmRecord = ({ id, dateUploaded, year, omdb, cast, images, bechdelResults, script, enhancedAnalytics, bechdelData }) => ({
	_id: id,
	title: omdb.Title,
	genres: omdbValue(omdb.Genre) ? omdb.Genre.split(',').map(genre => genre.trim()) : [],
	bechdelResults,
	script,
	images: imageUrls(images),
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
	year: year ?? omdbInt(omdb.Year),
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
