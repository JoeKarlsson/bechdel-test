import type { APIRoute } from 'astro';
import { loadFilms, changesOnScreen } from '../lib/films.mjs';

// Every film on the shelf, most popular first, for the home page's search,
// filters and "Show more". The page's HTML holds only the first page of tapes;
// this loads the first time someone uses the shelf.
export const GET: APIRoute = () =>
	new Response(
		JSON.stringify(
			loadFilms().map((f) => ({
				slug: f.slug,
				title: f.title,
				year: f.year,
				director: f.directors.join(', '),
				score: f.bechdel.score,
				popularity: f.popularity,
				poster: f.images.poster,
				// set only when the verdict changes between page and screen
				...(changesOnScreen(f) ? { change: true } : {}),
			})),
		),
		{ headers: { 'Content-Type': 'application/json' } },
	);
