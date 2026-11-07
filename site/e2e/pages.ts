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

type ShelfFilm = { title: string; year: number; director: string; score: number };

/** The built shelf, so tests count from the data instead of hard-coding totals that change every batch */
export function shelf(): ShelfFilm[] {
	return JSON.parse(readFileSync(new URL('../dist/shelf.json', import.meta.url), 'utf8'));
}
