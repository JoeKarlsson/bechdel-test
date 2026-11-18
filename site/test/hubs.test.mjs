import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hubs, relatedLists, genreAdjective } from '../src/lib/films.mjs';

const film = (id, { genres = [], directors = [], year = 2000, pass = false, popularity = 1 } = {}) => ({
	id,
	slug: id,
	title: id,
	genres,
	directors,
	year,
	popularity,
	bechdel: { pass },
	lines: { w: 1, m: 3 },
});

test('hubs group by genre, decade and director, and skip small groups', () => {
	const films = [
		film('a', { genres: ['Horror', 'Sci-Fi'], directors: ['J.J. Abrams'], year: 1999, pass: true, popularity: 3 }),
		film('b', { genres: ['Horror'], directors: ['J.J. Abrams'], year: 1991, popularity: 1 }),
		film('c', { genres: ['Horror'], directors: ['J.J. Abrams', 'Chloé Zhao'], year: 2005, popularity: 2 }),
		film('d', { genres: ['Horror'], year: 1995 }),
		film('e', { genres: ['Horror'], year: 1993, pass: true }),
	];
	const { genres, decades, directors } = hubs(films);
	assert.deepEqual(genres.map((h) => h.href), ['/genres/horror/']);
	assert.equal(genres[0].pass, 2);
	assert.equal(genres[0].womenLines, 0.25);
	assert.deepEqual(decades.map((h) => h.href), []); // the 1990s have 4 films, one short
	assert.deepEqual(directors.map((h) => [h.href, h.films.map((f) => f.id)]), [['/directors/j-j-abrams/', ['b', 'c', 'a']]]);
	assert.equal(genreAdjective('Sci-Fi'), 'science fiction');
	assert.equal(genreAdjective('Horror'), 'horror');
});

test('two hubs with the same slug fail the build', () => {
	const films = ['a', 'b', 'c'].map((id) => film(id, { directors: ['Ann Lee', 'Ann  Lee'] }));
	assert.throws(() => hubs(films), /share the slug "ann-lee"/);
});

test('every film is somebody\'s related film', () => {
	// Six near-identical dramas crowd out the lone western for every slot
	const films = [
		...Array.from({ length: 8 }, (_, i) => film(`drama${i}`, { genres: ['Drama'], year: 2000, popularity: i })),
		film('western', { genres: ['Western'], year: 1950, popularity: 99 }),
	];
	const lists = relatedLists(films, 3);
	const linked = new Set([...lists.values()].flat().map((f) => f.id));
	assert.deepEqual(films.filter((f) => !linked.has(f.id)).map((f) => f.id), []);
	for (const [id, list] of lists) assert.equal(list.length, 3, id);
});
