/**
 * Read Script Slug (scriptslug.com): its sitemap of script pages, and the
 * film, IMDb id and PDF that a script page describes in its JSON-LD.
 */
const SITEMAP_URL = 'https://www.scriptslug.com/sitemap-scripts.xml';

/** Every script page URL in the sitemap */
const parseSitemap = xml => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url.trim());

/**
 * The film a script page is for: { title, year, imdbId, pdfUrl }, or null
 * when the page is not a film (a TV episode) or names no IMDb id or PDF.
 */
const parseScriptPage = html => {
	const graph = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
		.flatMap(([, json]) => {
			const data = JSON.parse(json);
			return data['@graph'] ?? [data];
		});
	const page = graph.find(node => node.about?.['@type'] === 'Movie' && node.encoding?.contentUrl);
	if (!page) return null;
	const movie = page.about;
	const imdbId = (movie.sameAs ?? []).map(url => url.match(/imdb\.com\/title\/(tt\d+)/)?.[1]).find(Boolean);
	if (!imdbId) return null;
	return { title: movie.name, year: movie.dateCreated, imdbId, pdfUrl: page.encoding.contentUrl };
};

/** The script's file name: its Script Slug page name, "the-matrix-1999.txt" */
const scriptFileName = pageUrl => `${new URL(pageUrl).pathname.split('/').pop()}.txt`;

module.exports = { SITEMAP_URL, parseSitemap, parseScriptPage, scriptFileName };
