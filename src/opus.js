// Subtitles from the OPUS OpenSubtitles corpus (Lison & Tiedemann 2016):
// opensubtitles.org's subtitles as one zip per language, each subtitle an XML
// file of timed sentences under en/<year>/<IMDb number>[_...]/<subtitle id>.xml.
// The English zip is 36 GB, so nothing downloads it: HTTP range requests read
// its central directory once (the index of every member, ~230 MB) and then
// each wanted member's own bytes.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OPUS_EN_URL = 'https://object.pouta.csc.fi/OPUS-OpenSubtitles/v2024/raw/en.zip';
const INDEX_DIR = path.resolve(__dirname, '../.cache/opus');

const fetchRange = async (url, start, end) => {
	const response = await fetch(url, { headers: { Range: `bytes=${start}-${end}` } });
	if (response.status !== 206) throw new Error(`HTTP ${response.status} for a range of ${url}`);
	return Buffer.from(await response.arrayBuffer());
};

const contentLength = async url => {
	const response = await fetch(url, { method: 'HEAD' });
	if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
	return Number(response.headers.get('content-length'));
};

const EOCD = 0x06054b50;
const ZIP64_LOCATOR = 0x07064b50;
const ZIP64_EOCD = 0x06064b50;
const CENTRAL_ENTRY = 0x02014b50;
const LOCAL_HEADER = 0x04034b50;

/** Where the central directory is ({offset, size}), from the zip's last bytes */
const centralDirectoryLocation = (tail, tailStart) => {
	const at = tail.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
	if (at < 0 || tail.readUInt32LE(at) !== EOCD) throw new Error('no end-of-central-directory record');
	const locator = at - 20;
	if (locator >= 0 && tail.readUInt32LE(locator) === ZIP64_LOCATOR) {
		const zip64At = Number(tail.readBigUInt64LE(locator + 8)) - tailStart;
		if (zip64At < 0 || tail.readUInt32LE(zip64At) !== ZIP64_EOCD) throw new Error('zip64 record outside the tail read');
		return { size: Number(tail.readBigUInt64LE(zip64At + 40)), offset: Number(tail.readBigUInt64LE(zip64At + 48)) };
	}
	return { size: tail.readUInt32LE(at + 12), offset: tail.readUInt32LE(at + 16) };
};

/**
 * The members of a central directory whose name passes `keep`, with what
 * fetchMember needs. Sizes and offsets over 4 GB sit in the zip64 extra field.
 */
const parseCentralDirectory = (cd, keep) => {
	const members = [];
	let at = 0;
	while (at + 46 <= cd.length && cd.readUInt32LE(at) === CENTRAL_ENTRY) {
		const method = cd.readUInt16LE(at + 10);
		let compressedSize = cd.readUInt32LE(at + 20);
		let size = cd.readUInt32LE(at + 24);
		const nameLength = cd.readUInt16LE(at + 28);
		const extraLength = cd.readUInt16LE(at + 30);
		const commentLength = cd.readUInt16LE(at + 32);
		let offset = cd.readUInt32LE(at + 42);
		const name = cd.toString('utf8', at + 46, at + 46 + nameLength);
		if (keep(name)) {
			// zip64 extra: only the fields whose 32-bit value is 0xFFFFFFFF, in this order
			let extra = at + 46 + nameLength;
			const extraEnd = extra + extraLength;
			while (extra + 4 <= extraEnd) {
				const id = cd.readUInt16LE(extra);
				const length = cd.readUInt16LE(extra + 2);
				if (id === 0x0001) {
					let field = extra + 4;
					if (size === 0xffffffff) { size = Number(cd.readBigUInt64LE(field)); field += 8; }
					if (compressedSize === 0xffffffff) { compressedSize = Number(cd.readBigUInt64LE(field)); field += 8; }
					if (offset === 0xffffffff) offset = Number(cd.readBigUInt64LE(field));
				}
				extra += 4 + length;
			}
			members.push({ name, method, compressedSize, size, offset });
		}
		at += 46 + nameLength + extraLength + commentLength;
	}
	return members;
};

/** "OpenSubtitles/raw/en/1976/75314/1958752574.xml" -> "tt0075314" (null for folders and INFO) */
const imdbIdOfMember = name => {
	const parts = name.split('/');
	if (parts.length !== 6 || !parts[5].endsWith('.xml')) return null;
	const number = parts[4].split('_')[0];
	return /^\d+$/.test(number) ? `tt${number.padStart(7, '0')}` : null;
};

/**
 * The corpus members for these films, grouped by IMDb id. Read from the zip
 * once and cached in .cache/opus/ (delete it to re-read).
 */
