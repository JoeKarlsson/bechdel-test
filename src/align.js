// Lines up a screenplay's dialogue with a film's subtitles, word by word.
// Method (docs/page-vs-screen/METHODS.md, section 1.5):
//   1. both sides become normalized words (same rules on each side)
//   2. anchors: word sequences found exactly once on each side, kept only
//      where they run in the same order (longest increasing chain, as in
//      patience diff); between anchors the search repeats with shorter
//      sequences, and small gaps get an exact longest-common-subsequence
//   3. lone one-word matches are dropped unless the word is a whole line
//   4. script runs left over are matched against leftover subtitle runs
//      anywhere in the film: these are lines moved in the edit
// The result says, per script word and per subtitle word, what it matched.

// Spoken forms subtitlers and screenwriters write differently, mapped to one form
const EQUIVALENT = {
	gonna: 'going to', wanna: 'want to', gotta: 'got to', gimme: 'give me', lemme: 'let me', kinda: 'kind of',
	sorta: 'sort of', outta: 'out of', dunno: 'do not know', ok: 'okay', em: 'them', til: 'until', till: 'until',
	cause: 'because', cuz: 'because', mr: 'mister', mrs: 'missus', dr: 'doctor', st: 'saint', nothin: 'nothing',
	somethin: 'something', ya: 'you', yer: 'your', tryin: 'trying', goin: 'going', doin: 'doing', talkin: 'talking',
	comin: 'coming', lookin: 'looking', fuckin: 'fucking', gettin: 'getting', sayin: 'saying',
};
// Hesitations subtitlers usually leave out and scripts rarely write
const FILLERS = new Set(['uh', 'um', 'uhm', 'er', 'erm', 'ah', 'hmm', 'mm', 'mmm', 'hm']);
const SMALL = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
	'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const numberWords = n => (n < 20 ? SMALL[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${SMALL[n % 10]}` : ''}`);

