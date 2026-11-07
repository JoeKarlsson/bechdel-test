const { layoutFromTsv } = require('./pdfText');

describe('pdfText', () => {
	it('keeps an OCRed cue indented where it sits on the page', () => {
		// 850 pixels wide = 10 pixels a column; level 5 rows are words
		const tsv = [
			'level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\tleft\ttop\twidth\theight\tconf\ttext',
			'5\t1\t1\t1\t1\t1\t370\t0\t50\t10\t96\tDOTTIE',
			'5\t1\t1\t2\t1\t1\t250\t20\t40\t10\t95\tWell,',
			'5\t1\t1\t2\t1\t2\t310\t20\t10\t10\t95\tI',
			'4\t1\t1\t2\t1\t0\t250\t20\t70\t10\t-1\t',
		].join('\n');
		expect(layoutFromTsv(tsv, 850)).toBe(`${' '.repeat(37)}DOTTIE\n${' '.repeat(25)}Well, I`);
	});
});
