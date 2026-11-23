#!/usr/bin/env node
// The screen verdicts against bechdeltest.com reader ratings (exploratory, added after the hand check). Readers rate
// the released film, so a reader pass is an outside view of the screen verdict. Their errors and the scorer's own
// (80% agreement on films) mix in, so the flagged categories are read against the unflagged ones:
//   share of pass->fail flags that are real, r: readers' fail rate there = r * (fail rate on fail->fail films)
//     + (1 - r) * (fail rate on pass->pass films), solved for r; the same for fail->pass with pass rates.
// Intervals resample films within each category (10,000 times). Reads data/screen, data/films, the ratings and
// data/eval/screen-gold.json; prints counts only.
//   node scripts/screen-readers.js
const fs = require('fs');
const path = require('path');
const { wilson, seededRandom, quantile } = require('../src/stats');

const ROOT = path.join(__dirname, '..');
const ratings = require(path.join(ROOT, 'data/eval/bechdeltest-ratings.json'));
const gold = require(path.join(ROOT, 'data/eval/screen-gold.json'));
const imdbOf = new Map(fs.readdirSync(path.join(ROOT, 'data/films')).map(f => {
	const film = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/films', f), 'utf8'));
	return [film._id, film.idIMDB];
}));

const byCategory = {};
const readerPassOf = {};
for (const f of fs.readdirSync(path.join(ROOT, 'data/screen'))) {
	const screen = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/screen', f), 'utf8'));
	if (screen.excluded) continue;
	const id = f.replace(/\.json$/, '');
	const pagePasses = screen.bechdel.page.score === 3;
	const category = screen.bechdel.change === 'same' ? (pagePasses ? 'pass-pass' : 'fail-fail') : screen.bechdel.change;
	byCategory[category] ??= { films: 0, rated: [] };
	byCategory[category].films++;
	const rating = ratings[imdbOf.get(id)];
	if (!rating) continue;
	readerPassOf[id] = rating.rating === 3;
	byCategory[category].rated.push(rating.rating === 3);
}

const pct = x => `${(x * 100).toFixed(0)}%`;
const passRate = xs => xs.filter(Boolean).length / xs.length;
for (const [category, { films, rated }] of Object.entries(byCategory)) {
	const passes = rated.filter(Boolean).length;
	const [lo, hi] = wilson(passes, rated.length);
	console.log(`${category}: ${films} films, ${rated.length} rated, readers pass ${passes} (${pct(passes / rated.length)}, ${pct(lo)}-${pct(hi)})`);
}

// share of flags that hold up, by the mixture above; null when the baselines don't separate
const realShare = (flagged, real, falseAlarm) => (flagged - falseAlarm) / (real - falseAlarm);
const estimate = sets => ({
	lost: realShare(1 - passRate(sets['page-pass-screen-fail']), 1 - passRate(sets['fail-fail']), 1 - passRate(sets['pass-pass'])),
	gained: realShare(passRate(sets['page-fail-screen-pass']), passRate(sets['pass-pass']), passRate(sets['fail-fail'])),
});
const sets = Object.fromEntries(Object.entries(byCategory).map(([c, { rated }]) => [c, rated]));
const point = estimate(sets);
const random = seededRandom('reader-check');
const draws = { lost: [], gained: [], films: [] };
const resample = xs => xs.map(() => xs[Math.floor(random() * xs.length)]);
for (let i = 0; i < 10_000; i++) {
	const e = estimate(Object.fromEntries(Object.entries(sets).map(([c, xs]) => [c, resample(xs)])));
	draws.lost.push(e.lost);
	draws.gained.push(e.gained);
	draws.films.push(e.lost * byCategory['page-pass-screen-fail'].films + e.gained * byCategory['page-fail-screen-pass'].films);
}
const interval = xs => `${quantile(xs, 0.025).toFixed(2)} to ${quantile(xs, 0.975).toFixed(2)}`;
const decided = Object.entries(byCategory).filter(([c]) => c !== 'unclear').reduce((s, [, { films }]) => s + films, 0);
const films = point.lost * byCategory['page-pass-screen-fail'].films + point.gained * byCategory['page-fail-screen-pass'].films;
console.log(`share of lost passes that hold up: ${point.lost.toFixed(2)} (${interval(draws.lost)})`);
console.log(`share of gained passes that hold up: ${point.gained.toFixed(2)} (${interval(draws.gained)})`);
console.log(`films that really change: ${films.toFixed(0)} of ${decided} (${pct(films / decided)}; ${quantile(draws.films, 0.025).toFixed(0)} to ${quantile(draws.films, 0.975).toFixed(0)} films)`);

// the hand-checked films: the judge against readers, where both gave an answer
const both = Object.entries(gold.verdicts ?? {}).filter(([id, v]) => v.verdict !== 'unsure' && id in readerPassOf);
for (const change of ['page-pass-screen-fail', 'page-fail-screen-pass']) {
	const here = both.filter(([, v]) => v.change === change);
	const agree = here.filter(([id, v]) => (v.verdict === 'passes on screen') === readerPassOf[id]).length;
	const readersPass = here.filter(([id]) => readerPassOf[id]).length;
	console.log(`hand check vs readers, ${change}: ${here.length} films rated by both, agree on ${agree}; readers pass ${readersPass}`);
}
