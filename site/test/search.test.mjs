import { test } from 'node:test';
import assert from 'node:assert/strict';
import { closest, editDistance, squash, titleKeys } from '../src/lib/search.mjs';

const films = [
	{ title: 'The Shawshank Redemption', slug: 'the-shawshank-redemption-1994' },
	{ title: 'Mad Max: Fury Road', slug: 'mad-max-fury-road-2015' },
	{ title: 'Amélie', slug: 'amelie-2001' },
	{ title: 'Up', slug: 'up-2009' },
];
const byTitle = (f) => titleKeys(f.title);
const bySlug = (f) => [f.slug, f.slug.replace(/-\d{4}$/, '')];

test('squash keeps letters and digits, without accents or case', () => {
	assert.equal(squash('Mad Max: Fury Road'), 'madmaxfuryroad');
	assert.equal(squash('Amélie!'), 'amelie');
	assert.equal(squash(null), '');
	assert.equal(squash('千と千尋の神隠し'), '千と千尋の神隠し');
});

test('edit distance counts single-letter edits', () => {
	assert.equal(editDistance('kitten', 'sitting'), 3);
	assert.equal(editDistance('', 'abc'), 3);
	assert.equal(editDistance('same', 'same'), 0);
});

test('closest forgives typos, a missing "The" and a missing year', () => {
	assert.equal(closest('shawshank redemtion', films, byTitle)?.slug, 'the-shawshank-redemption-1994');
	assert.equal(closest('amelie', films, byTitle)?.slug, 'amelie-2001');
	assert.equal(closest('mad-max-fury-rood-2015', films, bySlug)?.slug, 'mad-max-fury-road-2015');
	assert.equal(closest('mad-max-fury-road', films, bySlug)?.slug, 'mad-max-fury-road-2015');
});

test('closest gives up on queries that are too short or too far off', () => {
	assert.equal(closest('u', films, byTitle), null);
	assert.equal(closest('the godfather', films, byTitle), null);
});
