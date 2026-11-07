// Turns the raw film export (data/films/<id>.json, ~600 KB each, written by
// npm run analyze) into the small shape the pages render. Everything here
// runs at build time; no film JSON ships to the browser.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// Resolved from the site folder (where `astro build` and the tests run), not
// from this file: Astro bundles it into a different directory at build time.
const DATA_DIR = resolve(process.cwd(), '../data/films');
// AI reads stay out of the repo (npm run analyze -- --ai writes them here), so
// only a local build has them
const AI_DIR = resolve(process.cwd(), '../data/local/ai');

// Every model that has written a film's AI analysis, keyed by the id the
// analyzer stores as enhancedAnalytics.aiModel (src/aiAnalyzer.js). Analyses
// from before 2026-11-06 store none: Claude 3.5 Haiku wrote all of those.
export const AI_MODELS = {
	'claude-3-5-haiku-20241022': { name: 'Claude 3.5 Haiku', maker: 'Anthropic' },
	'openrouter/deepseek/deepseek-v4.1-flash': { name: 'DeepSeek V4.1 Flash', maker: 'DeepSeek' },
};
const MODEL_BEFORE_IDS_WERE_STORED = 'claude-3-5-haiku-20241022';

/** The model that wrote an analysis; an id missing from AI_MODELS fails the build */
export function aiModelOf(aiModelId) {
	const id = text(aiModelId) ?? MODEL_BEFORE_IDS_WERE_STORED;
	const model = AI_MODELS[id];
	if (!model) throw new Error(`Unknown AI model "${id}": add it to AI_MODELS in site/src/lib/films.mjs`);
	return { id, ...model };
}

// How many bars the scene-by-scene timeline gets, whatever the film's length
export const TIMELINE_BARS = 48;

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

/** Lines per speaker, most first, from the parsed script `npm run analyze` stores */
export function speakersFrom(script) {
	return script.speakers.map((s) => ({ name: titleCase(s.name), lines: s.lines, gender: s.gender }));
}

/**
 * Women's and men's lines across the film, in `bars` even groups of scenes,
 * with where each group takes place and who speaks most in it
 */
export function timelineFrom(script, bars = TIMELINE_BARS) {
	const { scenes, speakers } = script;
	// A script with no scene headings parses as one scene: nothing to plot
	if (scenes.length < 2) return [];
	const per = Math.max(1, Math.ceil(scenes.length / bars));
	const out = [];
	for (let i = 0; i < scenes.length; i += per) {
		const group = scenes.slice(i, i + per);
		let w = 0;
		let m = 0;
		const voices = new Map();
		const places = [];
		for (const scene of group) {
			if (scene.place && !places.includes(scene.place)) places.push(scene.place);
			for (const [index, lines] of Object.entries(scene.lines)) {
				const speaker = speakers[index];
				if (speaker.gender === 'w') w += lines;
				else if (speaker.gender === 'm') m += lines;
				const name = titleCase(speaker.name);
				voices.set(name, { name, gender: speaker.gender, lines: (voices.get(name)?.lines ?? 0) + lines });
			}
		}
		const top = [...voices.values()].sort((a, b) => b.lines - a.lines).slice(0, 4);
		out.push({ from: i + 1, to: i + group.length, w, m, places: places.slice(0, 3), speakers: top });
	}
	return out;
}

// Key crew jobs as the film page names them, in order; jobs with the same
// label (Screenplay, Writer) are listed together
const CREW_LABELS = {
	Director: 'Directed by',
	Screenplay: 'Written by',
	Writer: 'Written by',
	Story: 'Story by',
	Novel: 'From the novel by',
	Producer: 'Produced by',
	'Director of Photography': 'Shot by',
	Editor: 'Edited by',
	'Original Music Composer': 'Music by',
	'Production Design': 'Production design by',
	'Costume Design': 'Costumes by',
	Casting: 'Cast by',
};

/**
 * Key crew grouped by what they did, and each department's head count by
 * gender, biggest first. Gender is "w", "m", "nb" (non-binary) or null.
 */
export function crewFrom(crew) {
	if (!crew) return null;
	const roles = [];
	for (const r of crew.roles) {
		const label = CREW_LABELS[r.job] ?? r.job;
		let group = roles.find((g) => g.label === label);
		if (!group) roles.push((group = { label, people: [] }));
		if (!group.people.some((p) => p.name === r.name)) group.people.push({ name: r.name, gender: r.gender });
	}
	const departments = Object.entries(crew.departments)
		.map(([name, c]) => ({ name, ...c, total: c.w + c.m + c.nb + c.unknown }))
		.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
	const all = departments.reduce((acc, d) => ({ w: acc.w + d.w, m: acc.m + d.m, nb: acc.nb + d.nb, unknown: acc.unknown + d.unknown }), { w: 0, m: 0, nb: 0, unknown: 0 });
	const people = roles.flatMap((g) => g.people);
	return { roles, departments, all, keyWomen: people.filter((p) => p.gender === 'w').length, keyPeople: people.length };
}

