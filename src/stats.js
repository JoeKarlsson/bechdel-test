// The few statistics page vs screen reports (docs/page-vs-screen/METHODS.md
// §6 and §9), written out so the method has no hidden dependency.
const crypto = require('crypto');

/** A seeded uniform random number generator in [0, 1), so bootstraps repeat exactly */
const seededRandom = seed => {
	let counter = 0;
	return () => crypto.createHash('sha256').update(`${seed}:${counter++}`).digest().readUInt32BE(0) / 2 ** 32;
};

const median = xs => {
	if (xs.length === 0) return null;
	const s = [...xs].sort((a, b) => a - b);
	const mid = Math.floor(s.length / 2);
	return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

const quantile = (xs, q) => {
	if (xs.length === 0) return null;
	const s = [...xs].sort((a, b) => a - b);
	const at = (s.length - 1) * q;
	const lo = Math.floor(at);
	return s[lo] + (s[Math.min(lo + 1, s.length - 1)] - s[lo]) * (at - lo);
};

/** Percentile bootstrap: a 95% interval for statistic(sample), resampling the units */
const bootstrap = (units, statistic, { resamples = 10_000, seed = 'bootstrap' } = {}) => {
	const random = seededRandom(seed);
	const values = [];
	for (let r = 0; r < resamples; r++) {
		const sample = units.map(() => units[Math.floor(random() * units.length)]);
		const value = statistic(sample);
		if (value !== null && Number.isFinite(value)) values.push(value);
	}
	return [quantile(values, 0.025), quantile(values, 0.975)];
};

/** Wilson 95% interval for k successes in n */
const wilson = (k, n, z = 1.959964) => {
	if (n === 0) return [null, null];
	const p = k / n;
	const centre = p + (z * z) / (2 * n);
	const margin = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
	const denominator = 1 + (z * z) / n;
	return [(centre - margin) / denominator, (centre + margin) / denominator];
};

// Standard normal tail, by the Abramowitz-Stegun 7.1.26 approximation of erf (error under 1.5e-7)
const normalTwoSided = z => {
	const x = Math.abs(z) / Math.SQRT2;
	const t = 1 / (1 + 0.3275911 * x);
	const erf = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
	return 1 - erf;
};

/**
 * Wilcoxon signed-rank test on paired differences, by the normal
 * approximation with tie and continuity corrections (zeros dropped)
 */
const wilcoxonSignedRank = differences => {
	const nonZero = differences.filter(d => d !== 0).map(d => ({ d, abs: Math.abs(d) })).sort((a, b) => a.abs - b.abs);
	const n = nonZero.length;
	if (n === 0) return { n, statistic: 0, p: 1 };
	let tieCorrection = 0;
	for (let i = 0; i < n;) {
		let j = i;
		while (j + 1 < n && nonZero[j + 1].abs === nonZero[i].abs) j++;
		const rank = (i + j + 2) / 2;
		for (let k = i; k <= j; k++) nonZero[k].rank = rank;
		const t = j - i + 1;
		tieCorrection += t ** 3 - t;
		i = j + 1;
	}
	const positive = nonZero.filter(x => x.d > 0).reduce((sum, x) => sum + x.rank, 0);
	const mean = (n * (n + 1)) / 4;
	const variance = (n * (n + 1) * (2 * n + 1)) / 24 - tieCorrection / 48;
	const z = (Math.abs(positive - mean) - 0.5) / Math.sqrt(variance);
	return { n, statistic: positive, p: Math.min(1, normalTwoSided(Math.max(0, z))) };
};

/** McNemar's test (continuity-corrected) on b and c, the two kinds of discordant pairs */
const mcnemar = (b, c) => {
	if (b + c === 0) return { b, c, p: 1 };
	const chi = (Math.abs(b - c) - 1) ** 2 / (b + c);
	return { b, c, p: normalTwoSided(Math.sqrt(chi)) };
};

/** Cohen's kappa for two label lists of the same items */
const cohensKappa = (a, b) => {
	const n = a.length;
	if (n === 0) return null;
	const labels = [...new Set([...a, ...b])];
	const observed = a.filter((x, i) => x === b[i]).length / n;
	const expected = labels.reduce((sum, l) => sum + (a.filter(x => x === l).length / n) * (b.filter(x => x === l).length / n), 0);
	return expected === 1 ? 1 : (observed - expected) / (1 - expected);
};

module.exports = { median, quantile, bootstrap, wilson, wilcoxonSignedRank, mcnemar, cohensKappa, seededRandom };
