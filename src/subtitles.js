// Subtitle sentences cleaned down to spoken words, the same way for every
// film (docs/page-vs-screen/METHODS.md): SDH sound tags and lyrics out,
// speaker labels kept as evidence of who speaks, credit and ad lines dropped.

// "[door slams]", "(laughs)", "<i>", "{\an8}"
const SOUND_TAG = /\[[^\]]*\]|\([^)]*\)/g;
const MARKUP = /<[^>]+>|\{[^}]*\}/g;
// "KAT:", "MR. STRATFORD:", "[Kat]" at the start of a line (SDH speaker labels)
const SPEAKER_LABEL = /^(?:\[([A-Za-z][\w .'-]{0,30})\]|([A-Z][A-Z0-9 .'-]{1,30}):)\s*/;
const LYRIC = /[♪♫#]/;
const CREDIT = /\b(?:subtitles?|subtitled|captions?|captioned|synced?|sync|corrected|ripped|transcript|translated)\s+(?:by|and)\b|opensubtitles|addic7ed|subscene|podnapisi|www\.|\.com\b|\.org\b|\.net\b/i;

/**
 * @param {Array<{start, end, text}>} sentences - from parseOpusXml
 * @returns {{lines: Array<{start, end, text, speaker: string|null, turn: boolean}>, lyrics: number, credits: number, soundTags: number}}
 *   turn: the line opened with a dialogue dash, so someone else is speaking
 */
const cleanSubtitles = sentences => {
	const lines = [];
	let lyrics = 0;
	let credits = 0;
	let soundTags = 0;
	for (const sentence of sentences) {
		let text = sentence.text.replace(MARKUP, ' ');
		if (LYRIC.test(text)) { lyrics++; continue; }
		if (CREDIT.test(text)) { credits++; continue; }
		const turn = /^\s*-/.test(text);
		text = text.replace(/^\s*-\s*/, '');
		const label = text.match(SPEAKER_LABEL);
		const speaker = label ? (label[1] ?? label[2]).trim().toUpperCase() : null;
		if (label) text = text.slice(label[0].length);
		const untagged = text.replace(SOUND_TAG, ' ');
		if (untagged !== text) soundTags++;
		text = untagged.replace(/\s+/g, ' ').trim();
		if (/[A-Za-z0-9]/.test(text)) lines.push({ start: sentence.start, end: sentence.end, text, speaker, turn: turn || Boolean(label) });
	}
	return { lines, lyrics, credits, soundTags };
};

/** SDH (subtitles for the deaf and hard of hearing): a fixed share of lines carry sound tags or speaker labels */
const SDH_SHARE = 0.03;
const isSdh = (sentences, { soundTags, lines }) =>
	(soundTags + lines.filter(line => line.speaker).length) / Math.max(1, sentences.length) >= SDH_SHARE;

module.exports = { cleanSubtitles, isSdh, SDH_SHARE };
