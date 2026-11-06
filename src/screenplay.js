// Reads a screenplay's plain text into scenes of action and dialogue blocks.
// Handles the two layouts the scripts come in: classic indentation (speaker
// names centered, dialogue indented less, action flush left) and flattened
// PDF text, where a speaker's name may share a line with their first words
// ("NICK (CONT'D) Whose beer am I drinking?") or be followed by a colon.

const SCENE_HEADING = /^(?:\d+[A-Z]?\.?\s+)?(?:INT|EXT|INT\.?\s*\/\s*EXT|EXT\.?\s*\/\s*INT|I\/E|E\/I|INTERIOR|EXTERIOR)(?:[.\s/:-]|$)/;
const TRANSITION = /(?:\bTO:|^FADE (?:IN|OUT)|^FADE TO|^CUT TO|^DISSOLVE|^SMASH CUT|^MATCH CUT|^THE END|^END$|^CONTINUED|^\(?CONTINUED\)?|^MORE$|^\(MORE\)$)/;
// All-caps lines that look like a name but are camera or structure notes
const NOT_A_SPEAKER = new Set([
	'ANGLE', 'ANGLE ON', 'BACK TO SCENE', 'CLOSE', 'CLOSE ON', 'CLOSE UP', 'CLOSEUP', 'CONTINUED', 'CONT', 'CUT', 'FADE IN',
	'FADE OUT', 'INSERT', 'INTERCUT', 'LATER', 'MOMENTS LATER', 'MONTAGE', 'END MONTAGE', 'POV', 'SERIES OF SHOTS', 'SUPER',
	'TITLE', 'TITLES', 'THE END', 'WIDE', 'WIDE SHOT', 'FLASHBACK', 'END FLASHBACK', 'BACK TO PRESENT', 'SILENCE', 'BLACK',
	'BLACKNESS', 'DARKNESS', 'OMITTED', 'MORE', 'NIGHT', 'DAY', 'DAWN', 'DUSK', 'MORNING', 'CONTINUOUS', 'SAME', 'THE', 'A', 'AND',
	'CREDITS', 'MAIN TITLES', 'TITLE CARD', 'CARD', 'CHYRON', 'OPENING CREDITS', 'END CREDITS', 'FREEZE FRAME', 'SLOW MOTION', 'TIME CUT', 'JUMP CUT',
]);
const SPEAKER_SUFFIX = /\s*(?:\((?:V\.?\s?O|O\.?\s?S|O\.?\s?C|CONT['’]?D|CONTD|CONT|INTO PHONE|ON PHONE|PHONE|FILTERED|OVER|PRE-?LAP|SUBTITLED?|CONT['’]?D\.?|[^)]{0,30})\.?\)\s*)+$/i;
const PAGE_NUMBER = /^\s*\d+\.?\s*$/;
// A heading without INT./EXT.: "ANNIE'S KITCHEN - SEVERAL DAYS LATER"
const PLACE_HEADING = /^[A-Z0-9][A-Z0-9 .,'’&/()#-]{2,60}\s[-–—]\s*(?:DAY|NIGHT|MORNING|EVENING|AFTERNOON|DAWN|DUSK|SUNSET|SUNRISE|LATER|CONTINUOUS|SAME(?: TIME)?|MOMENTS LATER|(?:A )?(?:FEW|SEVERAL) (?:MINUTES|HOURS|DAYS|WEEKS|MONTHS) LATER)\.?$/;
const isHeading = t => t === t.toUpperCase() && (SCENE_HEADING.test(t) || PLACE_HEADING.test(t));

/** "JAKE (V.O.)" -> "JAKE"; "NICK (CONT’D) *" -> "NICK"; "Mrs. Smith" -> "MRS. SMITH" */
const normalizeSpeaker = raw => raw
	.replace(/[*]+/g, ' ')
	.replace(SPEAKER_SUFFIX, '')
	.replace(/\s+CONT['’]?D\.?$/i, '')
	.replace(/[:.]+$/, '')
	// "BONNIE'S VOICE" is Bonnie
	.replace(/^(.+?)['’]S VOICE$/i, '$1')
	.replace(/\s+/g, ' ')
	.trim()
	.toUpperCase();

/** A line that could be a speaker cue: all caps, a few words, not a heading or transition */
const looksLikeCue = text => {
	const t = text.replace(/[*]+/g, ' ').trim();
	if (t.length < 2 || t.length > 45) return false;
	if (t !== t.toUpperCase() || !/[A-Z]{2}/.test(t)) return false;
	if (isHeading(t) || TRANSITION.test(t) || /[!?]$/.test(t)) return false;
	const name = normalizeSpeaker(t);
	if (!name || NOT_A_SPEAKER.has(name) || name.split(' ').length > 4 || /\bPOV\b|\bANGLE\b|\bSHOT\b/.test(name)) return false;
	return /^[A-Z0-9][A-Z0-9 .'’&#/-]*$/.test(name);
};

const indentOf = line => line.match(/^ */)[0].length;

/**
 * The indentation dialogue sits at: the most common indent of lines right
 * after a cue. Null for flattened scripts with no usable indentation.
 */
const layoutOf = lines => {
	const nonEmpty = lines.filter(l => l.trim());
	const actionIndents = {};
	for (const l of nonEmpty) if (l.trim().length > 45) actionIndents[indentOf(l)] = (actionIndents[indentOf(l)] || 0) + 1;
	const action = Number(Object.entries(actionIndents).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0);
	// Indentation only means something if speaker names sit well right of the action
	const deeper = nonEmpty.filter(l => indentOf(l) >= action + 8).length;
	return deeper / Math.max(nonEmpty.length, 1) >= 0.1 ? { action } : null;
};

/** A few files lost their line breaks to runs of spaces; split those back into lines */
const restoreLineBreaks = text => {
	const lines = text.split('\n');
	const longest = Math.max(...lines.map(l => l.length));
	return longest > 2000 ? text.replace(/ {6,}/g, '\n') : text;
};

/**
 * Some scripts put a blank line after every line. Undo that so a speaker's
 * name sits directly above their dialogue: one blank goes, two or more become one.
 */
const undoDoubleSpacing = lines => {
	const nonEmpty = lines.filter(l => l.trim()).length;
	const followedByBlank = lines.filter((l, i) => l.trim() && !lines[i + 1]?.trim()).length;
	if (followedByBlank / Math.max(nonEmpty, 1) < 0.8) return lines;
	const out = [];
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].trim()) {
			out.push(lines[i]);
			continue;
		}
		let run = 0;
		while (i < lines.length && !lines[i].trim()) { run++; i++; }
		if (run >= 2) out.push('');
		i--;
	}
	return out;
};

/**
 * @returns {{ layout: 'indented'|'flat', scenes: Array<{ heading: string|null,
 *   blocks: Array<{ kind: 'action', text: string } | { kind: 'dialogue', speaker: string, text: string }> }> }}
 */
const parseScreenplay = rawText => {
	const lines = undoDoubleSpacing(restoreLineBreaks(rawText.replace(/\r\n?/g, '\n'))
		.replace(/\t/g, '        ')
		.replace(/\f/g, '\n')
		.split('\n')
		.map(l => l.replace(/\s+$/, ''))
		.filter(l => !PAGE_NUMBER.test(l)));
	const layout = layoutOf(lines);

	// Flattened scripts: names seen as standalone cues, used to spot inline
	// ones; and how often each all-caps line recurs (speakers recur, shouts don't)
	const standaloneCues = new Set();
	const capsLineCount = {};
	if (!layout) {
		lines.forEach((l, i) => {
			if (!looksLikeCue(l)) return;
			const name = normalizeSpeaker(l);
			capsLineCount[name] = (capsLineCount[name] || 0) + 1;
			const next = lines[i + 1]?.trim() ?? '';
			if (next && !looksLikeCue(next) && !isHeading(next)) standaloneCues.add(name);
		});
	}

	// Older scripts write "Fran:<tab>LINE". Count each "Name:" opener; a name
	// that recurs is a speaker, a one-off ("Note:") isn't
	const TITLE_COLON = /^([A-Z][a-z]+(?: [A-Z0-9][a-z0-9]*){0,2}):\s+(\S.*)$/;
	const titleColonCount = {};
	for (const l of lines) {
		const m = l.trim().match(TITLE_COLON);
		if (m) titleColonCount[m[1]] = (titleColonCount[m[1]] || 0) + 1;
	}

	const scenes = [{ heading: null, blocks: [] }];
	const scene = () => scenes[scenes.length - 1];
	let action = [];
	const flushAction = () => {
		const text = action.join(' ').replace(/\s+/g, ' ').trim();
		if (text) scene().blocks.push({ kind: 'action', text });
		action = [];
	};
	const addDialogue = (speaker, textLines) => {
		const text = textLines
			.filter(t => !/^\(.*\)$/.test(t.trim()))
			.join(' ')
			.replace(/\([^)]*\)/g, ' ')
			.replace(/[*]+/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
		if (text) scene().blocks.push({ kind: 'dialogue', speaker, text });
	};

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmed = line.trim();
		if (!trimmed) {
			flushAction();
			continue;
		}
		if (isHeading(trimmed.replace(/^[*\s]+/, ''))) {
			flushAction();
			scenes.push({ heading: trimmed, blocks: [] });
			continue;
		}
		if (TRANSITION.test(trimmed)) continue;

		const titleColon = trimmed.match(TITLE_COLON);
		if (titleColon && titleColonCount[titleColon[1]] >= 3) {
			flushAction();
			// Continuation lines sit deeper than the line the name is on
			const said = [titleColon[2]];
			let j = i + 1;
			while (j < lines.length && lines[j].trim() && indentOf(lines[j]) > indentOf(line) && !TITLE_COLON.test(lines[j].trim())) said.push(lines[j++].trim());
			addDialogue(normalizeSpeaker(titleColon[1]), said);
			i = j - 1;
			continue;
		}

		// "BONNIE: Bull." or "NICK (CONT'D) Whose beer am I drinking?"
		const colonCue = trimmed.match(/^([A-Z][A-Z0-9 .'’&#-]{1,30}?)\s*(\([^)]*\))?\s*:\s+(\S.*)$/);
		const inlineCue = !layout && trimmed.match(/^([A-Z][A-Z0-9 .'’&#-]{1,30}?)(\s*\([^)]*\))?\s*\*?\s+(?=\S)(.*[a-z].*)$/);
		const inline = colonCue || (inlineCue && standaloneCues.has(normalizeSpeaker(inlineCue[1])) ? inlineCue : null);

		// Some scripts leave one blank line between a name and its dialogue. Allow
		// it where the name can't be action: indented right of the action margin
		// (well right, if the dialogue sits at the margin), or a name that recurs
		let first = i + 1;
		const afterGap = lines[first + 1] ?? '';
		if (!lines[first]?.trim() && afterGap.trim() && !looksLikeCue(afterGap) && !isHeading(afterGap.trim())) {
			const gapAllowed = layout
				? indentOf(afterGap) > layout.action || indentOf(line) >= layout.action + 15
				: (capsLineCount[normalizeSpeaker(trimmed)] || 0) >= 3;
			if (gapAllowed) first++;
		}
		const nextLine = lines[first] ?? '';
		const isCue = looksLikeCue(trimmed) && nextLine.trim() && !isHeading(nextLine.trim())
			&& (layout ? indentOf(line) > layout.action + 8 && indentOf(nextLine) >= layout.action : !looksLikeCue(nextLine));

		if (!isCue && !inline) {
			action.push(trimmed);
			continue;
		}
		flushAction();
		const speaker = normalizeSpeaker(inline ? inline[1] : trimmed);
		const said = inline ? [inline[3]] : [];
		// Dialogue runs until a blank line, a new cue or heading, or (indented
		// scripts) a line back at the action margin
		// Indented scripts: dialogue ends where a line starts left of its first
		// line (scripts that put dialogue at the action margin end it with a blank)
		const start = inline ? i + 1 : first;
		const dialogueIndent = indentOf(lines[start] ?? '');
		let j = start;
		for (; j < lines.length; j++) {
			const l = lines[j];
			const t = l.trim();
			if (!t || isHeading(t) || TRANSITION.test(t)) break;
			if (layout && !inline && indentOf(l) < dialogueIndent && indentOf(l) <= layout.action) break;
			if (looksLikeCue(t) && (layout ? indentOf(l) > layout.action + 8 : true)) break;
			if (!layout && (/^([A-Z][A-Z0-9 .'’&#-]{1,30}?)\s*(\([^)]*\))?\s*:\s+\S/.test(t))) break;
			if (!layout) {
				const m = t.match(/^([A-Z][A-Z0-9 .'’&#-]{1,30}?)(\s*\([^)]*\))?\s*\*?\s+\S/);
				if (m && standaloneCues.has(normalizeSpeaker(m[1]))) break;
			}
			said.push(t);
		}
		addDialogue(speaker, said);
		i = j - 1;
	}
	flushAction();
	return { layout: layout ? 'indented' : 'flat', scenes: scenes.filter(s => s.blocks.length > 0) };
};

module.exports = { parseScreenplay, normalizeSpeaker };
