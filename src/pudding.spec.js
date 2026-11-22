const { parseCsv, parseSources } = require('./pudding');

describe('pudding', () => {
	it('parses quoted CSV fields with commas, quotes and CRLF line ends', () => {
		expect(parseCsv('a,"b, c","say ""hi"""\r\n1,2,3')).toEqual([['a', 'b, c', 'say "hi"'], ['1', '2', '3']]);
	});

	it('keeps films we lack that have a web link, and leaves out leaked scripts', () => {
		const csv = [
			'imdb_id,script_id,title,year,gross (inflation-adjusted),link',
			'tt0000001,1,Have It,1990,,http://www.imsdb.com/a.html',
			'tt0000002,2,Archive Only,1991,,"film_2010/Archive,-The.html"',
			'tt0000003,3,Leaked,2014,,https://wikileaks.org/sony/x.pdf',
			'tt0000004,4,"Grand Hotel, The",1932,,http://www.imsdb.com/Movie Scripts/Grand Hotel Script.html',
			'tt0000005,5,Shared,1997,,https://www.dropbox.com/sh/x/LIFE.pdf?dl=0',
		].join('\n');
		expect(parseSources(csv, new Set(['tt0000001']))).toEqual([
			{ imdbId: 'tt0000004', title: 'Grand Hotel, The', year: '1932', url: 'http://www.imsdb.com/Movie%20Scripts/Grand%20Hotel%20Script.html' },
			{ imdbId: 'tt0000005', title: 'Shared', year: '1997', url: 'https://www.dropbox.com/sh/x/LIFE.pdf?dl=1' },
		]);
	});
});
