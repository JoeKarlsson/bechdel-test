import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import {
	cleanTitle,
	slugify,
	rulesFromScore,
	toNumber,
	speakersFrom,
	bookendsFrom,
	timelineFrom,
	relatedFilms,
	loadFilms,
	aiModelOf,
	crewFrom,
	shelfStats,
	peopleRanking,
	screenFrom,
} from '../src/lib/films.mjs';

test('cleanTitle drops a trailing year', () => {
	assert.equal(cleanTitle('Evil Dead II: Dead by Dawn (1987)'), 'Evil Dead II: Dead by Dawn');
	assert.equal(cleanTitle('Gone Girl'), 'Gone Girl');
});

test('slugify makes stable, URL-safe slugs', () => {
	assert.equal(slugify('Freddy vs. Jason', 2003), 'freddy-vs-jason-2003');
	assert.equal(slugify('Escape from L.A.', 1996), 'escape-from-l-a-1996');
	assert.equal(slugify('Austin Powers: International Man of Mystery', 1997), 'austin-powers-international-man-of-mystery-1997');
	assert.equal(slugify('Amélie', null), 'amelie');
});

test('rules are cumulative from the score', () => {
	assert.deepEqual(rulesFromScore(3), [true, true, true]);
	assert.deepEqual(rulesFromScore(2), [true, true, false]);
	assert.deepEqual(rulesFromScore(0), [false, false, false]);
	assert.deepEqual(rulesFromScore(undefined), [false, false, false]);
});

test('toNumber handles N/A and strings', () => {
	assert.equal(toNumber('8.1'), 8.1);
	assert.equal(toNumber(79), 79);
	assert.equal(toNumber('N/A'), null);
	assert.equal(toNumber(null), null);
});

test('speakersFrom title-cases the stored speakers, most lines first', () => {
	const script = { speakers: [{ name: 'AMY', lines: 2, gender: 'w', actor: 'Rosamund Pike' }, { name: 'MRS. ELLIOTT', lines: 1, gender: null }] };
	assert.deepEqual(speakersFrom(script), [
		{ name: 'Amy', lines: 2, gender: 'w', actor: 'Rosamund Pike' },
		{ name: 'Mrs. Elliott', lines: 1, gender: null, actor: null },
	]);
});

test('timelineFrom groups scenes into at most the requested bars', () => {
	const speakers = [{ name: 'NICK', gender: 'm' }, { name: 'AMY', gender: 'w' }];
	const scenes = Array.from({ length: 10 }, (_, i) => ({ place: i === 0 ? 'The bar' : null, lines: i % 2 ? { 1: 1 } : { 0: 2 } }));
	const bars = timelineFrom({ scenes, speakers }, 4);
	assert.equal(bars.length, 4);
	assert.deepEqual({ ...bars[0], speakers: undefined }, { from: 1, to: 3, w: 1, m: 4, places: ['The bar'], speakers: undefined });
	assert.deepEqual(bars[0].speakers, [
		{ name: 'Nick', gender: 'm', lines: 4 },
		{ name: 'Amy', gender: 'w', lines: 1 },
	]);
	assert.deepEqual({ ...bars.at(-1), speakers: undefined }, { from: 10, to: 10, w: 1, m: 0, places: [], speakers: undefined });
	assert.deepEqual(timelineFrom({ scenes: scenes.slice(0, 1), speakers }), []);
});

test('crewFrom groups key jobs by label and sorts departments by size', () => {
	const crew = crewFrom({
		roles: [
			{ job: 'Director', name: 'Ridley Scott', gender: 'm' },
			{ job: 'Screenplay', name: "Dan O'Bannon", gender: 'm' },
			{ job: 'Writer', name: "Dan O'Bannon", gender: 'm' },
			{ job: 'Casting', name: 'Mary Selway', gender: 'w' },
		],
		departments: { Sound: { w: 0, m: 2, nb: 0, unknown: 1 }, Writing: { w: 1, m: 1, nb: 1, unknown: 0 }, Art: { w: 1, m: 0, nb: 0, unknown: 0 } },
	});
	assert.deepEqual(crew.roles.map((g) => `${g.label} ${g.people.map((p) => p.name).join(', ')}`), [
		'Directed by Ridley Scott',
		"Written by Dan O'Bannon",
		'Cast by Mary Selway',
	]);
	assert.deepEqual(crew.departments.map((d) => d.name), ['Sound', 'Writing', 'Art']);
	assert.deepEqual(crew.all, { w: 2, m: 3, nb: 1, unknown: 1 });
	assert.equal(crew.keyWomen, 1);
	assert.equal(crewFrom(undefined), null);
});

