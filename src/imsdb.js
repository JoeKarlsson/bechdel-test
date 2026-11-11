/**
 * Read the Internet Movie Script Database (imsdb.com): its list of movie
 * scripts, and the screenplay text on a script page.
 */
const IMSDB = 'https://imsdb.com';

const HTML_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

const decodeHtmlEntities = text => text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code) => {
	if (code[0] === '#') {
		const isHex = code[1].toLowerCase() === 'x';
		return String.fromCodePoint(parseInt(code.slice(isHex ? 2 : 1), isHex ? 16 : 10));
	}
	return HTML_ENTITIES[code.toLowerCase()] ?? entity;
});

/**
 * The file name a script is saved under, in the style of scripts/*.txt:
 * "Abyss, The" -> "the-abyss.txt", "Star Wars: A New Hope" -> "star-wars-a-new-hope.txt".
 * The article stays: OMDB matches "birds" to Birds of Prey, not The Birds.
 */
const scriptFileName = title => {
	const slug = title
		.replace(/^(.*),\s*(The|A|An)$/i, '$2 $1')
		.toLowerCase()
		.normalize('NFD').replace(/[̀-ͯ]/g, '')
		.replace(/&/g, ' and ')
		.replace(/['’]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
	return `${slug}.txt`;
};

/** Every movie on the all-scripts page: [{ title, moviePageUrl }] */
const parseScriptIndex = html => [...html.matchAll(/<a href="(\/Movie Scripts\/[^"]+)" title="[^"]*">([^<]+)<\/a>/g)]
	.map(([, href, title]) => ({ title: decodeHtmlEntities(title).trim(), moviePageUrl: IMSDB + encodeURI(href).replace(/\?/g, '%3F') }));

/** The script page linked from a movie's page, or null when IMSDb has no script for it */
const parseScriptPageUrl = html => {
	const match = html.match(/href="(\/scripts\/[^"]+\.html)"/);
	return match ? IMSDB + encodeURI(match[1]) : null;
};

/**
 * The screenplay text on a script page, with its markup removed: the <pre>
 * block, or on pages without one, the script cell up to IMSDb's footer table.
 */
const parseScriptText = html => {
	const screenplay = html.match(/<pre>([\s\S]*?)<\/pre>/i)
		?? html.match(/<td class="scrtext">([\s\S]*?)<table width="85%"/i);
	if (!screenplay) return null;
	// Some <pre> blocks carry a frame-busting <script>, or the end of one opened before the <pre>
	const withoutScripts = screenplay[1].replace(/<script[\s\S]*?<\/script>/gi, '').replace(/^[\s\S]*<\/script>/i, '');
	const text = decodeHtmlEntities(withoutScripts.replace(/\r\n?/g, '\n').replace(/\n<br>/gi, '\n').replace(/<[^>]*>/g, ''));
	return text.trim() + '\n';
};

module.exports = { IMSDB, decodeHtmlEntities, scriptFileName, parseScriptIndex, parseScriptPageUrl, parseScriptText };
