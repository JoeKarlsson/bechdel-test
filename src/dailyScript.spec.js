const { parseListing, scriptTextFrom } = require('./dailyScript');

describe('dailyScript', () => {
	it('reads titles, years and links from a listing page', () => {
		const html = '<p><a href="scripts/casablanca.pdf">Casablanca</a>&nbsp;&nbsp;&nbsp;by Julius Epstein&nbsp;&nbsp;&nbsp;1942<br>'
			+ '<p><a href="scripts/Mystery+Men.txt">Mystery Men</a>&nbsp;&nbsp;&nbsp;by Neil Cuthbert<br>';
		expect(parseListing(html)).toEqual([
			{ title: 'Casablanca', year: '1942', url: 'https://www.dailyscript.com/scripts/casablanca.pdf' },
			{ title: 'Mystery Men', year: null, url: 'https://www.dailyscript.com/scripts/Mystery+Men.txt' },
		]);
	});

	it('reads text and HTML scripts, and skips formats it cannot read', async () => {
		const bytes = text => Buffer.from(text, 'latin1');
		expect(await scriptTextFrom('https://x/scripts/a.txt', bytes('RICK\nHere\'s looking at you.'))).toBe('RICK\nHere\'s looking at you.');
		expect(await scriptTextFrom('https://x/scripts/a.html', bytes('<pre>  RICK\n  Hello.</pre>'))).toBe('RICK\n  Hello.\n');
		expect(await scriptTextFrom('https://x/scripts/a.doc', bytes('x'))).toBeNull();
	});
});
