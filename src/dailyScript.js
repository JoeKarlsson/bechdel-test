/**
 * Read The Daily Script (dailyscript.com): its film listing, and a listed
 * script's text, whether the file is HTML, plain text or a PDF.
 */
const { parseScriptText, decodeHtmlEntities } = require('./imsdb');
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

/**
 * The film's own title from a listing title: "American Bullshit (filmed as
 * American Hustle)" -> "American Hustle", "8 Mile (aka Untitled Detroit
 * Project)" -> "8 Mile", "Shining, The" -> "The Shining"
 */
const filmTitle = title => {
	const releasedAs = title.match(/\((?:filmed|released) as ([^)]+)\)/i);
	return (releasedAs ? releasedAs[1] : title.replace(/\s*\([^)]*\)/g, ''))
		.replace(/:\s*$/, '')
		.replace(/^(.*),\s*(The|A|An)$/i, '$2 $1')
		.trim();
};

/** A page's text when the script isn't in a <pre> block: each line break or paragraph a new line */
const textOfHtml = html => decodeHtmlEntities(html
	.replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
	.replace(/\r\n?/g, '\n')
	.replace(/<br\s*\/?>|<\/(p|div)>/gi, '\n')
	.replace(/<[^>]*>/g, ''));

/**
 * A script's text from its file, whether a PDF, plain text or an HTML page
 * (told apart by content: some links have no extension), or null for
 * formats we don't read (Word, RTF, images)
 */
const scriptTextFrom = async (url, bytes) => {
	const extension = new URL(url).pathname.split('.').pop().toLowerCase();
	if (extension === 'pdf' || bytes.subarray(0, 5).toString('latin1') === '%PDF-') return pdfToText(bytes);
	if (['doc', 'docx', 'rtf', 'jpg', 'gif', 'png', 'zip'].includes(extension)) return null;
	// Daily Script serves ISO-8859-1 (WHATWG's latin1 is Windows-1252)
	const text = new TextDecoder('latin1').decode(bytes);
	if (extension !== 'txt' && /<(html|body|pre|br|p)\b/i.test(text)) return parseScriptText(text) ?? textOfHtml(text);
	return text;
};

module.exports = { LISTING_PAGES, parseListing, filmTitle, scriptTextFrom };
