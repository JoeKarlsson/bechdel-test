import { readFileSync } from 'node:fs';

// One of each page type, plus the edge cases the film page handles
export const PAGE_TYPES = {
	home: '/',
	'film that passes': '/films/gone-girl-2014/',
	'film that fails': '/films/fight-club-1999/',
	'film whose script did not parse': '/films/dawn-of-the-dead-2004/',
	'film with no poster': '/films/evil-dead-ii-dead-by-dawn-1987/',
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
