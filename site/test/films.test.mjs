import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	cleanTitle,
	slugify,
	rulesFromScore,
	toNumber,
	cleanSpeaker,
	buildGenderLookup,
	speakersFrom,
	timelineFrom,
	scenePlace,
	relatedFilms,
	loadFilms,
	aiModelOf,
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

test('cleanSpeaker drops noise and extensions', () => {
	assert.equal(cleanSpeaker('NICK (V.O.)'), 'NICK');
	assert.equal(cleanSpeaker("AMY (CONT'D)"), 'AMY');
	assert.equal(cleanSpeaker('* *'), null);
	assert.equal(cleanSpeaker('POLICE STATION - DAY 52'), null);
	assert.equal(cleanSpeaker('INT. BAR'), null);
	assert.equal(cleanSpeaker('EARNEST GIRL'), 'EARNEST GIRL');
	assert.equal(cleanSpeaker('CONTINUED:'), null);
	assert.equal(cleanSpeaker('ALRIGHT, NOW ARE YOU STRAIGHT?'), null);
	assert.equal(cleanSpeaker('BETTER WITH FOLK KNOCKIN EACH OTHER OFF THE'), null);
});

test('gender lookup matches any word of a character name, skipping titles', () => {
	const genderOf = buildGenderLookup([
		{ character: 'Detective Rhonda Boney', actorActress: '1' },
		{ character: 'Officer James Gilpin', actorActress: '2' },
		{ character: 'Nobody', actorActress: undefined },
	]);
	assert.equal(genderOf('BONEY'), 'w');
	assert.equal(genderOf('GILPIN'), 'm');
	assert.equal(genderOf('OFFICER'), null);
	assert.equal(genderOf('NOBODY'), null);
});

test('speakersFrom counts lines per cleaned speaker', () => {
	const genderOf = buildGenderLookup([{ character: 'Amy Dunne', actorActress: '1' }]);
	const speakers = speakersFrom(
		[{ character: 'AMY' }, { character: 'AMY (V.O.)' }, { character: 'NICK' }, { character: '* *' }],
		genderOf,
	);
	assert.deepEqual(speakers, [
		{ name: 'Amy', lines: 2, gender: 'w' },
		{ name: 'Nick', lines: 1, gender: null },
	]);
});

test('timelineFrom groups scenes into at most the requested bars', () => {
	const genderOf = (n) => (n === 'AMY' ? 'w' : n === 'NICK' ? 'm' : null);
	const scenes = Array.from({ length: 10 }, (_, i) => ({ dialogue: i % 2 ? [{ character: 'AMY' }] : [{ character: 'NICK' }, { character: 'NICK' }] }));
	const bars = timelineFrom(scenes, genderOf, 4);
	assert.equal(bars.length, 4);
	assert.deepEqual({ ...bars[0], speakers: undefined }, { from: 1, to: 3, w: 1, m: 4, places: [], speakers: undefined });
	assert.deepEqual(bars[0].speakers, [
		{ name: 'Nick', gender: 'm', lines: 4 },
		{ name: 'Amy', gender: 'w', lines: 1 },
	]);
	assert.deepEqual({ ...bars.at(-1), speakers: undefined }, { from: 10, to: 10, w: 1, m: 0, places: [], speakers: undefined });
	assert.deepEqual(timelineFrom([], genderOf), []);
});

test('aiModelOf names the model that wrote an analysis', () => {
	assert.equal(aiModelOf('openrouter/deepseek/deepseek-v4.1-flash').name, 'DeepSeek V4.1 Flash');
	// Analyses from before models were stored were all Claude 3.5 Haiku
	assert.equal(aiModelOf(undefined).id, 'claude-3-5-haiku-20241022');
	assert.throws(() => aiModelOf('some/new-model'), /add it to AI_MODELS/);
});

test('the real export loads with unique slugs and sane numbers', () => {
	const films = loadFilms();
	assert.equal(films.length, 50);
	const gone = films.find((f) => f.slug === 'gone-girl-2014');
	assert.ok(gone, 'Gone Girl is in the export');
	assert.equal(gone.bechdel.score, 3);
	assert.equal(gone.bechdel.scenesTotal, 290);
	assert.equal(gone.readers.score, 3);
	assert.equal(gone.ai.review.scenes.length, 1);
	assert.equal(gone.ai.model.name, 'Claude 3.5 Haiku');
	assert.equal(gone.speakers[0].name, 'Nick');
	assert.ok(films.filter((f) => f.bechdel.pass).length === 8);
	for (const f of films) assert.ok(f.popularity >= 1);
	// Its script didn't parse: the speaker field holds dialogue, so no charts
	const dawn = films.find((f) => f.slug === 'dawn-of-the-dead-2004');
	assert.equal(dawn.lines, null);
	assert.deepEqual(dawn.timeline, []);
	assert.ok(gone.lines.w > 0 && gone.timeline.length > 0);
});

test('scenePlace reads the place out of a scene heading', () => {
	assert.equal(scenePlace('THE BAR - DAY 5\nGo is washing mugs.'), 'The bar');
	assert.equal(scenePlace('INT. POLICE STATION HALLWAY - DAY'), 'Police station hallway');
	assert.equal(scenePlace('GONE GIRL\nAugust 29, 2013'), null);
	assert.equal(scenePlace(''), null);
});

test('related films share genres first, then director, then era', () => {
	const f = (id, genres, directors, year, popularity) => ({ id, genres, directors, year, popularity });
	const me = f('me', ['Drama', 'Thriller'], ['Fincher'], 2014, 1);
	const films = [me, f('a', ['Comedy'], [], 2014, 2), f('b', ['Drama', 'Thriller'], [], 1980, 3), f('c', ['Crime'], ['Fincher'], 1999, 4), f('d', ['Drama'], [], 2013, 5)];
	assert.deepEqual(relatedFilms(me, films, 4).map((x) => x.id), ['b', 'd', 'c', 'a']);
});
