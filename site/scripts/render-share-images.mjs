// Renders the 1200x630 share cards (og:image) into public/og/: one per film,
// plus public/og.jpg for the rest of the site. Uses the site's fonts, colors
// and posters. Run after adding films or changing a verdict: `npm run og`
// (set CHROME to a Chromium binary if Playwright's own isn't installed).
import { chromium } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { loadFilms } from '../src/lib/films.mjs';

const root = new URL('../', import.meta.url);
const file = (p) => new URL(p, root);
const dataUrl = async (p, type) => `data:${type};base64,${(await readFile(file(p))).toString('base64')}`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const anton = await dataUrl('public/fonts/anton-latin.woff2', 'font/woff2');
const fraunces = await dataUrl('public/fonts/fraunces-latin.woff2', 'font/woff2');

const page = (body) => `<!doctype html><html><head><style>
@font-face { font-family: Anton; src: url(${anton}) format('woff2'); }
@font-face { font-family: Fraunces; src: url(${fraunces}) format('woff2'); font-weight: 400 700; }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; background: #000; color: #ece6da; font-family: Fraunces, serif; overflow: hidden; }
.card { display: flex; gap: 56px; align-items: center; height: 100%; padding: 56px 64px; }
.poster { flex: 0 0 auto; width: 300px; height: 450px; object-fit: cover; transform: rotate(-3deg); border: 10px solid #111; }
.blank { width: 300px; height: 450px; background: #1c1c1c; display: flex; align-items: center; justify-content: center; transform: rotate(-3deg); }
.blank span { background: #ece6da; color: #000; font-family: Anton; font-size: 34px; text-transform: uppercase; padding: 12px 16px; text-align: center; }
.text { flex: 1; min-width: 0; }
.stamp { display: inline-block; font-family: Anton; font-size: 40px; line-height: 1; text-transform: uppercase; color: #000; padding: 10px 18px; transform: rotate(-2deg); }
.pass { background: #ff4fd8; } .fail { background: #8f8f8f; }
h1 { font-family: Anton; font-weight: 400; text-transform: uppercase; line-height: 0.95; margin-top: 28px; }
.score { margin-top: 28px; font-family: Anton; font-size: 44px; text-transform: uppercase; }
.score b { color: #ff4fd8; font-weight: 400; }
.site { position: absolute; right: 64px; bottom: 40px; font-family: Anton; font-size: 40px; color: #ff4fd8; }
.home { padding: 64px; height: 100%; display: flex; flex-direction: column; justify-content: center; }
.home h1 { font-size: 92px; margin: 0; }
.home h1 span { color: #ff4fd8; }
.home p { margin-top: 28px; font-family: Anton; font-size: 48px; text-transform: uppercase; }
</style></head><body>${body}</body></html>`;

// Long titles step down so they fit in three lines
const titleSize = (t) => (t.length > 40 ? 64 : t.length > 24 ? 80 : t.length > 14 ? 104 : 128);

const films = loadFilms();
const passing = films.filter((f) => f.bechdel.pass).length;
await mkdir(file('public/og/'), { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
const shoot = async (html, out) => {
	await tab.setContent(html, { waitUntil: 'load' });
	await tab.evaluate(() => document.fonts.ready);
	await tab.screenshot({ path: file(out).pathname, type: 'jpeg', quality: 85 });
};

await shoot(
	page(`<div class="home"><h1>Do two women talk to each other about <span>something other than a man?</span></h1>
	<p>${Math.round((passing / films.length) * 100)}% of films pass. bechdel.io</p></div>`),
	'public/og.jpg',
);

// GitHub's repo social preview is 1280x640 and has no API: upload this one by
// hand in the repo's Settings > General > Social preview
await tab.setViewportSize({ width: 1280, height: 640 });
await tab.setContent(
	page(`<div class="home"><h1>Do two women talk to each other about <span>something other than a man?</span></h1>
	<p>${Math.round((passing / films.length) * 100)}% of films pass. bechdel.io</p></div>`).replace('width: 1200px; height: 630px', 'width: 1280px; height: 640px'),
	{ waitUntil: 'load' },
);
await tab.evaluate(() => document.fonts.ready);
await tab.screenshot({ path: new URL('../docs/github-social-preview.png', root).pathname });
await tab.setViewportSize({ width: 1200, height: 630 });

for (const f of films) {
	const posterPath = `src/assets/films/${f.id}-poster.jpg`;
	const art = existsSync(file(posterPath))
		? `<img class="poster" src="${await dataUrl(posterPath, 'image/jpeg')}">`
		: `<div class="blank"><span>${esc(f.title)}</span></div>`;
	await shoot(
		page(`<div class="card">${art}<div class="text">
		<span class="stamp ${f.bechdel.pass ? 'pass' : 'fail'}">${f.bechdel.pass ? 'Passes' : 'Fails'} the Bechdel test</span>
		<h1 style="font-size:${titleSize(f.title)}px">${esc(f.title)}</h1>
		<p class="score">Bechdel score <b>${f.bechdel.score}</b> / 3</p>
		</div></div><div class="site">bechdel.io</div>`),
		`public/og/${f.slug}.jpg`,
	);
}
await browser.close();
console.log(`Rendered ${films.length + 1} share cards`);
