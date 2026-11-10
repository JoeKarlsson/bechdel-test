// Forgiving title matching, for the shelf search and the 404 page's "Did you mean"

/** Lowercase letters and digits only (any script), accents dropped: "Amélie!" becomes "amelie" */
export const squash = (s) =>
	String(s ?? '')
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]/gu, '');

/** The fewest single-letter edits that turn a into b */
export function editDistance(a, b) {
	let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
	for (let i = 1; i <= a.length; i++) {
		const row = [i];
		for (let j = 1; j <= b.length; j++) row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
		prev = row;
	}
	return prev[b.length];
}

/**
 * The candidate whose key is nearest the query, or null when none is close:
 * within 30% of the query's length (at least 2 edits). keysOf gives each
 * candidate's keys, such as a title with and without its leading "The".
 */
export function closest(query, candidates, keysOf) {
	const q = squash(query);
	if (q.length < 3) return null;
	const limit = Math.max(2, Math.round(q.length * 0.3));
	let best = null;
	let bestDistance = limit + 1;
	for (const candidate of candidates) {
		for (const key of keysOf(candidate)) {
			const k = squash(key);
			if (Math.abs(k.length - q.length) >= bestDistance) continue; // can't beat the best so far
			const d = editDistance(q, k);
			if (d < bestDistance) [best, bestDistance] = [candidate, d];
		}
	}
	return best;
}

/** A title's keys: as written, and without a leading "The", "A" or "An" */
export const titleKeys = (title) => [title, title.replace(/^(the|a|an)\s+/i, '')];