test('shelfStats groups by genre, and compares films with and without women in key jobs', () => {
	const film = (year, pass, genres, extra = {}) => ({
		year, genres, bechdel: { pass, score: pass ? 3 : 1 }, readers: null, lines: { w: 1, m: 3, unknown: 0 }, crew: null, money: null, ages: [], measures: null, dialogueCount: 0, ...extra,
	});
	const directedBy = (gender) => ({ crew: { roles: [{ label: 'Directed by', people: [{ name: 'X', gender }] }] } });
	const films = [
		film(1991, true, ['Drama'], directedBy('w')),
		film(1995, false, ['Drama'], directedBy('m')),
		film(1999, false, ['Action'], { ...directedBy('m'), money: { budget: 10, revenue: 30 } }),
		film(2004, true, ['Drama'], { money: { budget: 10, revenue: 50 } }),
	];
	const stats = shelfStats(films, { minGroup: 2 });
	assert.equal(stats.pass, 2);
	assert.deepEqual(stats.scores, [{ score: 0, films: 0 }, { score: 1, films: 2 }, { score: 2, films: 0 }, { score: 3, films: 2 }]);
	assert.deepEqual(stats.byGenre, [{ label: 'Drama', films: 3, pass: 2 }]);
	assert.deepEqual(stats.womanDirector, { yes: { films: 1, pass: 1 }, no: { films: 3, pass: 1 } });
	assert.deepEqual(stats.jobs, [{ label: 'Directed by', w: 1, m: 2, nb: 0, unknown: 0, films: 3 }]);
	assert.deepEqual(stats.money, { pass: { films: 1, multiple: 5 }, fail: { films: 1, multiple: 3 } });
});