/**
 * Films most like this one: shared genres count most, then the same director,
 * then how close the years are. Verdict doesn't matter; each tape shows its own.
 */
export function relatedFilms(film, films, n = 6) {
	const score = (other) => {
		const genres = other.genres.filter((g) => film.genres.includes(g)).length;
		const director = other.directors.some((d) => film.directors.includes(d)) ? 1 : 0;
		const years = film.year && other.year ? Math.abs(film.year - other.year) : 50;
		return genres * 10 + director * 15 + Math.max(0, 10 - years / 2);
	};
	return films
		.filter((f) => f.id !== film.id)
		.map((f) => ({ f, s: score(f) }))
		.sort((a, b) => b.s - a.s || a.f.popularity - b.f.popularity)
		.slice(0, n)
		.map(({ f }) => f);
}

function titleCase(name) {
	return name.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

const list = (x) => (Array.isArray(x) ? x.filter(Boolean) : []);
const text = (x) => (typeof x === 'string' && x.trim() ? x.trim() : null);

/** The AI's read of the script, with every section the analysis stores */
function aiFrom(ea) {
	// Only an AI run stamps analysisTimestamp; films analyzed without --ai have none
	if (!text(ea?.analysisTimestamp)) return null;
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
		model: aiModelOf(ea.aiModel),
	};
}

/** One raw export record -> what the site needs */
export function normalizeFilm(raw) {
	const b = raw.bechdelResults ?? {};
	const score = toNumber(b.bechdelScore) ?? 0;
	const year = toNumber(raw.year);
	const actors = list(raw.actors);
	const ea = raw.enhancedAnalytics;
	if (!raw.script) throw new Error(`${raw.title} has no parsed script: run npm run analyze -- --force on it`);
	const speakers = speakersFrom(raw.script);
	// Lines by gender; "unknown" are speakers the analysis couldn't place
	// (crowds, minor parts). Pages show that share instead of hiding it.
	const knownLines = speakers.reduce(
		(acc, s) => {
			acc[s.gender ?? 'unknown'] += s.lines;
			return acc;
		},
		{ w: 0, m: 0, unknown: 0 },
	);
	const castWithGender = actors.filter((a) => a.actorActress === '1' || a.actorActress === '2');
	const readers = raw.bechdelData && toNumber(raw.bechdelData.rating) !== null
		? { score: toNumber(raw.bechdelData.rating), dubious: raw.bechdelData.dubious === 1, id: raw.bechdelData.id ?? null }
		: null;
	const scenesPass = toNumber(b.numScenesPass) ?? 0;
	return {
		id: String(raw._id),
		images: { poster: text(raw.images?.poster), backdrop: text(raw.images?.backdrop) },
		slug: slugify(raw.title, year),
		title: cleanTitle(raw.title),
		year,
		released: text(raw.releaseDate),
		added: text(raw.dateUploaded),
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
		speakers,
		lines: knownLines,
		timeline: timelineFrom(raw.script),
		sceneCount: raw.script.scenes.length,
		dialogueCount: raw.script.dialogueLines,
		measures: raw.script.measures ?? null,
		crew: crewFrom(raw.crew),
		money: raw.money && (raw.money.budget || raw.money.revenue) ? { budget: raw.money.budget, revenue: raw.money.revenue } : null,
		// Top-billed actors with a known age at release, women and men
		ages: actors
			.filter((a) => Number.isFinite(a.age) && (a.actorActress === '1' || a.actorActress === '2'))
			.map((a) => ({ actor: a.actorName, role: a.character || null, age: a.age, gender: a.actorActress === '1' ? 'w' : 'm' })),
		ai: aiFrom(ea),
	};
}

const median = (xs) => {
	if (!xs.length) return null;
	const s = [...xs].sort((a, b) => a - b);
	const mid = Math.floor(s.length / 2);
	return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};
const average = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const rate = (films) => ({ films: films.length, pass: films.filter((f) => f.bechdel.pass).length });
const womenLineShare = (f) => (f.lines && f.lines.w + f.lines.m > 0 ? f.lines.w / (f.lines.w + f.lines.m) : null);
const hasWomanIn = (f, label) => !!f.crew?.roles.find((g) => g.label === label)?.people.some((p) => p.gender === 'w');

// Crew jobs compared across the shelf, as crewFrom labels them
export const SHELF_JOBS = ['Directed by', 'Written by', 'Produced by', 'Shot by', 'Edited by', 'Music by', 'Production design by', 'Costumes by', 'Cast by'];

/**
 * The whole shelf in numbers: pass rates by decade and genre, who gets heard,
 * who made the films, the cast's ages and the money. Groups smaller than
 * `minGroup` films are left out of the by-decade and by-genre lists.
 */
