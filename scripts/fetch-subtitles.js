#!/usr/bin/env node
/**
 * Download every English subtitle the OPUS OpenSubtitles corpus has for the
 * films on the site, into the gitignored subtitles/local/<IMDb id>/ (the text
 * is the subtitlers' and isn't republished). Already-downloaded files are
 * skipped, so a stopped run picks up where it left off.
 *
 *   npm run fetch-subtitles                  every film on the site
 *   npm run fetch-subtitles -- tt0075314 ... these films
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { loadOpusIndex, fetchMember } = require('../src/opus');

const ROOT = path.resolve(__dirname, '..');
const FILMS_DIR = path.join(ROOT, 'data/films');
const SUBTITLES_DIR = path.join(ROOT, 'subtitles/local');
const CONCURRENCY = 8;

const main = async () => {
	const ids = process.argv.slice(2);
	const imdbIds = ids.length > 0
		? ids
		: fs.readdirSync(FILMS_DIR).filter(f => f.endsWith('.json'))
			.map(f => JSON.parse(fs.readFileSync(path.join(FILMS_DIR, f), 'utf8')).idIMDB);
	const index = await loadOpusIndex(imdbIds);
	const jobs = Object.entries(index).flatMap(([imdbId, members]) => members.map(member => ({
		member, file: path.join(SUBTITLES_DIR, imdbId, `${path.basename(member.name)}.gz`),
	}))).filter(job => !fs.existsSync(job.file));
	const none = Object.values(index).filter(members => members.length === 0).length;
	console.log(`${imdbIds.length} films, ${none} not in the corpus, ${jobs.length} subtitles to download`);

	let done = 0;
	const failures = [];
	const worker = async () => {
		for (let job = jobs.shift(); job; job = jobs.shift()) {
			try {
				const xml = await fetchMember(job.member);
				fs.mkdirSync(path.dirname(job.file), { recursive: true });
				fs.writeFileSync(job.file, zlib.gzipSync(xml));
			} catch (error) {
				failures.push(`${job.member.name}: ${error.message}`);
			}
			if (++done % 500 === 0) console.log(`${done} downloaded`);
		}
	};
	await Promise.all(Array.from({ length: CONCURRENCY }, worker));
	console.log(`${done - failures.length} downloaded, ${failures.length} failed`);
	if (failures.length > 0) {
		console.error(failures.join('\n'));
		process.exitCode = 1;
	}
};

main().catch(error => {
	console.error(error);
	process.exit(1);
});
