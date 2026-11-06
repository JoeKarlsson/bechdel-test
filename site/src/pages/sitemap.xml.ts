import type { APIRoute } from 'astro';
import { loadFilms } from '../lib/films.mjs';

// Every indexable page: the 404 page is noindex and stays out
export const GET: APIRoute = ({ site }) => {
	const paths = ['/', '/about/', '/case-study/', '/privacy/', ...loadFilms().map((f) => `/films/${f.slug}/`)];
	const urls = paths.map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`).join('\n');
	return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
		headers: { 'Content-Type': 'application/xml' },
	});
};