test('screenFrom turns a page vs screen record into shares, and keeps why a film was left out', () => {
	const gender = (lines, cut) => ({ lines, kept: lines - cut, changed: 0, cut });
	const raw = {
		script: { draft: 'shooting' },
		subtitles: { used: 9, sdh: false, meanAgreement: 0.9 },
		runtimeSeconds: 5400,
		words: { page: 1000, screen: 800, kept: 600, cut: 400, notInScript: 200, moved: 0 },
		lines: { page: 100, kept: 60, changed: 20, cut: 20, screen: 120, notInScript: 30 },
		byGender: { w: gender(40, 10), m: gender(50, 5), unknown: gender(10, 5) },
		byScriptOrder: [{ kept: 2 }, { cut: 1 }],
		byMinute: [{ scripted: 10, notInScript: 2 }],
		bechdel: { page: { score: 3 }, strict: { score: 2 }, lenient: { score: 3 }, change: 'unclear' },
		quotes: { cut: [], notInScript: [], changed: [] },
		passingConversations: { count: 3, seconds: 41, longest: 9 },
		conversations: { w: { conversation: gender(20, 10), other: gender(20, 2) }, m: { conversation: gender(10, 1), other: gender(40, 4) } },
	};
	const s = screenFrom(raw);
	assert.deepEqual(s.passing, { count: 3, seconds: 41, longest: 9 });
	assert.deepEqual(s.conversationCut, { w: { conversation: 0.5, other: 0.1, conversationLines: 20, otherLines: 20 }, m: { conversation: 0.1, other: 0.1, conversationLines: 10, otherLines: 40 } });
	assert.equal(s.survival, 0.6);
	assert.equal(s.notInScript, 0.25);
	assert.deepEqual(s.cut, { w: 0.25, m: 0.1, wLines: 40, mLines: 50 });
	assert.deepEqual(s.byScriptOrder, [{ kept: 2, changed: 0, cut: 0 }, { kept: 0, changed: 0, cut: 1 }]);
	assert.deepEqual(s.bechdel, { page: 3, low: 2, high: 3, change: 'unclear' });
	assert.equal(s.runtimeMinutes, 90);
	assert.deepEqual(screenFrom({ excluded: 'the script is a transcript of the film', script: { draft: 'transcript' } }), { excluded: 'the script is a transcript of the film', draft: 'transcript' });
	assert.equal(screenFrom(undefined), null);

	const film = (screen) => ({ year: 2000, genres: [], bechdel: { pass: true, score: 3 }, readers: null, lines: { w: 1, m: 1, unknown: 0 }, crew: null, money: null, ages: [], measures: null, dialogueCount: 0, screen, slug: 'x', title: 'X' });
	const stats = shelfStats([film(s), film({ ...s, survival: 0.8, bechdel: { ...s.bechdel, change: 'page-pass-screen-fail' } }), film({ excluded: 'transcript' }), film(null)]);
	assert.equal(stats.pageVsScreen.films, 2);
	assert.deepEqual(stats.pageVsScreen.excluded, [{ reason: 'transcript', films: 1 }]);
	assert.equal(stats.pageVsScreen.survival, 0.7);
	assert.equal(stats.pageVsScreen.unclear, 1);
	assert.deepEqual(stats.pageVsScreen.passToFail.map((f) => f.slug), ['x']);
	assert.deepEqual(stats.pageVsScreen.flows.pass, { films: 2, same: 0, flips: 1, unclear: 1 });
	assert.deepEqual(stats.pageVsScreen.survivalBins, [0, 0, 0, 0, 0, 0, 1, 0, 1, 0]);
	assert.deepEqual(stats.pageVsScreen.passingBins, [0, 0, 2, 0, 0, 0]);
	assert.deepEqual(stats.pageVsScreen.cut, { films: 2, w: 0.25, m: 0.1, womenMore: 2, menMore: 0 });
	assert.deepEqual(stats.pageVsScreen.passing, { films: 2, seconds: 41, under30: 0 });
	assert.deepEqual(stats.pageVsScreen.conversations.w, { films: 2, conversation: 0.5, other: 0.1 });
	assert.deepEqual(stats.pageVsScreen.conversations.m, { films: 2, conversation: 0.1, other: 0.1 });
});

test('shelfStats gives each year with enough films its own rate and the five years around it', () => {
	const film = (year, pass, w) => ({ year, genres: [], bechdel: { pass, score: pass ? 3 : 0 }, readers: null, lines: { w, m: 4 - w, unknown: 0 }, crew: null, money: null, ages: [], measures: null, dialogueCount: 0 });
	const films = [film(2000, true, 1), film(2000, false, 1), film(2002, true, 3), film(2003, false, 2), film(2010, true, 2)];
	const { byYear } = shelfStats(films, { minYear: 2 });
	// Only 2000 has two films; its five years pool 1998 to 2002
	assert.deepEqual(byYear, [{ year: 2000, films: 2, pass: 1, fiveYearPass: 2 / 3, womenLines: 0.25, fiveYearWomenLines: 0.25 }]);
});

test('bookendsFrom names who has the first and last line, and keeps a missing one null', () => {
	const speakers = speakersFrom({ speakers: [{ name: 'JO', lines: 9, gender: 'w' }, { name: 'AMY', lines: 5, gender: 'w' }, { name: 'NARRATOR', lines: 2, gender: null }] });
	const script = { bookends: { first: { speaker: 2, line: 1, text: 'Once.' }, last: null } };
	assert.deepEqual(bookendsFrom(script, speakers), {
		first: { text: 'Once.', line: 1, name: 'Narrator', gender: null, lines: 2, rank: 3, lead: false },
		last: null,
	});
	assert.equal(bookendsFrom({ bookends: { first: null, last: null } }, speakers), null);
	assert.equal(bookendsFrom({}, speakers), null);
});

