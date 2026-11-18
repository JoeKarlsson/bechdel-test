import type { APIRoute } from 'astro';
import { loadFilms } from '../lib/films.mjs';

// Every indexable page: the 404 page is noindex and stays out
export const GET: APIRoute = ({ site }) => {
	const paths: [string, string | null][] = [
		...['/', '/films/', '/numbers/', '/about/', '/case-study/', '/privacy/'].map((p): [string, null] => [p, null]),
		// A film page changes when its film is analyzed, so that's its lastmod (never the build time)
		...loadFilms().map((f): [string, string | null] => [`/films/${f.slug}/`, f.added ? f.added.slice(0, 10) : null]),
	];
	const urls = paths
		.map(([p, lastmod]) => `  <url><loc>${new URL(p, site).href}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`)
		.join('\n');
	return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
		headers: { 'Content-Type': 'application/xml' },
	});
};
