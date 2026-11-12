// The Bechdel Test, scored from a parsed screenplay and resolved speakers:
//   1. at least two named women speak in the film
//   2. two of them talk to each other: consecutive lines by two different
//      named women in the same scene, with no one else speaking in between
//   3. about something other than a man: none of those lines mention a man
// The score is the last rule passed (0-3), as bechdeltest.com rates. The same
// test run the other way (two named men, not about a woman) is the reverse test.

const { MAN_WORDS, WOMAN_WORDS } = require('../genders');

// Words people use when talking about a man or a woman, matched as whole words in any case
const MALE_REFERENCE = /\b(?:he|him|his|himself|he's|he'd|he'll|man|men|boy|boys|guy|guys|husband|husbands|boyfriend|boyfriends|ex-husband|ex-boyfriend|fiance|fiancé|father|fathers|dad|daddy|papa|pop|brother|brothers|son|sons|uncle|nephew|grandpa|grandfather|king|prince|lord|sir|mister|mr|gentleman|gentlemen|dude|bro|mailman|policeman)\b/i;
const FEMALE_REFERENCE = /\b(?:she|her|hers|herself|she's|she'd|she'll|woman|women|girl|girls|lady|ladies|wife|wives|girlfriend|girlfriends|ex-wife|ex-girlfriend|fiancee|fiancée|mother|mothers|mom|mommy|mum|mama|sister|sisters|daughter|daughters|aunt|niece|grandma|grandmother|queen|princess|madam|ma'am|miss|mrs|ms)\b/i;
// First or last names that are also everyday words, so a match means nothing
const COMMON_WORDS = new Set([
	'WILL', 'MARK', 'BILL', 'GRANT', 'RICH', 'ROB', 'FRANK', 'GUY', 'RAY', 'ART', 'BUD', 'CHASE', 'DREW', 'HUNTER', 'LANCE',
	'MAX', 'MILES', 'NORM', 'RUSTY', 'SKIP', 'STERLING', 'STONE', 'WOOD', 'YOUNG', 'BROWN', 'WHITE', 'BLACK', 'GREEN', 'GRAY',
	'GREY', 'LONG', 'SHORT', 'HILL', 'LANE', 'BELL', 'BANKS', 'CROSS', 'FOX', 'HOPE', 'JOY', 'LOVE', 'ROSE', 'GOLD', 'SILVER',
	'HARDY', 'MORE', 'ROCK', 'SAGE', 'STORM', 'TRUE', 'GOOD', 'BEST', 'CASH', 'DOC', 'MAJOR', 'PRICE', 'NEWMAN', 'GUARD',
	'GRACE', 'FAITH', 'MAY', 'APRIL', 'JUNE', 'DAWN', 'ANGEL', 'SUMMER', 'PATIENCE', 'MERCY', 'CHARITY', 'HONEY', 'SUNNY',
	'CANDY', 'PEPPER', 'IVY', 'LILY', 'RUBY', 'PEARL', 'HAZEL', 'AMBER', 'CRYSTAL', 'DESTINY', 'HARMONY',
]);

const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const titleCase = w => w.charAt(0) + w.slice(1).toLowerCase();

/**
 * Names that mark a line as being about someone of `gender` ('w' or 'm'):
 * this film's characters of that gender, as written in dialogue, minus any
 * name a character of the other gender shares (Sam, Alex)
 */
const namePattern = (resolved, cast, gender) => {
	const tmdbGender = gender === 'w' ? 1 : 2;
	const genderWords = gender === 'w' ? WOMAN_WORDS : MAN_WORDS;
	const words = name => name.toUpperCase().replace(/\([^)]*\)/g, ' ').split(/[^A-Z']+/);
	const names = new Set();
	for (const [speaker, info] of resolved) {
		if (info.gender === gender && info.named) for (const w of words(speaker)) names.add(w);
	}
	for (const member of cast) if (member.gender === tmdbGender && member.character) for (const w of words(member.character)) names.add(w);
	for (const w of [...names]) if (w.length <= 2 || COMMON_WORDS.has(w) || genderWords.has(w)) names.delete(w);
	for (const [speaker, info] of resolved) if (info.gender && info.gender !== gender) for (const w of words(speaker)) names.delete(w);
	for (const member of cast) if (member.gender && member.gender !== tmdbGender && member.character) for (const w of words(member.character)) names.delete(w);
	if (names.size === 0) return null;
	const forms = [...names].flatMap(n => [escape(n), escape(titleCase(n))]);
	return new RegExp(`\\b(?:${forms.join('|')})\\b`);
};

/**
 * The test from one side: two named characters of `focus` ('w' or 'm') say
 * consecutive lines in a scene that never mention someone of the other gender.
 * @returns {{score: number, named: Set<string>, exchanges: Array, clean: Array}}
 */
const runTest = (screenplay, resolved, cast, focus) => {
	const other = focus === 'w' ? 'm' : 'w';
	const isNamed = speaker => resolved.get(speaker)?.gender === focus && resolved.get(speaker)?.named;
	const otherName = namePattern(resolved, cast, other);
	const otherReference = other === 'm' ? MALE_REFERENCE : FEMALE_REFERENCE;
	const aboutOther = text => otherReference.test(text) || (otherName ? otherName.test(text) : false);

	const dialogue = screenplay.scenes.flatMap(s => s.blocks).filter(b => b.kind === 'dialogue');
	const named = new Set(dialogue.map(b => b.speaker).filter(isNamed));

	// Every run of consecutive lines spoken only by named characters of `focus`, per scene
	const exchanges = [];
	screenplay.scenes.forEach((scene, sceneIndex) => {
		let run = [];
		const close = () => {
			if (new Set(run.map(b => b.speaker)).size >= 2) exchanges.push({ sceneIndex, lines: run });
			run = [];
		};
		for (const block of scene.blocks) {
			if (block.kind !== 'dialogue') continue;
			if (isNamed(block.speaker)) run.push(block);
			else close();
		}
		close();
	});
	const clean = exchanges.filter(e => !e.lines.some(line => aboutOther(line.text)));
	const score = named.size < 2 ? 0 : exchanges.length === 0 ? 1 : clean.length === 0 ? 2 : 3;
	return { score, named, exchanges, clean };
};

/**
 * @param {{scenes: Array}} screenplay - from parseScreenplay
 * @param {Map} resolved - from resolveSpeakers
 * @param {Array} cast - TMDB cast
 */
const scoreBechdel = (screenplay, resolved, cast) => {
	const { score, named, exchanges, clean } = runTest(screenplay, resolved, cast, 'w');
	const reverse = runTest(screenplay, resolved, cast, 'm');
	const dialogue = screenplay.scenes.flatMap(s => s.blocks).filter(b => b.kind === 'dialogue');
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
		namedWomen: [...named],
		exchanges: exchanges.length,
		reverse: { score: reverse.score, exchanges: reverse.exchanges.length },
	};
};

module.exports = { scoreBechdel, runTest, MALE_REFERENCE, FEMALE_REFERENCE };
