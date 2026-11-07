// Posters and backdrops come straight from TMDB's image CDN, in the sizes TMDB
// serves, so the site stores no image files of its own (2,000+ films' worth
// would pass GitHub Pages' 1 GB limit). TMDB's terms allow this with the
// credit on the About page; the CSP in Base.astro allows the host.
const CDN = 'https://image.tmdb.org/t/p';

/** "/abc.jpg" from a stored TMDB URL like ".../t/p/w300/abc.jpg"; null for anything else */
const tmdbPath = (url: string | null | undefined) => url?.match(/^https:\/\/image\.tmdb\.org\/t\/p\/[^/]+(\/[^/]+)$/)?.[1] ?? null;

export type TmdbImage = { src: string; srcset: string; width: number; height: number };

const sized = (path: string | null, widths: number[], ratio: number): TmdbImage | null =>
	path
		? {
				src: `${CDN}/w${widths[0]}${path}`,
				srcset: widths.map((w) => `${CDN}/w${w}${path} ${w}w`).join(', '),
				width: widths[0],
				height: Math.round(widths[0] * ratio),
			}
		: null;

/** A poster at TMDB's poster widths (2:3) */
export const posterFor = (url: string | null | undefined, widths = [185, 342]) => sized(tmdbPath(url), widths, 1.5);
/** A backdrop at TMDB's backdrop widths (16:9) */
export const backdropFor = (url: string | null | undefined, widths = [780, 1280]) => sized(tmdbPath(url), widths, 9 / 16);