export function shelfStats(films, { minGroup = 5 } = {}) {
	const decades = new Map();
	for (const f of films) {
		if (!f.year) continue;
		const d = Math.floor(f.year / 10) * 10;
		if (!decades.has(d)) decades.set(d, []);
		decades.get(d).push(f);
	}
	const byDecade = [...decades]
		.sort((a, b) => a[0] - b[0])
		.filter(([, fs]) => fs.length >= minGroup)
		.map(([d, fs]) => ({
			label: `${d}s`,
			...rate(fs),
			womenLines: median(fs.map(womenLineShare).filter((x) => x !== null)),
		}));

	const genres = new Map();
	for (const f of films) for (const g of f.genres) genres.set(g, [...(genres.get(g) ?? []), f]);
	const byGenre = [...genres]
		.filter(([, fs]) => fs.length >= minGroup)
		.map(([label, fs]) => ({ label, ...rate(fs) }))
		.sort((a, b) => b.pass / b.films - a.pass / a.films || b.films - a.films);

	const rated = films.filter((f) => f.readers);
	const withMeasures = films.filter((f) => f.measures && f.dialogueCount > 0);
	const firstShares = withMeasures.filter((f) => f.measures.firstWomanLine !== null).map((f) => (f.measures.firstWomanLine - 1) / f.dialogueCount);

	const jobs = SHELF_JOBS.map((label) => {
		const people = films.flatMap((f) => f.crew?.roles.find((g) => g.label === label)?.people ?? []);
		const count = (g) => people.filter((p) => p.gender === g).length;
		return { label, w: count('w'), m: count('m'), nb: count('nb'), unknown: count(null), films: films.filter((f) => f.crew?.roles.some((g) => g.label === label)).length };
	}).filter((j) => j.w + j.m + j.nb > 0);
	const split = (test) => ({ yes: rate(films.filter(test)), no: rate(films.filter((f) => !test(f))) });

	const withAges = films.filter((f) => f.ages.some((a) => a.gender === 'w') && f.ages.some((a) => a.gender === 'm'));
	const meanAge = (f, g) => average(f.ages.filter((a) => a.gender === g).map((a) => a.age));
	const multiple = (f) => (f.money?.budget && f.money?.revenue ? f.money.revenue / f.money.budget : null);
	const multiples = (fs) => fs.map(multiple).filter((x) => x !== null);

	return {
		...rate(films),
		readers: { films: rated.length, agree: rated.filter((f) => f.bechdel.pass === (f.readers.score === 3)).length },
		byDecade,
		byGenre,
		heard: {
			films: withMeasures.length,
			firstWomanShare: median(firstShares),
			noWomanSpeaks: withMeasures.filter((f) => f.measures.firstWomanLine === null).length,
			womenWordShare: median(withMeasures.map((f) => (f.measures.words.w + f.measures.words.m > 0 ? f.measures.words.w / (f.measures.words.w + f.measures.words.m) : null)).filter((x) => x !== null)),
			womenConversations: withMeasures.reduce((n, f) => n + f.measures.womenConversations, 0),
			menConversations: withMeasures.reduce((n, f) => n + f.measures.menConversations, 0),
			reversePass: withMeasures.filter((f) => f.measures.reverseScore === 3).length,
		},
		jobs,
		womanDirector: split((f) => hasWomanIn(f, 'Directed by')),
		womanWriter: split((f) => hasWomanIn(f, 'Written by')),
		ages: {
			films: withAges.length,
			women: average(withAges.map((f) => meanAge(f, 'w'))),
			men: average(withAges.map((f) => meanAge(f, 'm'))),
			womenYounger: withAges.filter((f) => meanAge(f, 'w') < meanAge(f, 'm')).length,
		},
		money: {
			pass: { films: multiples(films.filter((f) => f.bechdel.pass)).length, multiple: median(multiples(films.filter((f) => f.bechdel.pass))) },
			fail: { films: multiples(films.filter((f) => !f.bechdel.pass)).length, multiple: median(multiples(films.filter((f) => !f.bechdel.pass))) },
		},
	};
}

/**
 * Every film, most popular first (IMDb rating, then Metascore; films with
 * neither go last). Reads the export once per build.
 */
let cache;
/** A film record with its AI read from data/local/ai, when this machine has one */
function withLocalAiRead(raw) {
	const file = join(AI_DIR, `${raw._id}.json`);
	return existsSync(file) ? { ...raw, enhancedAnalytics: JSON.parse(readFileSync(file, 'utf8')) } : raw;
}

export function loadFilms(dir = DATA_DIR) {
	if (cache && dir === DATA_DIR) return cache;
	const films = readdirSync(dir)
		.filter((f) => f.endsWith('.json'))
		.map((f) => normalizeFilm(withLocalAiRead(JSON.parse(readFileSync(join(dir, f), 'utf8')))))
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
