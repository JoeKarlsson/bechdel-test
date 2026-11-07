import type { APIRoute } from 'astro';
import { loadFilms } from '../lib/films.mjs';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);

// New films first, one item per film, so readers hear when one is added
export const GET: APIRoute = ({ site }) => {
	const films = [...loadFilms()].sort((a, b) => (b.added ?? '').localeCompare(a.added ?? ''));
	const items = films
		.map((f) => {
			const url = new URL(`/films/${f.slug}/`, site).href;
			const verdict = `${f.bechdel.pass ? 'Passes' : 'Fails'} the Bechdel test with a score of ${f.bechdel.score} out of 3.`;
			return `    <item>
      <title>${esc(`${f.title} (${f.year})`)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      ${f.added ? `<pubDate>${new Date(f.added).toUTCString()}</pubDate>` : ''}
      <description>${esc(verdict)}</description>
    </item>`;
		})
		.join('\n');
	const newest = films.find((f) => f.added)?.added;
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>bechdel.io</title>
    <link>${new URL('/', site).href}</link>
    <atom:link href="${new URL('/rss.xml', site).href}" rel="self" type="application/rss+xml" />
    <description>Films checked against the Bechdel test, newest first.</description>
    <image>
      <url>${new URL('/icon-144.png', site).href}</url>
      <title>bechdel.io</title>
      <link>${new URL('/', site).href}</link>
      <width>144</width>
      <height>144</height>
    </image>
    <language>en</language>
    ${newest ? `<lastBuildDate>${new Date(newest).toUTCString()}</lastBuildDate>` : ''}
${items}
  </channel>
</rss>
`;
	return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml' } });
};
