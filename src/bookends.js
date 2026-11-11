// The first and last lines of dialogue in a script, and who says them.
// Screenplays open on title pages and close on credits and songs, and in
// scripts without indentation the stage direction after a line can run into
// it, so this skips what isn't a character speaking and trims the quote to
// the spoken words. When nothing near the start (or end) is clearly a
// character's line, the answer is null rather than a guess.

// Cues that are credits, music, transitions or more than one person
const NOT_A_CHARACTER = /\b(?:SONG|SINGS?|SINGING|SINGERS?|LYRICS?|MUSIC|CHORUS|BY|DRAFTS?|REVISIONS?|PRODUCERS?|WRITTEN|SCREENPLAY|STORY|CONTINUED|DISSOLVE|FADE|CUT|INTERIOR|EXTERIOR|NOTE|TITLES?|CREDITS?|SUPER|SUPERIMPOSE|INSERT|AD[- ]?LIB|TOGETHER|BOTH|UNISON|FLASHBACK|MONTAGE|CU|CAMERA|VIEW|ANGLE|SHOT|CLOSE|EXTREME|PHOTO|SCREEN|DAY|THEN|DIALOGUE|TYPES|FONT|PARTICULAR|S?FX|SET|PART|WITH|SCHEDULE)\b|\s(?:AND|&)\s|^ON\s/;
// A speaker with fewer lines than this and no known gender is likely a
// misread cue (a title page, a slug line), not a character
const MIN_LINES_UNKNOWN_SPEAKER = 3;
// How far in from either end to look: past this many lines, whatever we find
// isn't the film's first (or last) line any more
const SEARCH_LINES = 12;
const SEARCH_SHARE = 0.02;
const MAX_QUOTE = 280;

