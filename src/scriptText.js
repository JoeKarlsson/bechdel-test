/**
 * Script text as it comes off the web: how readable it is, and the cleanup
 * every downloaded script gets before it's saved.
 */
const fs = require('fs');

/** Share of tokens that are words ("Hello," "MARY" "don't"), not OCR debris ("a,1.d" "~7") */
const textQuality = text => {
	const tokens = text.split(/\s+/).filter(Boolean);
	const words = tokens.filter(t => /^["“‘'(]?(?:[A-Za-z][a-z'’]*|[A-Z][A-Z'’]+)[.,!?;:"”’)]*$/.test(t));
	return words.length / Math.max(1, tokens.length);
};

// The system word list (macOS and most Linux): 235,000 English words
const WORD_LIST_PATH = '/usr/share/dict/words';
let dictionary = null;
const loadDictionary = () => {
	if (!dictionary) {
		if (!fs.existsSync(WORD_LIST_PATH)) throw new Error(`No word list at ${WORD_LIST_PATH}; install one (e.g. the wamerican package) to measure script text`);
		dictionary = new Set(fs.readFileSync(WORD_LIST_PATH, 'utf8').split('\n').map(word => word.toLowerCase()));
	}
	return dictionary;
};
// Word forms the list lacks: plurals, verb endings, contractions, dropped g's
const ENDINGS = [/s$/, /es$/, /ed$/, /d$/, /ing$/, /ly$/, /er$/, /est$/];
const isEnglish = word => {
	const words = loadDictionary();
	return words.has(word) || ENDINGS.some(end => end.test(word) && words.has(word.replace(end, '')))
		|| /^[a-z]+(?:n't|'s|'re|'ll|'ve|'d|'m)$/.test(word)
		// "nothin'", "doin'": the match drops the apostrophe
		|| (word.endsWith('in') && isEnglish(`${word}g`));
};

/**
 * Share of the dialogue's lowercase words (3+ letters) that are English, the
 * test of whether a script's speech is usable. Clean scripts score 92-99%
 * (slang and dialect included); bad OCR ("a evxtew here ia Casaclanca") scores
 * under 90. Null when the parser finds no dialogue words to judge.
 */
const dialogueEnglishShare = dialogueTexts => {
	const words = dialogueTexts.join(' ').replace(/[’‘]/g, "'").match(/\b[a-z][a-z']{2,}\b/g) || [];
	return words.length > 0 ? words.filter(isEnglish).length / words.length : null;
};

// Windows-1252's characters for bytes 0x80-0x9F (the rest map to themselves)
const CP1252_HIGH = '€\u0081‚ƒ„…†‡ˆ‰Š‹Œ\u008DŽ\u008F\u0090‘’“”•–—˜™š›œ\u009DžŸ';
const byteOf = char => {
	const index = CP1252_HIGH.indexOf(char);
	return index >= 0 ? 0x80 + index : char.charCodeAt(0);
};
const UTF8 = new TextDecoder('utf-8', { fatal: true });

/**
 * UTF-8 that was read as Windows-1252, put back: "donâ€™t" -> "don’t",
 * "cafÃ©" -> "café". A run is only replaced when its bytes are valid UTF-8.
 */
const fixMojibake = text => text.replace(/[ÂÃâ][\u0080-¿€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]{1,2}/g, run => {
	try {
		return UTF8.decode(Uint8Array.from([...run].map(byteOf)));
	} catch {
		return run;
	}
});

// Lines that sites and PDF tools stamp on every page; never part of the script
const WATERMARKS = [
	/\b\d*FLiX\.com (?:FYC )?SCREENPLAY DATABASE\b\s*\d*/i,
	/^\s*FOR EDUCATIONAL (?:USE|PURPOSES) ONLY\s*$/i,
	/==\s*Script Fly\.com\s*==/i,
	/Script provided for educational purposes\. More scripts can be found here:\s*\S*/i,
	/Create PDF files without this message by purchasing novaPDF printer\s*\(\S*\)/i,
];

/**
 * A downloaded script made ready to save: page breaks (form feeds) become
 * line breaks, mojibake is repaired, and watermark lines are dropped.
 */
const cleanScriptText = text => fixMojibake(text)
	.replace(/\r\n?|\f/g, '\n')
	.split('\n')
	.flatMap(line => {
		const cleaned = WATERMARKS.reduce((rest, watermark) => rest.replace(watermark, ''), line);
		return cleaned === line || cleaned.trim() ? [cleaned.trimEnd()] : [];
	})
	.join('\n');

module.exports = { textQuality, dialogueEnglishShare, fixMojibake, cleanScriptText };
