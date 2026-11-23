const { parseListing, filmTitle, scriptTextFrom } = require('./dailyScript');

describe('dailyScript', () => {
	it('reads titles, years and links from a listing page', () => {
		const html = '<p><a href="scripts/casablanca.pdf">Casablanca</a>&nbsp;&nbsp;&nbsp;by Julius Epstein&nbsp;&nbsp;&nbsp;1942<br>'
			+ '<p><a href="scripts/Mystery+Men.txt">Mystery Men</a>&nbsp;&nbsp;&nbsp;by Neil Cuthbert<br>';
		expect(parseListing(html)).toEqual([
			{ title: 'Casablanca', year: '1942', url: 'https://www.dailyscript.com/scripts/casablanca.pdf' },
			{ title: 'Mystery Men', year: null, url: 'https://www.dailyscript.com/scripts/Mystery+Men.txt' },
		]);
		// An escaped entity stays as written: decoded once, not twice
		expect(parseListing('<a href="scripts/x.txt">Tom &amp;quot;&amp; Jerry&#39;s</a>')[0].title).toBe('Tom &quot;& Jerry\'s');
	});

	it('takes the released title over a working title, and drops asides', () => {
		expect(filmTitle('American Bullshit (filmed as American Hustle)')).toBe('American Hustle');
		expect(filmTitle('Arac Attack (Released as Eight Legged Freaks)')).toBe('Eight Legged Freaks');
		expect(filmTitle('8 Mile (aka Untitled Detroit Project)')).toBe('8 Mile');
		expect(filmTitle('Conquest of Paradise: 1492')).toBe('Conquest of Paradise: 1492');
		expect(filmTitle('1492: Conquest of Paradise:')).toBe('1492: Conquest of Paradise');
		expect(filmTitle('Shining, The')).toBe('The Shining');
	});

	it('reads text and HTML scripts, and skips formats it cannot read', async () => {
		const bytes = text => Buffer.from(text, 'latin1');
		expect(await scriptTextFrom('https://x/scripts/a.txt', bytes('RICK\nHere\'s looking at you.'))).toBe('RICK\nHere\'s looking at you.');
		expect(await scriptTextFrom('https://x/scripts/a.html', bytes('<pre>  RICK\n  Hello.</pre>'))).toBe('RICK\n  Hello.\n');
		expect(await scriptTextFrom('https://x/scripts/a.doc', bytes('x'))).toBeNull();
		// A page without <pre>, at a link with no extension
		expect(await scriptTextFrom('https://x/script', bytes('<html><body><p>RICK<br>Here&#39;s looking at you.</p></body></html>'))).toBe('RICK\nHere\'s looking at you.\n');
	});
});
