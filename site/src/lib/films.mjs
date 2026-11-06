// Turns the raw film export (data/films/<id>.json, ~600 KB each, written by the
// local full-stack app) into the small shape the pages render. Everything here
// runs at build time; no film JSON ships to the browser.
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// Resolved from the site folder (where `astro build` and the tests run), not
// from this file: Astro bundles it into a different directory at build time.
const DATA_DIR = resolve(process.cwd(), '../data/films');

// How many bars the scene-by-scene timeline gets, whatever the film's length
export const TIMELINE_BARS = 48;
// Below this many attributed lines, a film's dialogue data is treated as unusable
export const MIN_USABLE_LINES = 50;

/** "Evil Dead II: Dead by Dawn (1987)" -> "Evil Dead II: Dead by Dawn" */
export function cleanTitle(title) {
	return String(title ?? '').replace(/\s*\(\d{4}\)\s*$/, '').trim();
}

/** URL slug from title and year: "Freddy vs. Jason", 2003 -> "freddy-vs-jason-2003" */
export function slugify(title, year) {
	const base = cleanTitle(title)
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/&/g, ' and ')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return year ? `${base}-${year}` : base;
}

/** The three rules are cumulative: a score of 2 means rules 1 and 2 pass, rule 3 fails. */
export function rulesFromScore(score) {
	const s = Number.isFinite(score) ? score : 0;
	return [s >= 1, s >= 2, s >= 3];
}

/** A number from fields like "8.1", 79, "N/A" or null; null when there isn't one */
export function toNumber(value) {
	const n = typeof value === 'number' ? value : Number.parseFloat(value);
	return Number.isFinite(n) ? n : null;
}

// Script parsing leaves noise in the speaker field: scene headings ("POLICE
// STATION - DAY 52"), page marks ("* *"), and extensions like "(V.O.)".
const SCENE_HEADING = /^(INT|EXT)\b|\s-\s|\b(DAY|NIGHT|MORNING|EVENING|LATER|CONTINUOUS)\b(\s\d+)?$/;

/** A clean speaker name, or null when the field isn't a person */
export function cleanSpeaker(raw) {
	const name = String(raw ?? '')
		.replace(/\(.*?\)/g, '')
		.replace(/\s+/g, ' ')
		.trim();
	if (!/[A-Za-z]{2}/.test(name)) return null;
	if (SCENE_HEADING.test(name.toUpperCase())) return null;
	// Page furniture ("CONTINUED:") and dialogue that the parser mistook for a name
	// ("ALRIGHT, NOW ARE YOU STRAIGHT?") are not speakers
	if (/CONTINUED|[!?,:;]/i.test(name) || name.split(' ').length > 4) return null;
	return name;
}

/**
 * Looks up a speaker's gender from the cast list, matching any word of the
 * character's name ("BONEY" matches "Detective Rhonda Boney"). The cast list
 * uses TMDB codes: "1" woman, "2" man. Returns "w", "m" or null when unknown.
 */
export function buildGenderLookup(actors = []) {
	const byWord = new Map();
	for (const a of actors) {
		if (!a?.character || (a.actorActress !== '1' && a.actorActress !== '2')) continue;
		const g = a.actorActress === '1' ? 'w' : 'm';
		for (const word of a.character.toUpperCase().replace(/[^A-Z ]/g, ' ').split(/\s+/)) {
			// Skip short words and titles that many characters share
			if (word.length < 3 || ['THE', 'MRS', 'MISS', 'OFFICER', 'DETECTIVE', 'DOCTOR', 'AGENT'].includes(word)) continue;
			if (!byWord.has(word)) byWord.set(word, g);
		}
	}
	return (speaker) => {
		const words = String(speaker).toUpperCase().replace(/[^A-Z ]/g, ' ').split(/\s+/).filter(Boolean);
		for (const w of words) if (byWord.has(w)) return byWord.get(w);
		return null;
	};
}

/** Lines per speaker, most first, with gender where the cast list knows it */
export function speakersFrom(dialogue = [], genderOf) {
	const counts = new Map();
	for (const line of dialogue) {
		const name = cleanSpeaker(line?.character);
		if (!name) continue;
		counts.set(name, (counts.get(name) ?? 0) + 1);
	}
	return [...counts]
		.map(([name, lines]) => ({ name: titleCase(name), lines, gender: genderOf(name) }))
		.sort((a, b) => b.lines - a.lines || a.name.localeCompare(b.name));
}

/** Women's and men's lines across the film, in `bars` even groups of scenes */
export function timelineFrom(scenes = [], genderOf, bars = TIMELINE_BARS) {
	if (!scenes.length) return [];
	const per = Math.max(1, Math.ceil(scenes.length / bars));
	const out = [];
	for (let i = 0; i < scenes.length; i += per) {
		const group = scenes.slice(i, i + per);
		let w = 0;
		let m = 0;
		for (const scene of group) {
			for (const line of scene?.dialogue ?? []) {
				const name = cleanSpeaker(line?.character);
				const g = name && genderOf(name);
				if (g === 'w') w++;
				else if (g === 'm') m++;
			}
		}
		out.push({ from: i + 1, to: i + group.length, w, m });
	}
	return out;
}