test('shelfStats counts who has the last word, by gender and lead or side', () => {
	const said = (gender, rank) => ({ text: 'Hi.', line: 1, name: 'X', gender, lines: 1, rank, lead: rank <= 2 });
	const film = (year, pass, lead, first, last) => ({
		year, genres: [], bechdel: { pass, score: pass ? 3 : 0 }, readers: null, lines: { w: 1, m: 1, unknown: 0 }, crew: null, money: null, ages: [], measures: null, dialogueCount: 0,
		speakers: [{ gender: lead }], bookends: { first, last },
	});
	const { lastWords } = shelfStats([
		film(1975, true, 'w', said('w', 1), said('w', 1)),
		film(1995, false, 'm', null, said('m', 4)),
		film(1999, false, 'm', said(null, 9), said('w', 3)),
	]);
	assert.deepEqual(lastWords.last, { films: 3, none: 0, wLead: 1, wSide: 1, mLead: 0, mSide: 1, unknown: 0 });
	assert.deepEqual(lastWords.first, { films: 2, none: 1, wLead: 1, wSide: 0, mLead: 0, mSide: 0, unknown: 1 });
	assert.deepEqual(lastWords.ledByWoman, { films: 1, w: 1, topCloses: 1 });
	assert.deepEqual(lastWords.ledByMan, { films: 2, w: 1, topCloses: 0 });
	assert.deepEqual(lastWords.byDecade.map((d) => d.decade), [1970, 1990]);
	assert.equal(lastWords.bothWomen, 1);
	assert.equal(lastWords.womenLineShare, 0.5);
});

test('peopleRanking keeps people with enough films, best pass rate first, passing films first', () => {
	const film = (slug, year, pass, directors) => ({ slug, title: slug, year, bechdel: { pass }, directors });
	const films = [film('a', 2001, false, ['Ann']), film('b', 1999, true, ['Ann', 'Bo']), film('c', 2005, true, ['Bo']), film('d', 2006, false, ['Cy'])];
	const ranked = peopleRanking(films, (f) => f.directors, 2);
	assert.deepEqual(ranked.map((p) => [p.name, p.pass, p.films.map((f) => f.slug)]), [
		['Bo', 2, ['b', 'c']],
		['Ann', 1, ['b', 'a']],
	]);
});

test('aiModelOf names the model that wrote an analysis', () => {
	assert.equal(aiModelOf('openrouter/deepseek/deepseek-v4.1-flash').name, 'DeepSeek V4.1 Flash');
	// Analyses from before models were stored were all Claude 3.5 Haiku
	assert.equal(aiModelOf(undefined).id, 'claude-3-5-haiku-20241022');
	assert.throws(() => aiModelOf('some/new-model'), /add it to AI_MODELS/);
});

test('the real export loads with unique slugs and sane numbers', () => {
	const films = loadFilms();
	// Every film file loads, and the pass count matches the raw scores: no hard-coded totals to bump each batch
	const raw = readdirSync('../data/films').filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(`../data/films/${f}`, 'utf8')));
	assert.equal(films.length, raw.length);
	const gone = films.find((f) => f.slug === 'gone-girl-2014');
	assert.ok(gone, 'Gone Girl is in the export');
	assert.equal(gone.bechdel.score, 3);
	assert.equal(gone.bechdel.scenesTotal, 231);
	assert.equal(gone.readers.score, 3);
	assert.equal(gone.speakers[0].name, 'Nick');
	assert.equal(films.filter((f) => f.bechdel.pass).length, raw.filter((f) => f.bechdelResults.bechdelScore === 3).length);
	for (const f of films) assert.ok(f.popularity >= 1);
	// Its script has no scene headings: one scene, so no timeline to draw
	const dawn = films.find((f) => f.slug === 'dawn-of-the-dead-1978');
	assert.ok(dawn.lines.w > 0);
	assert.deepEqual(dawn.timeline, []);
	assert.ok(gone.lines.w > 0 && gone.timeline.length > 0);
});


test('related films share genres first, then director, then era', () => {
	const f = (id, genres, directors, year, popularity) => ({ id, genres, directors, year, popularity });
	const me = f('me', ['Drama', 'Thriller'], ['Fincher'], 2014, 1);
	const films = [me, f('a', ['Comedy'], [], 2014, 2), f('b', ['Drama', 'Thriller'], [], 1980, 3), f('c', ['Crime'], ['Fincher'], 1999, 4), f('d', ['Drama'], [], 2013, 5)];
	assert.deepEqual(relatedFilms(me, films, 4).map((x) => x.id), ['b', 'd', 'c', 'a']);
});