/** "I'm gonna be 26, Mr. Bickle!" -> ['im', 'going', 'to', 'be', 'twenty', 'six', 'mister', 'bickle'] */
const normalizeWords = text => text
	.toLowerCase()
	.normalize('NFKD').replace(/[̀-ͯ]/g, '')
	.replace(/[‘’`]/g, "'")
	.replace(/\b\d{1,2}\b/g, digits => numberWords(Number(digits)))
	.replace(/'/g, '')
	.split(/[^a-z0-9]+/)
	.filter(Boolean)
	.flatMap(word => (EQUIVALENT[word] ?? word).split(' '))
	.filter(word => !FILLERS.has(word));

/** Every line's words, flattened, with the index of the line each word came from */
const wordsOf = texts => {
	const words = [];
	const owner = [];
	texts.forEach((text, line) => {
		for (const word of normalizeWords(text)) { words.push(word); owner.push(line); }
	});
	return { words, owner };
};

/** n-word sequences that occur exactly once in words[from..to), keyed by text, valued by start */
const uniqueGrams = (words, from, to, n) => {
	const seen = new Map();
	for (let i = from; i + n <= to; i++) {
		const key = words.slice(i, i + n).join(' ');
		seen.set(key, seen.has(key) ? -1 : i);
	}
	return seen;
};

/** The longest chain of pairs increasing on both sides (pairs come sorted by a) */
const longestIncreasing = pairs => {
	const tails = [];
	const previous = new Array(pairs.length);
	pairs.forEach((pair, i) => {
		let lo = 0;
		let hi = tails.length;
		while (lo < hi) {
			const mid = (lo + hi) >> 1;
			if (pairs[tails[mid]].b < pair.b) lo = mid + 1; else hi = mid;
		}
		previous[i] = lo > 0 ? tails[lo - 1] : -1;
		tails[lo] = i;
	});
	const chain = [];
	for (let i = tails.length ? tails[tails.length - 1] : -1; i >= 0; i = previous[i]) chain.unshift(pairs[i]);
	return chain;
};

// Gaps up to this many cells (script words x subtitle words) get an exact LCS
const LCS_CELLS = 250_000;
// Shorter anchors are trusted only inside gaps this small on both sides
const SHORT_ANCHOR_GAP = 80;

const lcs = (a, b, a0, a1, b0, b1, matchA) => {
	const n = a1 - a0;
	const m = b1 - b0;
	const table = new Uint16Array((n + 1) * (m + 1));
	for (let i = n - 1; i >= 0; i--) {
		for (let j = m - 1; j >= 0; j--) {
			table[i * (m + 1) + j] = a[a0 + i] === b[b0 + j]
				? table[(i + 1) * (m + 1) + j + 1] + 1
				: Math.max(table[(i + 1) * (m + 1) + j], table[i * (m + 1) + j + 1]);
		}
	}
	for (let i = 0, j = 0; i < n && j < m;) {
		if (a[a0 + i] === b[b0 + j]) { matchA[a0 + i] = b0 + j; i++; j++; }
		else if (table[(i + 1) * (m + 1) + j] >= table[i * (m + 1) + j + 1]) i++;
		else j++;
	}
};

/** Fills matchA[i] = index in b for every word of a[a0..a1) matched in order within b[b0..b1) */
const alignRegion = (a, b, a0, a1, b0, b1, matchA) => {
	if (a0 >= a1 || b0 >= b1) return;
	const small = a1 - a0 <= SHORT_ANCHOR_GAP && b1 - b0 <= SHORT_ANCHOR_GAP;
	for (const n of small ? [4, 3, 2, 1] : [4, 3]) {
		const inA = uniqueGrams(a, a0, a1, n);
		const inB = uniqueGrams(b, b0, b1, n);
		const pairs = [];
		for (const [key, i] of inA) {
			const j = inB.get(key);
			if (i >= 0 && j !== undefined && j >= 0) pairs.push({ a: i, b: j });
		}
		if (pairs.length === 0) continue;
		pairs.sort((x, y) => x.a - y.a);
		let lastA = a0;
		let lastB = b0;
		for (const { a: i, b: j } of longestIncreasing(pairs)) {
			// overlapping anchors: the earlier one already covers these words
			if (i < lastA || j < lastB) continue;
			alignRegion(a, b, lastA, i, lastB, j, matchA);
			for (let k = 0; k < n; k++) matchA[i + k] = j + k;
			lastA = i + n;
			lastB = j + n;
		}
		alignRegion(a, b, lastA, a1, lastB, b1, matchA);
		return;
	}
	if ((a1 - a0) * (b1 - b0) <= LCS_CELLS) lcs(a, b, a0, a1, b0, b1, matchA);
};

/** Drops matched runs of one word unless that word is its whole script line or subtitle line */
const dropLoneMatches = (matchA, ownerA, ownerB) => {
	const lineLength = owner => owner.reduce((counts, line) => counts.set(line, (counts.get(line) ?? 0) + 1), new Map());
	const lengthA = lineLength(ownerA);
	const lengthB = lineLength(ownerB);
	for (let i = 0; i < matchA.length; i++) {
		const j = matchA[i];
		if (j < 0) continue;
		const joined = (i > 0 && matchA[i - 1] === j - 1) || (i + 1 < matchA.length && matchA[i + 1] === j + 1);
		if (!joined && lengthA.get(ownerA[i]) > 1 && lengthB.get(ownerB[j]) > 1) matchA[i] = -1;
	}
};

// A script run left unmatched must be at least this long to count as moved
const MIN_MOVED_RUN = 12;

/** Matches leftover script runs to leftover subtitle words anywhere, by shared unique 4-word sequences */
const findMoved = (a, b, matchA) => {
	const usedB = new Uint8Array(b.length);
	for (const j of matchA) if (j >= 0) usedB[j] = 1;
	const moved = new Uint8Array(a.length);
	const freeGrams = (words, isFree, n = 4) => {
		const seen = new Map();
		for (let i = 0; i + n <= words.length; i++) {
			let free = true;
			for (let k = 0; k < n; k++) if (!isFree(i + k)) free = false;
			if (!free) continue;
			const key = words.slice(i, i + n).join(' ');
			seen.set(key, seen.has(key) ? -1 : i);
		}
		return seen;
	};
	// only runs long enough to be a moved passage, not a stray cut line
	const inLongRun = new Uint8Array(a.length);
	for (let i = 0; i < a.length;) {
		let end = i;
		while (end < a.length && matchA[end] < 0) end++;
		if (end - i >= MIN_MOVED_RUN) inLongRun.fill(1, i, end);
		i = Math.max(end, i + 1);
	}
	const gramsA = freeGrams(a, i => inLongRun[i] === 1);
	const gramsB = freeGrams(b, j => usedB[j] === 0);
	for (const [key, i] of gramsA) {
		const j = gramsB.get(key);
		if (i < 0 || j === undefined || j < 0) continue;
		// extend the shared run forward while both sides stay free and equal
		for (let k = 0; i + k < a.length && j + k < b.length && matchA[i + k] < 0 && !usedB[j + k] && a[i + k] === b[j + k]; k++) {
			matchA[i + k] = j + k;
			usedB[j + k] = 1;
			moved[i + k] = 1;
		}
	}
	return moved;
};

/**
 * @param {string[]} pageLines - the script's dialogue, in order
 * @param {string[]} screenLines - the subtitles' lines, in order
 * @returns {{page: {words, owner, match: Int32Array, moved: Uint8Array}, screen: {words, owner, matched: Uint8Array}}}
 *   page.match[i] is the subtitle word script word i matched (-1 for none)
 */
const alignDialogue = (pageLines, screenLines) => {
	const page = wordsOf(pageLines);
	const screen = wordsOf(screenLines);
	const match = new Int32Array(page.words.length).fill(-1);
	alignRegion(page.words, screen.words, 0, page.words.length, 0, screen.words.length, match);
	dropLoneMatches(match, page.owner, screen.owner);
	const moved = findMoved(page.words, screen.words, match);
	const matched = new Uint8Array(screen.words.length);
	for (const j of match) if (j >= 0) matched[j] = 1;
	return { page: { ...page, match, moved }, screen: { ...screen, matched } };
};

/** Per line: how many of its words there are and how many matched */
const lineShares = (lineCount, owner, isMatched) => {
	const lines = Array.from({ length: lineCount }, () => ({ words: 0, matched: 0 }));
	owner.forEach((line, i) => {
		lines[line].words++;
		if (isMatched(i)) lines[line].matched++;
	});
	return lines;
};

module.exports = { normalizeWords, alignDialogue, lineShares, longestIncreasing };