function titleCase(name) {
	return name.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

const list = (x) => (Array.isArray(x) ? x.filter(Boolean) : []);
const text = (x) => (typeof x === 'string' && x.trim() ? x.trim() : null);

/** The AI's read of the script, with every section the analysis stores */
function aiFrom(ea) {
	if (!ea) return null;
	const v = ea.enhancedBechdelValidation;
	return {
		review: v
			? {
					scenes: list(v.scenes).map((s) => ({
						result: s.llmResult,
						confidence: toNumber(s.confidence),
						reasoning: text(s.reasoning),
						subject: text(s.conversationSubject),
						women: list(s.femaleCharactersIdentified),
					})),
					score: toNumber(v.overallAssessment?.llmRecommendedScore),
					pass: v.overallAssessment?.llmPass === true,
					reasoning: text(v.overallAssessment?.reasoning),
				}
			: null,
		scores: {
			agency: toNumber(ea.femaleAgency?.agencyScore),
			stereotyping: toNumber(ea.stereotypes?.stereotypeScore),
			bias: toNumber(ea.biasDetection?.biasScore),
			diversity: toNumber(ea.intersectionality?.diversityScore),
			power: toNumber(ea.powerDynamics?.powerDynamicsScore),
		},
		agency: {
			drives: list(ea.femaleAgency?.plotDrivingMoments),
			reacts: list(ea.femaleAgency?.reactiveMoments),
			decisions: text(ea.femaleAgency?.decisionMaking),
			goals: text(ea.femaleAgency?.goalPursuit),
		},
		power: {
			interruptions: list(ea.powerDynamics?.interruptionPatterns),
			questions: text(ea.powerDynamics?.questionCommandAnalysis),
			speakingTime: text(ea.powerDynamics?.speakingTimeAnalysis),
			authority: list(ea.powerDynamics?.authorityPatterns),
		},
		compare: [
			['Talk about', list(ea.topics?.femaleTopics).join(', '), list(ea.topics?.maleTopics).join(', ')],
			['Range of topics', text(ea.topics?.topicDiversity?.female), text(ea.topics?.topicDiversity?.male)],
			['Expertise', text(ea.topics?.expertise?.female), text(ea.topics?.expertise?.male)],
			['Feel', text(ea.sentiment?.emotionalRange?.female), text(ea.sentiment?.emotionalRange?.male)],
			['Emotional patterns', text(ea.sentiment?.femaleEmotionalPatterns), text(ea.sentiment?.maleEmotionalPatterns)],
			['Sound', text(ea.vocabulary?.femaleVocabulary), text(ea.vocabulary?.maleVocabulary)],
			['Special vocabulary', text(ea.vocabulary?.technicalLanguage?.female), text(ea.vocabulary?.technicalLanguage?.male)],
			['Arc', text(ea.characterDevelopment?.femaleCharacterDevelopment), text(ea.characterDevelopment?.maleCharacterDevelopment)],
			['Depth', text(ea.characterDevelopment?.complexityDepth?.female), text(ea.characterDevelopment?.complexityDepth?.male)],
		].filter(([, w, m]) => w || m),
		compareNotes: [text(ea.sentiment?.comparison), text(ea.characterDevelopment?.developmentComparison), text(ea.characterDevelopment?.growthPatterns)].filter(Boolean),
		archetypes: Object.entries(ea.stereotypes?.characterArchetypes ?? {}).map(([name, kind]) => ({ name, kind })),
		flags: {
			stereotypes: { found: list(ea.stereotypes?.detectedStereotypes), patterns: list(ea.stereotypes?.problematicPatterns) },
			bias: {
				found: list(ea.biasDetection?.detectedBiases),
				patterns: list(ea.biasDetection?.biasPatterns),
				microaggressions: list(ea.biasDetection?.microaggressions),
				systemic: text(ea.biasDetection?.systemicBias),
			},
			diversity: {
				gaps: list(ea.intersectionality?.representationGaps),
				identity: text(ea.intersectionality?.identityAnalysis),
				tokenism: text(ea.intersectionality?.tokenismDetected),
			},
		},
		recommendations: [
			['Agency', ea.femaleAgency?.recommendations],
			['Stereotypes', ea.stereotypes?.recommendations],
			['Bias', ea.biasDetection?.recommendations],
			['Diversity', ea.intersectionality?.recommendations],
			['Power', ea.powerDynamics?.recommendations],
			['Emotion', ea.sentiment?.recommendations],
			['Topics', ea.topics?.recommendations],
			['Vocabulary', ea.vocabulary?.recommendations],
			['Character', ea.characterDevelopment?.recommendations],
		]
			.map(([area, t]) => ({ area, text: text(t) }))
			.filter((r) => r.text),
		analyzedAt: text(ea.analysisTimestamp),
	};
}

/** One raw export record -> what the site needs */
export function normalizeFilm(raw) {
	const b = raw.bechdelResults ?? {};
	const score = toNumber(b.bechdelScore) ?? 0;
	const year = toNumber(raw.year);
	const actors = list(raw.actors);
	const genderOf = buildGenderLookup(actors);
	const ea = raw.enhancedAnalytics;
	const speakers = speakersFrom(ea?.characterDialogue, genderOf);
	// Lines by gender; "unknown" are speakers the cast list can't place (nicknames,
	// minor parts, parsing mistakes). Pages show that share instead of hiding it.
	const knownLines = speakers.reduce(
		(acc, s) => {
			acc[s.gender ?? 'unknown'] += s.lines;
			return acc;
		},
		{ w: 0, m: 0, unknown: 0 },
	);
	// Fewer lines than this means the script didn't parse (Dawn of the Dead's
	// export has dialogue in the speaker field), so the dialogue charts are skipped
	const dialogueUsable = knownLines.w + knownLines.m + knownLines.unknown >= MIN_USABLE_LINES;
	const castWithGender = actors.filter((a) => a.actorActress === '1' || a.actorActress === '2');
	const readers = raw.bechdelData && toNumber(raw.bechdelData.rating) !== null
		? { score: toNumber(raw.bechdelData.rating), dubious: raw.bechdelData.dubious === 1, id: raw.bechdelData.id ?? null }
		: null;
	const scenesPass = toNumber(b.numScenesPass) ?? 0;
	return {
		id: String(raw._id),
		slug: slugify(raw.title, year),
		title: cleanTitle(raw.title),
		year,
		released: text(raw.releaseDate),
		genres: list(raw.genres),
		rated: text(raw.rated) && raw.rated !== 'N/A' ? raw.rated : null,
		imdbRating: toNumber(raw.rating),
		metascore: toNumber(raw.metascore),
		imdbUrl: text(raw.urlIMDB),
		plot: text(raw.plot) ?? text(raw.simplePlot),
		awards: list(raw.awards).map((a) => a.name).filter(Boolean),
		directors: list(raw.directors).map((d) => d.name).filter((n) => n && n !== 'N/A'),
		writers: list(raw.writers).map((w) => w.name).filter((n) => n && n !== 'N/A'),
		bechdel: {
			score,
			pass: score === 3,
			rules: rulesFromScore(score),
			scenesPass,
			scenesTotal: scenesPass + (toNumber(b.numScenesDontPass) ?? 0),
			womenChars: toNumber(b.numOfFemalesChars),
			menChars: toNumber(b.numOfMaleChars),
			womenSpeaking: toNumber(b.numOfFemalesCharsWithDialogue),
			menSpeaking: toNumber(b.numOfMaleCharsWithDialogue),
			passingScenes: list(b.scenesThatPass),
		},
		readers,
		cast: actors
			.filter((a) => a.actorName)
			.map((a) => ({ actor: a.actorName, role: a.character || null, gender: a.actorActress === '1' ? 'w' : a.actorActress === '2' ? 'm' : null })),
		castCounts: castWithGender.length
			? { w: castWithGender.filter((a) => a.actorActress === '1').length, m: castWithGender.filter((a) => a.actorActress === '2').length }
			: null,
		speakers: dialogueUsable ? speakers : [],
		lines: dialogueUsable ? knownLines : null,
		timeline: dialogueUsable ? timelineFrom(ea?.keyScenes, genderOf) : [],
		sceneCount: list(ea?.keyScenes).length,
		dialogueCount: list(ea?.characterDialogue).length,
		ai: aiFrom(ea),
	};
}

/**
 * Every film, most popular first (IMDb rating, then Metascore; films with
 * neither go last). Reads the export once per build.
 */
let cache;
export function loadFilms(dir = DATA_DIR) {
	if (cache && dir === DATA_DIR) return cache;
	const films = readdirSync(dir)
		.filter((f) => f.endsWith('.json'))
		.map((f) => normalizeFilm(JSON.parse(readFileSync(join(dir, f), 'utf8'))))
		.sort((a, b) => (b.imdbRating ?? -1) - (a.imdbRating ?? -1) || (b.metascore ?? -1) - (a.metascore ?? -1) || a.title.localeCompare(b.title));
	const slugs = new Set();
	for (const f of films) {
		if (slugs.has(f.slug)) throw new Error(`Two films share the slug ${f.slug}`);
		slugs.add(f.slug);
	}
	films.forEach((f, i) => (f.popularity = i + 1));
	if (dir === DATA_DIR) cache = films;
	return films;
}
