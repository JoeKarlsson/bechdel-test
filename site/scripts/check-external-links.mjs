// Checks every outside link in dist/ (run after `npm run build`). Share intents
// are skipped (they need a signed-in user). Sites that refuse automated checks
// (IMDb answers 403/202 to scripts) are reported as unverified, not broken.
// Exits 1 if any link is broken.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const SKIP = /bsky\.app\/intent|threads\.net\/intent|linkedin\.com\/sharing|reddit\.com\/submit|news\.ycombinator\.com\/submitlink|x\.com\/intent/;
const BLOCKS_BOTS = /(^|\.)imdb\.com$/;

const files = (dir) =>
	readdirSync(dir).flatMap((n) => {
		const p = join(dir, n);
		return statSync(p).isDirectory() ? files(p) : n.endsWith('.html') ? [p] : [];
	});

const links = new Map(); // url -> first page that links it
for (const file of files(DIST)) {
	for (const [, href] of readFileSync(file, 'utf8').matchAll(/<a\b[^>]*href="(https?:\/\/[^"]+)"/g)) {
		const url = href.replace(/&amp;/g, '&');
		if (SKIP.test(url) || url.startsWith('https://bechdel.joekarlsson.com')) continue;
		if (!links.has(url)) links.set(url, file.slice(DIST.length));
	}
}

async function check(url) {
	for (const method of ['HEAD', 'GET']) {
		try {
			const res = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(15_000), headers: { 'User-Agent': 'bechdel.io link check' } });
			if (res.ok) return { ok: true };
			if (method === 'GET') return { ok: false, status: res.status };
		} catch (err) {
			if (method === 'GET') return { ok: false, status: err.name };
		}
	}
}

const broken = [];
const unverified = [];
const queue = [...links.keys()];
await Promise.all(
	Array.from({ length: 8 }, async () => {
		for (let url = queue.shift(); url; url = queue.shift()) {
			const result = await check(url);
			if (result.ok) continue;
			const line = `${url} (${result.status}) on /${links.get(url)}`;
			(BLOCKS_BOTS.test(new URL(url).hostname) ? unverified : broken).push(line);
		}
	}),
);

console.log(`Checked ${links.size} outside links`);
if (unverified.length) console.log(`Couldn't verify ${unverified.length} on sites that block scripts:\n  ${unverified.slice(0, 5).join('\n  ')}${unverified.length > 5 ? '\n  ...' : ''}`);
if (broken.length) {
	console.error(`Broken (${broken.length}):\n  ${broken.join('\n  ')}`);
	process.exit(1);
}
