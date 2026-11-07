/**
 * Read The Daily Script (dailyscript.com): its film listing, and a listed
 * script's text, whether the file is HTML, plain text or a PDF.
 */
const { parseScriptText } = require('./imsdb');
const { pdfToText } = require('./pdfText');

const DAILY_SCRIPT = 'https://www.dailyscript.com';
const LISTING_PAGES = [`${DAILY_SCRIPT}/movie.html`, `${DAILY_SCRIPT}/movie_n-z.html`];

const decodeEntities = text => text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

/** Every script on a listing page: [{ title, year, url }] (year null when unlisted) */
const parseListing = html => [...html.matchAll(/<a href="(scripts\/[^"]+)">([^<]+)<\/a>([^<]*)/g)]
	.map(([, href, title, after]) => ({
		title: decodeEntities(title).trim(),
		year: decodeEntities(after).match(/\b(19\d\d|20\d\d)\b/)?.[1] ?? null,
		url: `${DAILY_SCRIPT}/${encodeURI(href)}`,
	}));

/** A script's text from its file, or null for formats we don't read (Word, RTF, images) */
const scriptTextFrom = async (url, bytes) => {
	const extension = new URL(url).pathname.split('.').pop().toLowerCase();
	if (extension === 'pdf') return pdfToText(bytes);
	// Daily Script serves ISO-8859-1 (WHATWG's latin1 is Windows-1252)
	const text = new TextDecoder('latin1').decode(bytes);
	if (extension === 'txt') return text;
	if (extension === 'html' || extension === 'htm') return parseScriptText(text);
	return null;
};

module.exports = { LISTING_PAGES, parseListing, scriptTextFrom };
