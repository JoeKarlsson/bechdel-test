#!/usr/bin/env node
// The screen verdicts against bechdeltest.com reader ratings (exploratory, added after the hand check). Readers rate
// the released film, so a reader pass is an outside view of the screen verdict, not of the change: a flag counts as
// real here even if the scorer got the page wrong. Readers and the scorer also disagree on films it never flags, so
// the flagged films are read against those:
//   share of pass->fail flags that are real, r: readers' fail rate there = r * (fail rate on fail->fail films)
//     + (1 - r) * (fail rate on pass->pass films), solved for r; the same for fail->pass with pass rates.
// Flagged films are borderline on the page (a lost pass usually rests on one passing scene, a gained pass usually
// fails only rule 3), so the "matched" estimate weights the unflagged films to the flagged films' page profile.
// Intervals resample films within each category and profile (10,000 times). Prints counts only.
//   node scripts/screen-readers.js
const fs = require('fs');
const path = require('path');
const { wilson, seededRandom, quantile } = require('../src/stats');

const ROOT = path.join(__dirname, '..');
const ratings = require(path.join(ROOT, 'data/eval/bechdeltest-ratings.json'));
const gold = require(path.join(ROOT, 'data/eval/screen-gold.json'));

// every compared film: its category, its page profile, and the readers' verdict if rated
const films = [];
for (const f of fs.readdirSync(path.join(ROOT, 'data/screen'))) {
	const screen = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/screen', f), 'utf8'));
	if (screen.excluded) continue;
	const film = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/films', f), 'utf8'));
	const pagePasses = screen.bechdel.page.score === 3;
	const category = screen.bechdel.change === 'same' ? (pagePasses ? 'pass-pass' : 'fail-fail') : screen.bechdel.change;
	// a pass's profile is its number of passing scenes (6+ together); a fail's is how far it got (score 0-2)
	const profile = pagePasses ? Math.min(film.bechdelResults.numScenesPass, 6) : screen.bechdel.page.score;
	const rating = ratings[film.idIMDB];
	films.push({ id: film._id, category, profile, sameReading: film.bechdelResults.bechdelScore === screen.bechdel.page.score, rated: Boolean(rating), passes: rating?.rating === 3, dubious: Boolean(rating?.dubious) });
}
// the profile comes from the site's page result, the category from the screen comparison's: they must agree
const mismatched = films.filter(f => !f.sameReading).length;
if (mismatched > 0) throw new Error(`${mismatched} films have a different page score on the site than in data/screen; rerun them first`);
const count = category => films.filter(f => f.category === category).length;
const pct = x => `${(x * 100).toFixed(0)}%`;

for (const category of ['pass-pass', 'fail-fail', 'page-pass-screen-fail', 'page-fail-screen-pass', 'unclear']) {
	const rated = films.filter(f => f.category === category && f.rated);
	const passes = rated.filter(f => f.passes).length;
	const [lo, hi] = wilson(passes, rated.length);
	console.log(`${category}: ${count(category)} films, ${rated.length} rated, readers pass ${passes} (${pct(passes / rated.length)}, ${pct(lo)}-${pct(hi)})`);
}

const passRate = fs => fs.filter(f => f.passes).length / fs.length;
// the baseline's pass rate, weighted to the flagged films' profiles when matched
const baselineRate = (baseline, flagged, matched) => {
	if (!matched) return passRate(baseline);
	const weights = {};
	for (const f of flagged) weights[f.profile] = (weights[f.profile] ?? 0) + 1 / flagged.length;
	return Object.entries(weights).reduce((sum, [profile, w]) => sum + w * passRate(baseline.filter(f => String(f.profile) === profile)), 0);
};
const estimate = (sets, matched) => {
	const lost = sets['page-pass-screen-fail'];
	const gained = sets['page-fail-screen-pass'];
	const passPass = baselineRate(sets['pass-pass'], lost, matched);
	const failFail = baselineRate(sets['fail-fail'], gained, matched);
	// readers' fail rate on lost passes against the two baselines' fail rates; gained passes with pass rates
	const lostShare = ((1 - passRate(lost)) - (1 - passPass)) / ((1 - baselineRate(sets['fail-fail'], lost, false)) - (1 - passPass));
	const gainedShare = (passRate(gained) - failFail) / (baselineRate(sets['pass-pass'], gained, false) - failFail);
	return { lostShare, gainedShare, films: lostShare * count('page-pass-screen-fail') + gainedShare * count('page-fail-screen-pass') };
};
const decided = films.filter(f => f.category !== 'unclear').length;
const report = (label, keep, matched) => {
	const sets = {};
	for (const f of films.filter(f => f.rated && keep(f))) (sets[f.category] ??= []).push(f);
	const point = estimate(sets, matched);
	const random = seededRandom(`screen-readers:${label}`);
	// resample within category and profile, so a matched baseline never loses a profile it needs
	const resample = fs => Object.values(Object.groupBy(fs, f => f.profile)).flatMap(g => g.map(() => g[Math.floor(random() * g.length)]));
	const draws = Array.from({ length: 10_000 }, () => estimate(Object.fromEntries(Object.entries(sets).map(([c, fs]) => [c, resample(fs)])), matched));
	const range = key => `${quantile(draws.map(d => d[key]), 0.025).toFixed(2)} to ${quantile(draws.map(d => d[key]), 0.975).toFixed(2)}`;
	console.log(`${label}: lost passes real ${point.lostShare.toFixed(2)} (${range('lostShare')}), gained ${point.gainedShare.toFixed(2)} (${range('gainedShare')}); `
		+ `${point.films.toFixed(0)} of ${decided} films (${pct(point.films / decided)}; ${quantile(draws.map(d => d.films), 0.025).toFixed(0)} to ${quantile(draws.map(d => d.films), 0.975).toFixed(0)}), `
		+ `${(point.lostShare * count('page-pass-screen-fail')).toFixed(0)} pass to fail`);
};
report('all ratings', () => true, false);
report('not dubious', f => !f.dubious, false);
report('matched baselines', () => true, true);
report('matched, not dubious', f => !f.dubious, true);

// the matched cells, and how often readers agree with the scorer on borderline unflagged films (one passing scene,
// or failing only rule 3): the ceiling for any judge on films like the flagged ones
for (const [category, profile] of [['pass-pass', 1], ['fail-fail', 2]]) {
	const cell = films.filter(f => f.category === category && f.profile === profile && f.rated);
	const agree = cell.filter(f => f.passes === (category === 'pass-pass')).length;
	console.log(`${category}, profile ${profile}: ${cell.length} rated, readers agree with the scorer on ${agree} (${pct(agree / cell.length)})`);
}

// the hand-checked films: the judge against readers, where both gave an answer
const readerPassOf = Object.fromEntries(films.filter(f => f.rated).map(f => [f.id, f.passes]));
const both = Object.entries(gold.verdicts ?? {}).filter(([id, v]) => v.verdict !== 'unsure' && id in readerPassOf);
for (const change of ['page-pass-screen-fail', 'page-fail-screen-pass']) {
	const here = both.filter(([, v]) => v.change === change);
	const agree = here.filter(([id, v]) => (v.verdict === 'passes on screen') === readerPassOf[id]).length;
	const readersPass = here.filter(([id]) => readerPassOf[id]).length;
	console.log(`hand check vs readers, ${change}: ${here.length} films rated by both, agree on ${agree}; readers pass ${readersPass}`);
}
