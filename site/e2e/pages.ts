import { readFileSync } from 'node:fs';

// One of each page type, plus the edge cases the film page handles
export const PAGE_TYPES = {
	home: '/',
	'film that passes': '/films/gone-girl-2014/',
	'film that fails': '/films/fight-club-1999/',
	'film with no timeline': '/films/dawn-of-the-dead-1978/',
	numbers: '/numbers/',
	'every film': '/films/',
	about: '/about/',
	'case study': '/case-study/',
	privacy: '/privacy/',
	'not found': '/no-such-page/',
};

/** Every indexable page, from the built sitemap */
export function allPages(): string[] {
	const xml = readFileSync(new URL('../dist/sitemap.xml', import.meta.url), 'utf8');
	return [...xml.matchAll(/<loc>https:\/\/bechdel\.joekarlsson\.com([^<]+)<\/loc>/g)].map((m) => m[1]);
}

type ShelfFilm = { slug: string; title: string; year: number; director: string; score: number };

/** The built shelf, so tests count from the data instead of hard-coding totals that change every batch */
export function shelf(): ShelfFilm[] {
	return JSON.parse(readFileSync(new URL('../dist/shelf.json', import.meta.url), 'utf8'));
}

const FILM_PAGE = /^\/films\/[^/]+\/$/;
const longestWord = (text: string) => Math.max(0, ...text.split(/\s+/).map((word) => word.length));

/**
 * Every page that isn't a film page, plus the film pages most likely to break
 * a narrow layout (the longest unbroken words, titles and director names) and
 * an even spread of the rest: about 100 pages however big the shelf grows
 */
export function layoutSample(): string[] {
	const films = shelf();
	const pick = (by: (f: ShelfFilm) => number, count: number) => [...films].sort((a, b) => by(b) - by(a)).slice(0, count);
	const step = Math.max(1, Math.floor(films.length / 40));
	const sampled = [
		...pick((f) => longestWord(f.title), 20),
		...pick((f) => f.title.length, 15),
		...pick((f) => longestWord(f.director) + f.director.length / 100, 15),
		...films.filter((_, i) => i % step === 0),
	].map((f) => `/films/${f.slug}/`);
	return [...new Set([...allPages().filter((path) => !FILM_PAGE.test(path)), ...sampled])];
}
