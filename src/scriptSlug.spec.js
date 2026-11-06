const { parseSitemap, parseScriptPage, scriptFileName } = require('./scriptSlug');

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

	it('skips TV episodes and films with no IMDb id', () => {
		const pdf = { contentUrl: 'https://assets.scriptslug.com/x.pdf' };
		expect(parseScriptPage(pageWith([{ '@type': 'CreativeWork', about: { '@type': 'TVEpisode', sameAs: ['https://www.imdb.com/title/tt4158110/'] }, encoding: pdf }]))).toBeNull();
		expect(parseScriptPage(pageWith([{ '@type': 'CreativeWork', about: { '@type': 'Movie', name: 'X', sameAs: [] }, encoding: pdf }]))).toBeNull();
	});
});
