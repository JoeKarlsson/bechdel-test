#!/usr/bin/env node
/**
 * Collect bechdeltest.com's reader ratings for every film in
 * scripts/manifest.json into data/eval/bechdeltest-ratings.json, the ground
 * truth `npm run eval` scores the parser against. Its API is gone (HTTP 410),
 * so this reads the public per-year listing pages, one request a second.
 * Run it again after adding scripts.
 *
 *   npm run ratings
 */
const fs = require('fs');
const path = require('path');
const { fetchReleaseYear } = require('../src/fetchMetadata');
const { loadManifest } = require('../src/manifest');

const OUT = path.resolve(__dirname, '../data/eval/bechdeltest-ratings.json');
const USER_AGENT = 'bechdel-test analyzer (+https://github.com/JoeKarlsson/bechdel-test)';
const PAGE_SIZE = 200;

const sleep = ms => new Promise(resolve => { setTimeout(resolve, ms); });

const decode = s => s.replace(/&#34;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

/** Every film on one year's listing: imdb id -> { rating, dubious, title, url } */
const fetchYear = async year => {
	const films = {};
	for (let page = 0; ; page++) {
		const url = `https://bechdeltest.com/year/${year}/${page ? `page/${page}/` : ''}`;
		// One retry after a pause: the site occasionally drops a connection
		const get = () => fetch(url, { headers: { 'User-Agent': USER_AGENT } });
		const response = await get().catch(async () => { await sleep(5000); return get(); });
		if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
		const html = await response.text();
		const rows = [...html.matchAll(/imdb\.com\/title\/(tt\d+)\/"><img src="\/static\/\w+\.png" alt="\[(\d)\]" title="([^"]*)"[^>]*><\/a>\s*<a id="movie-\d+" href="(\/view\/[^"]+)">([^<]*)<\/a>/g)];
		for (const [, imdbId, rating, description, viewPath, title] of rows) {
			films[imdbId] = {
				rating: Number(rating),
				dubious: description.includes('dubious'),
				title: decode(title),
				url: `https://bechdeltest.com${viewPath}`,
			};
		}
		await sleep(1000);
		if (rows.length < PAGE_SIZE) return films;
	}
};

const main = async () => {
	process.loadEnvFile(path.resolve(__dirname, '../.env'));
	const ids = Object.values(loadManifest()).filter(Boolean);
	const yearOf = {};
	for (const id of ids) {
		yearOf[id] = await fetchReleaseYear(id);
	}
	// Match by IMDb id across every year fetched: bechdeltest.com sometimes
	// lists a film a year off from TMDB's release year
	const listed = {};
	for (const year of [...new Set(Object.values(yearOf).filter(Boolean))].sort()) {
		Object.assign(listed, await fetchYear(year));
		process.stdout.write(`${year} `);
	}
	const ratings = Object.fromEntries(ids.filter(id => listed[id]).map(id => [id, listed[id]]));
	fs.mkdirSync(path.dirname(OUT), { recursive: true });
	const sorted = Object.fromEntries(Object.entries(ratings).sort(([a], [b]) => a.localeCompare(b)));
	fs.writeFileSync(OUT, `${JSON.stringify(sorted, null, '\t')}\n`);
	console.log(`\n${Object.keys(ratings).length} of ${ids.length} films have a bechdeltest.com rating.`);
};

main().catch(error => {
	console.error(error.message);
	process.exitCode = 1;
});
