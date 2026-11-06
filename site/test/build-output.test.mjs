// Checks every page in dist/ (run `npm run build` first). These are the launch
// checklist items that drift: metadata, share images, one h1, the CSP, no
// inline scripts, safe external links, the sitemap, internal links, security.txt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const SITE = 'https://bechdel.joekarlsson.com';

if (!existsSync(DIST)) throw new Error('dist/ is missing: run `npm run build` first');

function htmlFiles(dir) {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) return htmlFiles(path);
		return name.endsWith('.html') ? [path] : [];
	});
}

// "dist/films/gone-girl-2014/index.html" -> "/films/gone-girl-2014/"
const urlPath = (file) => '/' + relative(DIST, file).replace(/index\.html$/, '').replace(/\.html$/, '');
const meta = (html, attr, key) => html.match(new RegExp(`<meta[^>]*${attr}="${key}"[^>]*content="([^"]*)"`))?.[1] ?? null;
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

const pages = htmlFiles(DIST).map((file) => {
	const html = readFileSync(file, 'utf8');
	return {
		path: urlPath(file),
		html,
		title: decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''),
		description: decode(meta(html, 'name', 'description') ?? ''),
		noindex: /<meta name="robots" content="noindex"/.test(html),
	};
});
const indexable = pages.filter((p) => !p.noindex);

test('every page has the head the launch checklist asks for', () => {
	for (const p of pages) {
		const where = `on ${p.path}`;
		assert.match(p.html, /^<!DOCTYPE html><html lang="en"[\s>]/i, `lang ${where}`);
		assert.ok(p.title, `title ${where}`);
		assert.ok(p.description && p.description.length <= 160, `description under 160 chars ${where} (${p.description.length})`);
		assert.match(p.html, /<meta http-equiv="Content-Security-Policy"/, `CSP ${where}`);
		assert.equal(meta(p.html, 'name', 'color-scheme'), 'only dark', `color-scheme ${where}`);
		assert.match(p.html, /<meta name="darkreader-lock"/, `darkreader-lock ${where}`);
		assert.equal((p.html.match(/<h1[\s>]/g) ?? []).length, 1, `exactly one h1 ${where}`);
		if (!p.noindex) assert.match(p.html, new RegExp(`<link rel="canonical" href="${SITE}${p.path}"`), `canonical ${where}`);

		const image = meta(p.html, 'property', 'og:image');
		assert.ok(image?.startsWith(SITE), `absolute og:image ${where}`);
		assert.ok(existsSync(join(DIST, image.slice(SITE.length))), `og:image file exists ${where}: ${image}`);
		assert.ok(meta(p.html, 'property', 'og:image:alt'), `og:image:alt ${where}`);
	}
});

test('no inline scripts, and new-tab links are safe', () => {
	for (const p of pages) {
		for (const tag of p.html.match(/<script\b[^>]*>/g) ?? []) {
			// JSON data blocks never run; anything else must be an external file
			assert.ok(/type="application\/(ld\+)?json"/.test(tag) || /\ssrc="/.test(tag), `inline script on ${p.path}: ${tag}`);
		}
		for (const a of p.html.match(/<a\b[^>]*target="_blank"[^>]*>/g) ?? []) {
			assert.match(a, /rel="noopener noreferrer"/, `target=_blank without rel on ${p.path}: ${a}`);
		}
	}
});

test('indexable pages have unique titles and descriptions', () => {
	const seen = (key) => {
		const counts = new Map();
		for (const p of indexable) counts.set(p[key], [...(counts.get(p[key]) ?? []), p.path]);
		return [...counts].filter(([, paths]) => paths.length > 1);
	};
	assert.deepEqual(seen('title'), []);
	assert.deepEqual(seen('description'), []);
});

test('the sitemap lists exactly the indexable pages', () => {
	const xml = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
	const listed = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].slice(SITE.length)).sort();
	assert.deepEqual(listed, indexable.map((p) => p.path).sort());
	assert.match(readFileSync(join(DIST, 'robots.txt'), 'utf8'), /Sitemap: https:\/\/bechdel\.joekarlsson\.com\/sitemap\.xml/);
});

test('every internal link and asset resolves to a built file', () => {
	const missing = [];
	for (const p of pages) {
		for (const [, ref] of p.html.matchAll(/(?:href|src|srcset)="([^"]+)"/g)) {
			for (const part of ref.split(',')) {
				const url = part.trim().split(/\s+/)[0];
				if (!url.startsWith('/') || url.startsWith('//')) continue;
				const path = decodeURIComponent(url.split(/[?#]/)[0]);
				const target = path.endsWith('/') ? join(DIST, path, 'index.html') : join(DIST, path);
				if (!existsSync(target)) missing.push(`${p.path} -> ${url}`);
			}
		}
	}
	assert.deepEqual(missing, []);
});

test('security.txt has a contact and won’t expire in the next 30 days', () => {
	const txt = readFileSync(join(DIST, '.well-known/security.txt'), 'utf8');
	assert.match(txt, /^Contact: https:\/\//m);
	const expires = new Date(txt.match(/^Expires: (.+)$/m)[1]);
	const days = (expires - Date.now()) / 86_400_000;
	assert.ok(days > 30, `security.txt expires in ${Math.round(days)} days: renew it`);
});
