// The Bechdel Test, scored from a parsed screenplay and resolved speakers:
//   1. at least two named women speak in the film
//   2. two of them talk to each other: consecutive lines by two different
//      named women in the same scene, with no one else speaking in between
//   3. about something other than a man: none of those lines mention a man
// The score is the last rule passed (0-3), as bechdeltest.com rates.

const { MAN_WORDS } = require('../genders');

// Male words people use when talking about a man, matched as whole words in any case
const MALE_REFERENCE = /\b(?:he|him|his|himself|he's|he'd|he'll|man|men|boy|boys|guy|guys|husband|husbands|boyfriend|boyfriends|ex-husband|ex-boyfriend|fiance|fiancé|father|fathers|dad|daddy|papa|pop|brother|brothers|son|sons|uncle|nephew|grandpa|grandfather|king|prince|lord|sir|mister|mr|gentleman|gentlemen|dude|bro|mailman|policeman)\b/i;
// Male first or last names that are also everyday words, so a match means nothing
const COMMON_WORDS = new Set([
	'WILL', 'MARK', 'BILL', 'GRANT', 'RICH', 'ROB', 'FRANK', 'GUY', 'RAY', 'ART', 'BUD', 'CHASE', 'DREW', 'HUNTER', 'LANCE',
	'MAX', 'MILES', 'NORM', 'RUSTY', 'SKIP', 'STERLING', 'STONE', 'WOOD', 'YOUNG', 'BROWN', 'WHITE', 'BLACK', 'GREEN', 'GRAY',
	'GREY', 'LONG', 'SHORT', 'HILL', 'LANE', 'BELL', 'BANKS', 'CROSS', 'FOX', 'HOPE', 'JOY', 'LOVE', 'ROSE', 'GOLD', 'SILVER',
	'HARDY', 'MORE', 'ROCK', 'SAGE', 'STORM', 'TRUE', 'GOOD', 'BEST', 'CASH', 'DOC', 'MAJOR', 'PRICE', 'NEWMAN', 'GUARD',
]);

const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const titleCase = w => w.charAt(0) + w.slice(1).toLowerCase();

/** Names that mark a line as being about a man: this film's men, as written in dialogue */
const maleNamePattern = (resolved, cast) => {
	const names = new Set();
	const add = name => {
		for (const w of name.toUpperCase().replace(/\([^)]*\)/g, ' ').split(/[^A-Z']+/)) {
			if (w.length > 2 && !COMMON_WORDS.has(w) && !MAN_WORDS.has(w)) names.add(w);
		}
	};
	for (const [speaker, info] of resolved) if (info.gender === 'm' && info.named) add(speaker);
	for (const member of cast) if (member.gender === 2 && member.character) add(member.character);
	// A name a woman also has (Sam, Alex) can't mark a line as about a man
	for (const [speaker, info] of resolved) if (info.gender === 'w') for (const w of speaker.split(/\s+/)) names.delete(w);
	for (const member of cast) if (member.gender === 1 && member.character) for (const w of member.character.toUpperCase().split(/[^A-Z']+/)) names.delete(w);
	if (names.size === 0) return null;
	const forms = [...names].flatMap(n => [escape(n), escape(titleCase(n))]);
	return new RegExp(`\\b(?:${forms.join('|')})\\b`);
};

/**
 * @param {{scenes: Array}} screenplay - from parseScreenplay
 * @param {Map} resolved - from resolveSpeakers
 * @param {Array} cast - TMDB cast
 */
const scoreBechdel = (screenplay, resolved, cast) => {
	const isNamedWoman = speaker => resolved.get(speaker)?.gender === 'w' && resolved.get(speaker)?.named;
	const maleName = maleNamePattern(resolved, cast);
	const aboutAMan = text => MALE_REFERENCE.test(text) || (maleName ? maleName.test(text) : false);

	const dialogue = screenplay.scenes.flatMap(s => s.blocks).filter(b => b.kind === 'dialogue');
	const namedWomen = new Set(dialogue.map(b => b.speaker).filter(isNamedWoman));

	// Every run of consecutive lines spoken only by named women, per scene
	const exchanges = [];
	screenplay.scenes.forEach((scene, sceneIndex) => {
		let run = [];
		const close = () => {
			if (new Set(run.map(b => b.speaker)).size >= 2) exchanges.push({ sceneIndex, lines: run });
			run = [];
		};
		for (const block of scene.blocks) {
			if (block.kind !== 'dialogue') continue;
			if (isNamedWoman(block.speaker)) run.push(block);
			else close();
		}
		close();
	});
	const clean = exchanges.filter(e => !e.lines.some(line => aboutAMan(line.text)));

	const score = namedWomen.size < 2 ? 0 : exchanges.length === 0 ? 1 : clean.length === 0 ? 2 : 3;
	const passingScenes = new Set(clean.map(e => e.sceneIndex));
	// Speaking characters from the cast list, so they never outnumber the cast
	const speakersBy = gender => [...new Set(dialogue.map(b => b.speaker))]
		.filter(s => resolved.get(s)?.gender === gender && resolved.get(s)?.source === 'cast');
	const linesBy = gender => dialogue.filter(b => resolved.get(b.speaker)?.gender === gender).length;

	return {
		pass: score === 3,
		bechdelScore: score,
		numScenesPass: passingScenes.size,
		numScenesDontPass: screenplay.scenes.length - passingScenes.size,
		numOfFemalesChars: cast.filter(c => c.gender === 1).length,
		numOfMaleChars: cast.filter(c => c.gender === 2).length,
		numOfFemalesCharsWithDialogue: speakersBy('w').length,
		numOfMaleCharsWithDialogue: speakersBy('m').length,
		totalLinesFemaleDialogue: linesBy('w'),
		totalLinesMaleDialogue: linesBy('m'),
		// Up to five passing exchanges, as short quotes
		scenesThatPass: clean.slice(0, 5).map(e => e.lines.slice(0, 4)
			.map(l => `${l.speaker}: ${l.text.length > 140 ? `${l.text.slice(0, 140)}…` : l.text}`).join('\n')),
		namedWomen: [...namedWomen],
		exchanges: exchanges.length,
	};
};

module.exports = { scoreBechdel, MALE_REFERENCE };
