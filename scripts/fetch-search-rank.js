#!/usr/bin/env node
/**
 * Rank every film in data/films by how many IMDb votes it has, a stand-in for
 * how often people search for it, into data/search-rank.json (most voted
 * first, ties broken by box office). The site's sitemap lists the top of this
 * list. Reads IMDb's free title.ratings dataset; run it again after adding films.
 *
 *   npm run search-rank
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Readable } = require('stream');
const zlib = require('zlib');

const FILMS_DIR = path.resolve(__dirname, '../data/films');
const OUT = path.resolve(__dirname, '../data/search-rank.json');
const RATINGS_URL = 'https://datasets.imdbws.com/title.ratings.tsv.gz';

const main = async () => {
	const films = fs.readdirSync(FILMS_DIR)
		.filter(f => f.endsWith('.json'))
		.map(f => JSON.parse(fs.readFileSync(path.join(FILMS_DIR, f), 'utf8')));
	const wanted = new Set(films.map(f => f.idIMDB));

	const response = await fetch(RATINGS_URL);
	if (!response.ok) throw new Error(`HTTP ${response.status} from ${RATINGS_URL}`);
	// tconst, averageRating, numVotes
	const votes = new Map();
	const lines = readline.createInterface({ input: Readable.fromWeb(response.body).pipe(zlib.createGunzip()) });
	for await (const line of lines) {
		const [id, , numVotes] = line.split('\t');
		if (wanted.has(id)) votes.set(id, Number(numVotes));
	}
	if (votes.size === 0) throw new Error('No film matched the IMDb ratings dataset');

	const ranked = films
		.map(f => ({ imdb: f.idIMDB, title: f.title, votes: votes.get(f.idIMDB) ?? 0, revenue: f.money?.revenue ?? 0 }))
		.sort((a, b) => b.votes - a.votes || b.revenue - a.revenue || a.imdb.localeCompare(b.imdb))
		.map(({ imdb, title, votes: v }) => ({ imdb, title, votes: v }));
	fs.writeFileSync(OUT, `${JSON.stringify(ranked, null, '\t')}\n`);
	console.log(`Ranked ${ranked.length} films (${votes.size} with IMDb votes) into ${path.relative(process.cwd(), OUT)}`);
};

main().catch(err => {
	console.error(err);
	process.exit(1);
});
