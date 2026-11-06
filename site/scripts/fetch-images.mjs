// Downloads each film's poster and backdrop into src/assets/films/ so the site
// builds offline and serves its own optimized copies (no hotlinking to TMDB).
// Run after exporting new films: `npm run images`. Files already there are kept.
// A dead link is reported and skipped; the page shows its no-poster fallback.
import { readdir, readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { join } from 'node:path';

const DATA_DIR = new URL('../../data/films/', import.meta.url);
const OUT_DIR = new URL('../src/assets/films/', import.meta.url);

// TMDB serves several widths from the same path; ask for ones that cover the
// largest slot at 2x (poster 240px wide, backdrop full width).
const resize = (url, width) => url.replace(/\/t\/p\/[^/]+\//, `/t/p/${width}/`);

async function exists(url) {
	try {
		await access(url);
		return true;
	} catch {
		return false;
	}
}

async function download(src, dest) {
	const res = await fetch(src);
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

await mkdir(OUT_DIR, { recursive: true });
const failures = [];
let fetched = 0;

for (const file of (await readdir(DATA_DIR)).filter((f) => f.endsWith('.json'))) {
	const film = JSON.parse(await readFile(new URL(file, DATA_DIR), 'utf8'));
	const jobs = [
		['poster', film.images?.poster || film.urlPoster, 'w500'],
		['backdrop', film.images?.backdrop, 'w1280'],
	];
	for (const [kind, url, width] of jobs) {
		if (!url) continue;
		const dest = new URL(`${film._id}-${kind}.jpg`, OUT_DIR);
		if (await exists(dest)) continue;
		try {
			await download(resize(url, width), dest);
			fetched++;
		} catch (err) {
			failures.push(`${film.title} ${kind}: ${err.message} (${url})`);
		}
	}
}

console.log(`Downloaded ${fetched} images into ${join('src', 'assets', 'films')}`);
if (failures.length) {
	console.log(`Skipped ${failures.length} (the page falls back to a plain label):`);
	for (const f of failures) console.log(`  ${f}`);
}
