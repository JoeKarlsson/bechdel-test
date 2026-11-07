// Turns a script plus its metadata into the film record the site reads
// (data/films/<id>.json). The static analysis needs no API keys; the AI second
// opinion is a separate, optional step.
const { parseScreenplay } = require('./screenplay');
const { resolveSpeakers } = require('./genders');
const { scoreBechdel } = require('./bechdel/score');
const castParser = require('./castParser');
const scriptCleaner = require('./scriptCleaner');
const AiAnalyzer = require('./aiAnalyzer');
const { dialogueEnglishShare } = require('./scriptText');

// Below this many lines of dialogue the script didn't parse (a layout the
// parser can't read), and any score would be noise
const MIN_DIALOGUE_LINES = 150;
// Below this share of English words the dialogue is a bad scan (undecodable
// PDF fonts, poor OCR): the score would rest on noise and quotes would be garbage
const MIN_DIALOGUE_ENGLISH = 0.9;


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
 * Who gets heard, beyond the score: when the first woman speaks, the longest
 * run of lines with no woman speaking, and words spoken by gender
 */
const measureDialogue = (dialogue, resolved) => {
	const genderOf = block => resolved.get(block.speaker).gender;
	const firstWoman = dialogue.findIndex(block => genderOf(block) === 'w');
	let longest = 0;
	let longestStart = null;
	let run = 0;
	const words = { w: 0, m: 0, unknown: 0 };
	dialogue.forEach((block, i) => {
		run = genderOf(block) === 'w' ? 0 : run + 1;
		if (run > longest) {
			longest = run;
			longestStart = i - run + 2; // 1-based line the stretch starts on
		}
		words[genderOf(block) ?? 'unknown'] += block.text.split(/\s+/).filter(Boolean).length;
	});
	return {
		firstWomanLine: firstWoman === -1 ? null : firstWoman + 1,
		longestWithoutWoman: longest,
		longestWithoutWomanStart: longestStart,
		words,
	};
};

/**
 * Bechdel score, speaker genders and who-talks data, from the script text and
 * the TMDB cast (from charactersFromCast; gender 1 = woman, 2 = man).
 * Throws if the script didn't parse.
 */
const analyzeScriptText = (scriptText, characters, genderOverrides = {}) => {
	const screenplay = parseScreenplay(scriptText);
	const blocks = screenplay.scenes.flatMap(scene => scene.blocks);
	const dialogue = blocks.filter(block => block.kind === 'dialogue');
	if (dialogue.length < MIN_DIALOGUE_LINES) {
		throw new Error(`script didn't parse: only ${dialogue.length} lines of dialogue found (${screenplay.layout} layout)`);
	}
	const english = dialogueEnglishShare(dialogue.map(block => block.text));
	if (english < MIN_DIALOGUE_ENGLISH) {
		throw new Error(`script dialogue is garbled: ${Math.round(english * 100)}% English words, likely a bad scan; npm run recover-scripts looks for a clean copy`);
	}
	const actionText = blocks.filter(block => block.kind === 'action').map(block => block.text).join('\n');
	const resolved = resolveSpeakers([...new Set(dialogue.map(block => block.speaker))], characters, actionText);
	// Corrections by hand (data/gender-overrides.json): { "ARIADNE": "w" }
	for (const [speaker, gender] of Object.entries(genderOverrides)) {
		if (!resolved.has(speaker)) throw new Error(`gender override for ${speaker}, who never speaks in this script`);
		resolved.set(speaker, { ...resolved.get(speaker), gender, source: 'override' });
	}
	const { namedWomen, exchanges, reverse, ...bechdelResults } = scoreBechdel(screenplay, resolved, characters);
	const summary = summarizeScript(screenplay, resolved);
	summary.measures = {
		...measureDialogue(dialogue, resolved),
		womenConversations: exchanges,
		menConversations: reverse.exchanges,
		reverseScore: reverse.score,
	};

	return {
		bechdelResults,
		script: summary,
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

// Crew jobs shown on the film page, in this order
const KEY_JOBS = [
	'Director', 'Screenplay', 'Writer', 'Story', 'Novel', 'Producer', 'Director of Photography', 'Editor',
	'Original Music Composer', 'Production Design', 'Costume Design', 'Casting',
];
// TMDB genders: 1 woman, 2 man, 3 non-binary, 0 not set
const tmdbGender = g => ({ 1: 'w', 2: 'm', 3: 'nb' }[g] ?? null);

/** Key crew by job, and every department's head count by gender */
const crewSummary = crew => {
	const seen = new Set();
	const roles = crew
		.filter(p => KEY_JOBS.includes(p.job) && !seen.has(`${p.job}|${p.name}`) && seen.add(`${p.job}|${p.name}`))
		.sort((a, b) => KEY_JOBS.indexOf(a.job) - KEY_JOBS.indexOf(b.job))
		.map(p => ({ job: p.job, name: p.name, gender: tmdbGender(p.gender) }));
	const departments = {};
	for (const p of crew) {
		const counts = (departments[p.department] ??= { w: 0, m: 0, nb: 0, unknown: 0 });
		counts[tmdbGender(p.gender) ?? 'unknown']++;
	}
	return { roles, departments };
};

/** Whole years between a birthday and a date, both "YYYY-MM-DD" */
const ageOn = (birthday, date) => {
	const b = new Date(birthday);
	const d = new Date(date);
	if (Number.isNaN(b.getTime()) || Number.isNaN(d.getTime())) return undefined;
	let age = d.getUTCFullYear() - b.getUTCFullYear();
	if (d.getUTCMonth() < b.getUTCMonth() || (d.getUTCMonth() === b.getUTCMonth() && d.getUTCDate() < b.getUTCDate())) age--;
	return age >= 0 ? age : undefined;
};

// OMDB says "N/A" for missing values
const omdbValue = value => (value && value !== 'N/A' ? value : null);
const omdbList = value => (omdbValue(value) ? value.split(',').map(name => ({ name: name.trim() })) : []);
const omdbInt = value => {
	const n = parseInt(omdbValue(value), 10);
	return Number.isNaN(n) ? null : n;
};

/** The film record in the shape site/src/lib/films.mjs reads */
const buildFilmRecord = ({
	id, dateUploaded, year, omdb, cast, crew = [], details = {}, birthdays = new Map(), images, bechdelResults, script,
	enhancedAnalytics, bechdelData,
}) => ({
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
		// Age when the film came out, for the top-billed actors with a known birthday
		...(birthdays.has(member.id) ? { age: ageOn(birthdays.get(member.id), details.release_date || omdb.Released) } : {}),
	})),
	crew: crewSummary(crew),
	// TMDB uses 0 for an unknown budget or revenue
	money: { budget: details.budget || null, revenue: details.revenue || null },
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
	MIN_DIALOGUE_LINES,
	MIN_DIALOGUE_ENGLISH,
};
