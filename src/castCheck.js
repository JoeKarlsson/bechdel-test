/**
 * How well a script fits a film: how many of its main speakers share a name
 * with a character in the film's cast. A remake, a TV series or a different
 * film with the same title shares few or none.
 */
const { parseScreenplay } = require('./screenplay');

// The speakers checked: enough to see past extras, few enough to stay the main cast
const MAIN_SPEAKERS = 12;
// Fewer shared names than this, and the match needs checking by hand
const CONFIRMED_AT = 2;
// Words in a character name that say nothing about who it is
const FILLER_WORDS = new Set(['THE', 'AND', 'MRS', 'MR', 'DR', 'VOICE', 'HIMSELF', 'HERSELF', 'UNCREDITED']);

const nameWords = name => name.toUpperCase().replace(/[^A-Z ]/g, ' ').split(/\s+/)
	.filter(word => word.length > 2 && !FILLER_WORDS.has(word));

/** The script's main speakers whose name shares a word with a cast character's ("RICK" and "Rick Blaine") */
const speakersInCast = (scriptText, cast) => {
	const lines = {};
	for (const block of parseScreenplay(scriptText).scenes.flatMap(scene => scene.blocks)) {
		if (block.kind === 'dialogue') lines[block.speaker] = (lines[block.speaker] ?? 0) + 1;
	}
	const castWords = new Set(cast.flatMap(member => nameWords(member.character ?? '')));
	return Object.entries(lines).sort(([, a], [, b]) => b - a).slice(0, MAIN_SPEAKERS)
		.map(([speaker]) => speaker)
		.filter(speaker => nameWords(speaker).some(word => castWords.has(word)));
};

module.exports = { speakersInCast, CONFIRMED_AT };
