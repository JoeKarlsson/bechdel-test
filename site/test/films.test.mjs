import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	cleanTitle,
	slugify,
	rulesFromScore,
	toNumber,
	speakersFrom,
	timelineFrom,
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

test('speakersFrom title-cases the stored speakers, most lines first', () => {
	const script = { speakers: [{ name: 'AMY', lines: 2, gender: 'w' }, { name: 'MRS. ELLIOTT', lines: 1, gender: null }] };
	assert.deepEqual(speakersFrom(script), [
		{ name: 'Amy', lines: 2, gender: 'w' },
		{ name: 'Mrs. Elliott', lines: 1, gender: null },
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
	assert.equal(gone.bechdel.scenesTotal, 231);
	assert.equal(gone.readers.score, 3);
	// Its AI review of the old analysis's passing scenes was dropped on re-scoring
	assert.equal(gone.ai.review, null);
	assert.equal(gone.ai.model.name, 'Claude 3.5 Haiku');
	assert.equal(gone.speakers[0].name, 'Nick');
	assert.equal(films.filter((f) => f.bechdel.pass).length, 23);
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