// Where a stage direction or transition takes over from the spoken words
const TRANSITION = /\s*\b(?:FADE (?:OUT|IN|TO BLACK|TO WHITE)|CUT TO(?: BLACK)?|SMASH CUT|DISSOLVE TO|THE END|END CREDITS|ROLL CREDITS|CREDITS ROLL)\b.*$/;
// Title-page text under a cue the parser took for a speaker ("GONE GIRL / August 29, 2013")
const CREDIT = /^(?:by|written by|a true story|based on)\b|\b(?:original story|screen\W?play|shooting script|draft|dialogue list)\b|^[A-Z][a-z]+\.? \d{1,2},? \d{4}\.?$/i;
const CAMERA = /^(?:We|Camera|The camera)\s+(?:follow|see|hear|pull|push|pan|move|track|cut|stay|hold|find|tilt|crane|drift|stay)s?\b|^(?:In the b\.?g\.?|Close on|Angle on|Back to|Over this|Off this|On screen|Pull back|Push in)\b|^(?:And )?[Tt]hey (?:kiss|embrace|hug|walk|turn|look|exit|leave|drive|run|go|stare)\b/;
// Screenplay shorthand only stage directions put in capitals
const DIRECTION_CAPS = /\b(?:CAMERA|ANGLE|CLOSE|SHOT|PULLS?|PANS?|FREEZE|HOLD|VIEW|SCREEN|CREDITS|TITLES|MUSIC|CONTINUED|INSERT|SUPER|MONTAGE|BACKGROUND|RINGS|WE SEE|WE HEAR)\b/;
// A character introduced in capitals: "MARK LIJEK, 29, a consular officer", "The REPORTER is disappointed"
const INTRO = /\b[A-Z]{3,}(?:[ .'’-]+[A-Z]{2,})*(?:,\.?\s+(?:\d{1,3}\b|an?\s|his\s|her\s|the\s|wearing\b|late\s|early\s|mid\s)|\s+(?:is|are|has|was|stands|sits|enters|walks|looks|turns|does|jumps?|leads|goes|smiles|nods|joins|steps|crosses|grunts)\b)/;
// The next speaker's cue run into the line: "I'm sorry-- MAN It's ok", "Nobody. MAYOR: Your wife?"
const CUE_IN_LINE = /(?<=[-—–.!?…'"’”:|]\s*)\s([A-Z][A-Z.'’-]+(?: [A-Z][A-Z.'’-]+)*)(:\s(?=[-–—"“A-Z])|\s(?=[A-Z][a-z'’]|I\s))/g;
// A parenthetical, or the tail of one the parser cut in half: "(then, calmly)", "playing commentator)"
const PARENTHETICAL = /\([^)]*\)|(?:^|(?<=[.!?]\s))[A-Za-z{][^().!?'’]{0,30}\)/g;
// After the line: "He smiles and turns his back", "The other teachers laugh", "A beat." Catching dialogue
// by mistake ("He knows you have Blount") only shortens the quote; missing a direction puts it in the quote.
const ACTION_AFTER = /^(?:(?:He|She|The|His|Her|Their)(?: [a-z]+)? (?!is\b|was\b|has\b|does\b)[a-z]+s\b|A (?:beat|pause|moment)\b|Beat\b|Pause\b)/;
// A line that opens on action, the character's name split off as the cue: "BACON / lunges forward", "as he whirls around", "AMY / and STACY sit"
const ACTION_OPENING = /^(?:as (?:he|she|they)\b|and [A-Z]{3,}\b|(?:slowly|quickly|suddenly)\b|[a-z]+s (?:forward|back|in|out|up|down|away|across|into|towards?|over|around|off|at|to|one|a|an|the|his|her|their)\b)/;

// A full stop after an initial or a title isn't a sentence end: "L.A.", "J. D. Banks", "Mr. Enslin"
const sentencesOf = text => text.split(/(?<=(?<!\b(?:[A-HJ-Z]|Mr|Mrs|Ms|Dr|St))[.!?]+["'’”)]*)\s+/).map(s => s.trim()).filter(Boolean);

/**
 * A sentence that reads as action: camera language, a cue the parser ran into
 * the line ("MARK I'll keep my eye on you"), or a character's name then a
 * present-tense verb ("Amy turns", "Jack and Teresa climb")
 */
const isAction = (sentence, names, opening) => {
	// An all-capitals opening is shouting ("HOLD IT!"); after the line it's a direction ("CAMERA PANS UP")
	if (CAMERA.test(sentence) || (DIRECTION_CAPS.test(sentence) && (!opening || /[a-z]/.test(sentence)))) return true;
	// An opening can be a cue's second word ("PHIL / CONNORS is standing..."); later, an intro anywhere is action
	const intro = sentence.match(INTRO);
	if (intro && (!opening || intro.index === 0)) return true;
	// After the line, a whole sentence in capitals ending in a full stop is a direction ("THE CAR ROARS AWAY.")
	if (!opening && !/[a-z]/.test(sentence) && /\.$/.test(sentence) && sentence.split(/\s+/).length >= 4) return true;
	if (opening ? ACTION_OPENING.test(sentence) : ACTION_AFTER.test(sentence)) return true;
	const cue = sentence.match(/^([A-Z][A-Z.'’-]+(?: [A-Z][A-Z.'’-]+)*?) (?=\S*[a-z])/);
	if (cue && names.has(cue[1])) return true;
	const named = sentence.match(/^([A-Z][a-z]+)(?: and ([A-Z][a-z]+))? ([a-z]+)\b/);
	return !!named && names.has(named[1].toUpperCase()) && (/s$/.test(named[3]) || !!named[2]);
};

/** The spoken words of a line, short enough to quote; '' if nothing is left */
const quoteOf = (text, names, speakerNames = names) => {
	// Only the start of a parenthetical, "(mock-serious,": the words are on the next line
	if (/^\s*\([^)]*$/.test(text)) return '';
	// OCR leaves bullets and stray marks; a lone leading dot is debris, an ellipsis isn't
	let flat = text.replace(/[•·~]+/g, '').replace(/\s+/g, ' ').replace(TRANSITION, '').trim()
		.replace(PARENTHETICAL, ' ').replace(/\s+/g, ' ').replace(/^(?:[^A-Za-z0-9"'‘“¡¿.]|\.(?!\.))+/, '').trim();
	for (const cue of flat.matchAll(CUE_IN_LINE)) {
		if (cue[2].startsWith(':') || speakerNames.has(cue[1])) {
			flat = flat.slice(0, cue.index).trim();
			break;
		}
	}
	const kept = [];
	for (const sentence of sentencesOf(flat)) {
		if (isAction(sentence, names, kept.length === 0)) {
			if (kept.length === 0) return '';
			break;
		}
		kept.push(sentence);
	}
	let quote = kept.join(' ');
	if (quote.length > MAX_QUOTE) {
		let cut = '';
		for (const sentence of kept) {
			if ((cut ? `${cut} ${sentence}` : sentence).length > MAX_QUOTE) break;
			cut = cut ? `${cut} ${sentence}` : sentence;
		}
		quote = cut || `${quote.slice(0, MAX_QUOTE).replace(/\s+\S*$/, '')}…`;
		if (!/[….!?]["'’”)]*$/.test(quote)) quote += '…';
	}
	// Capitals left inside lowercase sentences are stage directions we couldn't cut away
	const strayCaps = new Set(sentencesOf(quote).filter(sentence => /[a-z]/.test(sentence))
		.flatMap(sentence => sentence.match(/\b[A-Z]{4,}\b/g) ?? []).filter(word => !names.has(word)));
	return /[a-z]/.test(quote) && /[A-Za-z]{2}/.test(quote) && !CREDIT.test(quote) && strayCaps.size < 2 ? quote : '';
};

/**
 * { first, last }: each { speaker: index into speakers, line: 1-based line
 * of dialogue, text } or null when the script has no clear line there.
 * `dialogue` is the parsed dialogue blocks in order; `speakers` is the
 * summary's speaker list ({ name, lines, gender }).
 */
const bookendLines = (dialogue, speakers) => {
	const index = new Map(speakers.map((s, i) => [s.name, i]));
	const speakerNames = new Set(speakers.map(s => s.name));
	const names = new Set(speakers.flatMap(s => [s.name, ...s.name.split(/[\s.]+/)]).filter(word => word.length > 1));
	const window = Math.max(SEARCH_LINES, Math.round(dialogue.length * SEARCH_SHARE));
	const lineAt = i => {
		const block = dialogue[i];
		const speaker = speakers[index.get(block.speaker)];
		if (!speaker || NOT_A_CHARACTER.test(speaker.name)) return null;
		if (!speaker.gender && speaker.lines < MIN_LINES_UNKNOWN_SPEAKER) return null;
		// Some scripts repeat the cue on the line itself: "EMMA I promise you..."
		const said = block.text.trimStart().startsWith(`${speaker.name} `) ? block.text.trimStart().slice(speaker.name.length) : block.text;
		const text = quoteOf(said, names, speakerNames);
		return text ? { speaker: index.get(block.speaker), line: i + 1, text } : null;
	};
	const find = order => {
		for (const i of order) {
			const line = lineAt(i);
			if (line) return line;
		}
		return null;
	};
	const span = Math.min(window, dialogue.length);
	return {
		first: find(Array.from({ length: span }, (_, i) => i)),
		last: find(Array.from({ length: span }, (_, i) => dialogue.length - 1 - i)),
	};
};

module.exports = { bookendLines, quoteOf };
