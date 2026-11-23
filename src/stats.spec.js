const { wilson, wilcoxonSignedRank, mcnemar, cohensKappa, bootstrap, median, verdictChanges } = require('./stats');

describe('stats', () => {
	it('matches textbook values', () => {
		expect(wilson(5, 10).map(x => x.toFixed(4))).toEqual(['0.2366', '0.7634']);
		// all or none: the bound sits exactly at 0 or 1, never a rounding error past it
		expect(wilson(0, 28)[0]).toBe(0);
		expect(wilson(28, 28)[1]).toBe(1);
	});

	it('counts a hand-judged verdict as changed only when it differs from the page', () => {
		expect(verdictChanges([
			{ pagePasses: false, verdict: 'passes on screen' }, // changed
			{ pagePasses: true, verdict: 'passes on screen' },
			{ pagePasses: false, verdict: 'fails on screen' },
			{ pagePasses: true, verdict: 'fails on screen' }, // changed
			{ pagePasses: false, verdict: 'unsure' },
		])).toEqual({ changed: 2, judged: 4 });
		expect(() => verdictChanges([{ verdict: 'fails on screen' }])).toThrow('no page verdict');
		// Hollander & Wolfe's depression scores; R's wilcox.test(exact = FALSE) gives p = 0.04401
		const differences = [1.83 - 0.878, 0.5 - 0.647, 1.62 - 0.598, 2.48 - 2.05, 1.68 - 1.06, 1.88 - 1.29, 1.55 - 1.06, 3.06 - 3.14, 1.3 - 1.29];
		expect(wilcoxonSignedRank(differences)).toMatchObject({ n: 9, statistic: 40 });
		expect(wilcoxonSignedRank(differences).p).toBeCloseTo(0.04401, 4);
		// (|10 - 2| - 1)^2 / 12 = 4.083, p = 0.0433
		expect(mcnemar(10, 2).p).toBeCloseTo(0.0433, 3);
		expect(cohensKappa(['a', 'a', 'b', 'b'], ['a', 'b', 'b', 'b'])).toBeCloseTo(0.5);
	});

	it('bootstraps the same interval every run', () => {
		const xs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const ci = bootstrap(xs, median, { resamples: 2000, seed: 's' });
		expect(bootstrap(xs, median, { resamples: 2000, seed: 's' })).toEqual(ci);
		expect(ci[0]).toBeLessThan(5.5);
		expect(ci[1]).toBeGreaterThan(5.5);
	});
});
