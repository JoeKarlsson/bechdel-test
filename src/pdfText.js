/**
 * A screenplay PDF as text: its text layer (poppler's pdftotext), or our own
 * OCR (pdftoppm + tesseract) when the PDF is a scan or its text is garbled.
 */
const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { promisify } = require('util');
const { textQuality } = require('./scriptText');

const execFileAsync = promisify(execFile);

// Below this many characters, a PDF has no text layer worth keeping: it's a scan
const MIN_TEXT_LAYER_CHARACTERS = 20000;
// Below this share of real words the text layer is an old, poor OCR or an
// undecodable font (Casablanca, The Nice Guys), so we OCR the pages ourselves
const MIN_TEXT_LAYER_QUALITY = 0.85;
// A screenplay page is 8.5 inches of 10-character-per-inch Courier
const COLUMNS_PER_PAGE = 85;
const EXEC_OPTIONS = { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 };
const run = async (command, args) => (await execFileAsync(command, args, EXEC_OPTIONS)).stdout;
// Pages OCRed at once: tesseract uses one core per page
const OCR_CONCURRENCY = os.cpus().length;

/**
 * One OCRed page as text, its words placed in the columns they sit in on the
 * page, so a character cue keeps its indent. Takes tesseract's TSV output.
 */
const layoutFromTsv = (tsv, pageWidth) => {
	const charWidth = pageWidth / COLUMNS_PER_PAGE;
	const lines = new Map();
	for (const row of tsv.split('\n').slice(1)) {
		const [level, , block, paragraph, line, , left, , , , confidence, ...text] = row.split('\t');
		const word = text.join('\t').trim();
		if (level !== '5' || !word || Number(confidence) < 0) continue;
		const key = `${block}.${paragraph}.${line}`;
		if (!lines.has(key)) lines.set(key, []);
		lines.get(key).push({ column: Math.round(Number(left) / charWidth), word });
	}
	return [...lines.values()].map(words => words.reduce((text, { column, word }) => {
		const gap = Math.max(text ? 1 : 0, column - text.length);
		return text + ' '.repeat(gap) + word;
	}, '')).join('\n');
};

/** A scanned screenplay PDF as text, by OCR (needs poppler's pdftoppm and tesseract) */
const ocrPdf = async (pdfPath, dir) => {
	await run('pdftoppm', ['-r', '300', '-gray', '-png', pdfPath, path.join(dir, 'page')]);
	const pages = fs.readdirSync(dir).filter(file => file.startsWith('page') && file.endsWith('.png')).sort();
	const texts = new Array(pages.length);
	let next = 0;
	const worker = async () => {
		while (next < pages.length) {
			const index = next++;
			const pagePath = path.join(dir, pages[index]);
			// A PNG's width is the 4 bytes at offset 16, in its IHDR header
			const pageWidth = fs.readFileSync(pagePath).readUInt32BE(16);
			texts[index] = layoutFromTsv(await run('tesseract', [pagePath, '-', '--psm', '4', 'tsv']), pageWidth);
		}
	};
	await Promise.all(Array.from({ length: OCR_CONCURRENCY }, worker));
	return texts.join('\n\n');
};

/**
 * A screenplay PDF as text, its layout kept so the parser sees the indents:
 * the text layer (poppler's pdftotext), or our own OCR when the PDF is a
 * scan or its text layer is garbled, whichever reads better.
 */
const pdfToText = async pdfBytes => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'script-pdf-'));
	try {
		const pdfPath = path.join(dir, 'script.pdf');
		fs.writeFileSync(pdfPath, pdfBytes);
		const text = await run('pdftotext', ['-layout', '-enc', 'UTF-8', pdfPath, '-']);
		const hasTextLayer = text.trim().length >= MIN_TEXT_LAYER_CHARACTERS;
		if (hasTextLayer && textQuality(text) >= MIN_TEXT_LAYER_QUALITY) return text;
		const ocrText = await ocrPdf(pdfPath, dir);
		return !hasTextLayer || textQuality(ocrText) > textQuality(text) ? ocrText : text;
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
};

module.exports = { pdfToText, layoutFromTsv };