const loadOpusIndex = async (imdbIds, url = OPUS_EN_URL) => {
	const cacheFile = path.join(INDEX_DIR, `${url.split('/').slice(-3).join('-')}.json`);
	let cached = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, 'utf8')) : null;
	const wanted = new Set(imdbIds);
	const missing = cached ? [...wanted].filter(id => !cached.checked.includes(id)) : [...wanted];
	if (missing.length > 0) {
		const total = await contentLength(url);
		const tailStart = Math.max(0, total - 128 * 1024);
		const location = centralDirectoryLocation(await fetchRange(url, tailStart, total - 1), tailStart);
		const cd = await fetchRange(url, location.offset, location.offset + location.size - 1);
		const all = cached ? new Set([...cached.checked, ...missing]) : wanted;
		const byFilm = {};
		for (const member of parseCentralDirectory(cd, name => all.has(imdbIdOfMember(name)))) {
			(byFilm[imdbIdOfMember(member.name)] ??= []).push(member);
		}
		cached = { url, size: total, checked: [...all].sort(), films: byFilm };
		fs.mkdirSync(INDEX_DIR, { recursive: true });
		fs.writeFileSync(cacheFile, JSON.stringify(cached));
	}
	return Object.fromEntries([...wanted].map(id => [id, cached.films[id] ?? []]));
};

// A local header's name and extra field are short; this covers both in the same request
const LOCAL_HEADER_ALLOWANCE = 30 + 1024;

/** One member's bytes, uncompressed */
const fetchMember = async (member, url = OPUS_EN_URL) => {
	const bytes = await fetchRange(url, member.offset, member.offset + LOCAL_HEADER_ALLOWANCE + member.compressedSize);
	if (bytes.readUInt32LE(0) !== LOCAL_HEADER) throw new Error(`no local header at ${member.name}`);
	const dataStart = 30 + bytes.readUInt16LE(26) + bytes.readUInt16LE(28);
	const data = bytes.subarray(dataStart, dataStart + member.compressedSize);
	if (member.method === 0) return data;
	if (member.method === 8) return zlib.inflateRawSync(data);
	throw new Error(`compression method ${member.method} in ${member.name}`);
};

// "00:05:14,106" and the corpus's unpadded "01:33:3,242", in seconds
const toSeconds = value => {
	const match = value.match(/^(\d+):(\d+):(\d+)[,.](\d+)$/);
	if (!match) return null;
	const [, h, m, s, ms] = match;
	return Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(`0.${ms}`);
};

const decodeXml = text => text
	.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
	.replace(/&amp;/g, '&');

/**
 * A corpus subtitle as timed sentences plus its metadata. A sentence's time
 * is the cue it starts in (start) to the cue it ends in (end); sentences
 * inside one cue share that cue's times.
 * @returns {{sentences: Array<{start: number|null, end: number|null, text: string}>, meta: object}}
 */
const parseOpusXml = xml => {
	const metaAt = xml.indexOf('<meta>');
	const body = metaAt >= 0 ? xml.slice(0, metaAt) : xml;
	const sentences = [];
	let cueStart = null;
	let current = null;
	const pendingEnd = [];
	for (const token of body.match(/<s\b[^>]*>|<\/s>|<time\b[^>]*\/>|[^<]+/g) ?? []) {
		if (token.startsWith('<s')) {
			current = { start: cueStart, end: null, text: '' };
		} else if (token === '</s>') {
			if (current) {
				current.text = decodeXml(current.text.replace(/\s+/g, ' ').trim());
				sentences.push(current);
				// a sentence whose cue ended inside it already has its end
				if (current.end === null) pendingEnd.push(current);
			}
			current = null;
		} else if (token.startsWith('<time')) {
			const id = token.match(/id="T\d+([SE])"/)?.[1];
			const seconds = toSeconds(token.match(/value="([^"]+)"/)?.[1] ?? '');
			if (id === 'S') {
				cueStart = seconds;
				if (current && !current.text.trim()) current.start = seconds;
			} else if (id === 'E') {
				if (current) pendingEnd.push(current);
				for (const sentence of pendingEnd) sentence.end = seconds;
				pendingEnd.length = 0;
			}
		} else if (current) {
			current.text += token;
		}
	}
	const field = (name, scope) => {
		const block = metaAt >= 0 ? xml.slice(metaAt).match(new RegExp(`<${scope}>([\\s\\S]*?)</${scope}>`))?.[1] : null;
		return block?.match(new RegExp(`<${name}>([^<]*)</${name}>`))?.[1]?.trim() ?? null;
	};
	const number = value => (value === null || value === '' ? null : Number(value));
	return {
		sentences: sentences.filter(s => s.text),
		meta: {
			runtimeMinutes: number(field('duration', 'source')),
			cds: field('cds', 'source'),
			machineTranslated: field('machine_translated', 'subtitle') === '1',
			languageConfidence: number(field('confidence', 'subtitle')),
			uploaded: field('date', 'subtitle'),
			rating: number(field('rating', 'subtitle')),
			lastCue: toSeconds(field('duration', 'subtitle') ?? ''),
			blocks: number(field('blocks', 'subtitle')),
		},
	};
};

module.exports = {
	OPUS_EN_URL, loadOpusIndex, fetchMember, parseOpusXml, parseCentralDirectory, centralDirectoryLocation, imdbIdOfMember,
	toSeconds,
};
