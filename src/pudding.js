/**
 * Read The Pudding's film dialogue sources (pudding.cool/2017/03/film-dialogue):
 * a public sheet naming, for about 2,000 films, the IMDb id and the link to
 * the screenplay they used. Many links are dead now; the live ones still
 * serve the script.
 */

// The sheet linked from github.com/matthewfdaniels/scripts, as CSV
const SOURCES_URL = 'https://docs.google.com/spreadsheets/d/1fbcldxxyRvHjDaaY0EeQnQzvSP7Ub8QYVM2bIs-tKH8/export?format=csv&gid=1668340193';

// Hosts we won't take scripts from: wikileaks.org's come from the 2014 Sony hack
const EXCLUDED_HOSTS = ['wikileaks.org'];

/** RFC 4180 CSV as rows of fields: quoted fields may hold commas, newlines and "" */
const parseCsv = text => {
	const rows = [];
	let row = [];
	let field = '';
	let quoted = false;
	for (let i = 0; i < text.length; i++) {
		const char = text[i];
		if (quoted) {
			if (char === '"' && text[i + 1] === '"') {
				field += '"';
				i++;
			} else if (char === '"') {
				quoted = false;
			} else {
				field += char;
			}
		} else if (char === '"') {
			quoted = true;
		} else if (char === ',') {
			row.push(field);
			field = '';
		} else if (char === '\n' || char === '\r') {
			if (char === '\r' && text[i + 1] === '\n') i++;
			row.push(field);
			rows.push(row);
			row = [];
			field = '';
		} else {
			field += char;
		}
	}
	if (field || row.length > 0) rows.push([...row, field]);
	return rows;
};

/** A link as a fetchable URL (URL percent-encodes its spaces); Dropbox's dl=0 serves a preview page, dl=1 the file */
const downloadUrl = link => {
	const url = new URL(link);
	if (url.hostname.endsWith('dropbox.com')) url.searchParams.set('dl', '1');
	return url.href;
};

/**
 * The sheet's films we don't have yet that have a web link to fetch:
 * [{ imdbId, title, year, url }]. Rows without a link (a file from The
 * Pudding's own archive) or from an excluded host are left out.
 */
const parseSources = (csv, filmsWeHave) => {
	const [header, ...rows] = parseCsv(csv);
	const column = name => header.indexOf(name);
	const [imdbColumn, titleColumn, yearColumn, linkColumn] = ['imdb_id', 'title', 'year', 'link'].map(column);
	return rows
		.map(row => ({ imdbId: row[imdbColumn], title: row[titleColumn], year: row[yearColumn], link: row[linkColumn]?.trim() }))
		.filter(({ imdbId, link }) => /^tt\d+$/.test(imdbId) && /^https?:\/\//.test(link) && !filmsWeHave.has(imdbId))
		.filter(({ link }) => !EXCLUDED_HOSTS.some(host => new URL(link).hostname.endsWith(host)))
		.map(({ link, ...film }) => ({ ...film, url: downloadUrl(link) }));
};

module.exports = { SOURCES_URL, parseCsv, parseSources };
