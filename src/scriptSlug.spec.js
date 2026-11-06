const { parseSitemap, parseScriptPage, scriptFileName, layoutFromTsv } = require('./scriptSlug');

const pageWith = graph => `<script type="application/ld+json">${JSON.stringify({ '@graph': graph })}</script>`;

describe('scriptSlug', () => {
	it('lists the script pages in the sitemap', () => {
		expect(parseSitemap('<url><loc>https://www.scriptslug.com/script/the-matrix-1999</loc></url>'))
			.toEqual(['https://www.scriptslug.com/script/the-matrix-1999']);
		expect(scriptFileName('https://www.scriptslug.com/script/the-matrix-1999')).toBe('the-matrix-1999.txt');
	});

	it('reads the film, its IMDb id and the PDF from the page', () => {
		const html = pageWith([{
			'@type': 'CreativeWork',
			about: { '@type': 'Movie', name: 'The Matrix', dateCreated: '1999', sameAs: ['https://www.imdb.com/title/tt0133093/', 'https://www.themoviedb.org/movie/603'] },
			encoding: { '@type': 'MediaObject', contentUrl: 'https://assets.scriptslug.com/live/pdf/scripts/the-matrix-1999.pdf' },
		}]);
		expect(parseScriptPage(html)).toEqual({
			title: 'The Matrix', year: '1999', imdbId: 'tt0133093', pdfUrl: 'https://assets.scriptslug.com/live/pdf/scripts/the-matrix-1999.pdf',
		});
	});

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

	it('skips TV episodes and films with no IMDb id', () => {
		const pdf = { contentUrl: 'https://assets.scriptslug.com/x.pdf' };
		expect(parseScriptPage(pageWith([{ '@type': 'CreativeWork', about: { '@type': 'TVEpisode', sameAs: ['https://www.imdb.com/title/tt4158110/'] }, encoding: pdf }]))).toBeNull();
		expect(parseScriptPage(pageWith([{ '@type': 'CreativeWork', about: { '@type': 'Movie', name: 'X', sameAs: [] }, encoding: pdf }]))).toBeNull();
	});
});
