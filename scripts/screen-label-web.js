#!/usr/bin/env node
/**
 * Label exported page-vs-screen items in the browser instead of the terminal.
 * Reads a folder written by `npm run screen:label -- --export <dir>` and saves
 * each answer to <dir>/labels.json as you go; import that file with
 * `npm run screen:label -- --import <dir>/labels.json` plus the flag the folder
 * was exported with (--again, --check, --audio or --verdicts). Serves on this machine only: the
 * folder holds script and subtitle text.
 *
 *   npm run screen:label-web -- <dir>
 */
const fs = require('fs');
const http = require('http');
const path = require('path');

const dir = process.argv[2];
if (!dir || !fs.existsSync(dir)) {
	console.error('usage: npm run screen:label-web -- <folder from screen:label --export>');
	process.exit(1);
}
const LABELS_FILE = path.join(dir, 'labels.json');
const PORT = Number(process.env.PORT ?? 4747); // PORT=4748 runs a second check alongside

const films = fs.readdirSync(dir).filter(f => f.endsWith('-items.json')).sort().map(f => {
	const prefix = f.replace(/-items\.json$/, '');
	const { film, items } = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
	const read = kind => fs.readFileSync(path.join(dir, `${prefix}-${kind}.txt`), 'utf8').split('\n').filter(Boolean);
	return { film, items, script: read('script'), subtitles: read('subtitles') };
});
const labels = fs.existsSync(LABELS_FILE) ? JSON.parse(fs.readFileSync(LABELS_FILE, 'utf8')) : {};
const clipFile = key => path.join(dir, 'clips', `${key.replaceAll(':', '_')}.opus`);
// audio lines wait until their clip is cut (a film still downloading); restart to pick up new clips
const items = films.flatMap((f, filmIndex) => f.items.map(item => ({ ...item, film: f.film, filmIndex })))
	.filter(item => item.kind !== 'audio' || fs.existsSync(clipFile(item.key)));
const allowed = {
	'script line': ['kept', 'changed', 'cut', 'unsure'],
	'subtitle line': ['scripted', 'not in script', 'unsure'],
	audio: ['subtitles trimmed', 'really changed', 'really cut', 'unsure'],
	verdict: ['passes on screen', 'fails on screen', 'unsure'],
};

const PAGE = fs.readFileSync(path.join(__dirname, 'screen-label-web.html'), 'utf8');

const send = (res, status, body, type = 'application/json') => {
	res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
	res.end(typeof body === 'string' ? body : JSON.stringify(body));
};

http.createServer((req, res) => {
	if (req.method === 'GET' && req.url === '/') return send(res, 200, PAGE, 'text/html; charset=utf-8');
	// audio check: <dir>/clips/<item key with : as _>.opus, cut from the film around the line
	const clip = req.method === 'GET' && req.url.match(/^\/clips\/(tt\d+_[a-z]+_\d+\.opus)$/);
	if (clip) {
		const file = path.join(dir, 'clips', clip[1]);
		if (!fs.existsSync(file)) return send(res, 404, { error: 'no clip yet' });
		// byte ranges: the browser reads the end of an Ogg file for its length, and seeks with them
		const body = fs.readFileSync(file);
		const range = (req.headers.range ?? '').match(/^bytes=(\d*)-(\d*)$/);
		const from = range?.[1] ? Number(range[1]) : range?.[2] ? body.length - Number(range[2]) : 0;
		const to = range?.[1] && range[2] ? Math.min(Number(range[2]), body.length - 1) : body.length - 1;
		const headers = { 'content-type': 'audio/ogg', 'accept-ranges': 'bytes', 'content-length': to - from + 1, 'cache-control': 'no-store' };
		if (range) headers['content-range'] = `bytes ${from}-${to}/${body.length}`;
		res.writeHead(range ? 206 : 200, headers);
		return res.end(body.subarray(from, to + 1));
	}
	if (req.method === 'GET' && req.url === '/data') return send(res, 200, { items, labels, films: films.map(f => ({ script: f.script, subtitles: f.subtitles })) });
	if (req.method === 'POST' && req.url === '/label') {
		let body = '';
		req.on('data', chunk => { body += chunk; });
		req.on('end', () => {
			const { key, label } = JSON.parse(body);
			const item = items.find(i => i.key === key);
			if (!item) return send(res, 400, { error: `${key} isn't an exported item` });
			if (label === null) delete labels[key];
			else if (!allowed[item.kind].includes(label)) return send(res, 400, { error: `"${label}" isn't a label for a ${item.kind}` });
			else labels[key] = label;
			fs.writeFileSync(LABELS_FILE, `${JSON.stringify(labels, null, '\t')}\n`);
			return send(res, 200, { done: Object.keys(labels).length, of: items.length });
		});
		return undefined;
	}
	return send(res, 404, { error: 'not found' });
}).listen(PORT, '127.0.0.1', () => {
	console.log(`${items.length} items, ${Object.keys(labels).length} labelled. Open http://localhost:${PORT}`);
});
