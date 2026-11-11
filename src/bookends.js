// The first and last lines of dialogue in a script, and who says them.
// Screenplays open on title pages and close on credits and songs, and in
// scripts without indentation the stage direction after a line can run into
// it, so this skips what isn't a character speaking and trims the quote to
// the spoken words. When nothing near the start (or end) is clearly a
// character's line, the answer is null rather than a guess.

// Cues that are credits, music, transitions or more than one person
const NOT_A_CHARACTER = /\b(?:SONG|SINGS?|SINGING|SINGERS?|LYRICS?|MUSIC|CHORUS|BY|DRAFTS?|REVISIONS?|PRODUCERS?|WRITTEN|SCREENPLAY|STORY|CONTINUED|DISSOLVE|FADE|CUT|INTERIOR|EXTERIOR|NOTE|TITLES?|CREDITS?|SUPER|SUPERIMPOSE|INSERT|AD[- ]?LIB|TOGETHER|BOTH|UNISON|FLASHBACK|MONTAGE|CU|CAMERA|VIEW|ANGLE|SHOT|PART|WITH|SCHEDULE)\b|\s(?:AND|&)\s/;
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
const CREDIT = /^(?:by|written by|a true story|based on)\b|\b(?:original story|screen\W?play|shooting script|draft)\b|^[A-Z][a-z]+\.? \d{1,2},? \d{4}\.?$/i;
const CAMERA = /^(?:We|Camera|The camera)\s+(?:follow|see|hear|pull|push|pan|move|track|cut|stay|hold|find|tilt|crane|drift|stay)s?\b|^(?:In the b\.?g\.?|Close on|Angle on|Back to|Over this|Off this|On screen|Pull back|Push in)\b|^(?:And )?[Tt]hey (?:kiss|embrace|hug|walk|turn|look|exit|leave|drive|run|go|stare)\b/;
// Screenplay shorthand only stage directions put in capitals
const DIRECTION_CAPS = /\b(?:CAMERA|ANGLE|CLOSE|SHOT|PULLS?|PANS?|FREEZE|HOLD|VIEW|SCREEN|CREDITS|TITLES|MUSIC|CONTINUED|INSERT|SUPER|MONTAGE|BACKGROUND|RINGS|WE SEE|WE HEAR)\b/;

const sentencesOf = text => text.match(/[^.!?]+(?:[.!?]+["'’”)]*|$)/g)?.map(s => s.trim()).filter(Boolean) ?? [];

/**
 * A sentence that reads as action: camera language, a cue the parser ran into
 * the line ("MARK I'll keep my eye on you"), or a character's name then a
 * present-tense verb ("Amy turns", "Jack and Teresa climb")
 */
const isAction = (sentence, names, opening) => {
	// An all-capitals opening is shouting ("HOLD IT!"); after the line it's a direction ("CAMERA PANS UP")
	if (CAMERA.test(sentence) || (DIRECTION_CAPS.test(sentence) && (!opening || /[a-z]/.test(sentence)))) return true;
	const cue = sentence.match(/^([A-Z][A-Z.'’-]+(?: [A-Z][A-Z.'’-]+)*?) (?=\S*[a-z])/);
	if (cue && names.has(cue[1])) return true;
	const named = sentence.match(/^([A-Z][a-z]+)(?: and ([A-Z][a-z]+))? ([a-z]+)\b/);
	return !!named && names.has(named[1].toUpperCase()) && (/s$/.test(named[3]) || !!named[2]);
};

/** The spoken words of a line, short enough to quote; '' if nothing is left */
const quoteOf = (text, names) => {
	// OCR leaves bullets and stray marks; a lone leading dot is debris, an ellipsis isn't
	const flat = text.replace(/[•·~]+/g, '').replace(/\s+/g, ' ').replace(/^(?:[^A-Za-z0-9"'‘“(¡¿.]|\.(?!\.))+/, '').replace(TRANSITION, '').trim();
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
	return /[a-z]{2}/.test(quote) && !CREDIT.test(quote) && strayCaps.size < 2 ? quote : '';
};

/**
 * { first, last }: each { speaker: index into speakers, line: 1-based line
 * of dialogue, text } or null when the script has no clear line there.
 * `dialogue` is the parsed dialogue blocks in order; `speakers` is the
 * summary's speaker list ({ name, lines, gender }).
 */
const bookendLines = (dialogue, speakers) => {
	const index = new Map(speakers.map((s, i) => [s.name, i]));
	const names = new Set(speakers.flatMap(s => [s.name, ...s.name.split(/[\s.]+/)]).filter(word => word.length > 1));
	const window = Math.max(SEARCH_LINES, Math.round(dialogue.length * SEARCH_SHARE));
	const lineAt = i => {
		const block = dialogue[i];
		const speaker = speakers[index.get(block.speaker)];
		if (!speaker || NOT_A_CHARACTER.test(speaker.name)) return null;
		if (!speaker.gender && speaker.lines < MIN_LINES_UNKNOWN_SPEAKER) return null;
		const text = quoteOf(block.text, names);
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
