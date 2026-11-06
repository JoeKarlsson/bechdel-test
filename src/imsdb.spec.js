const { scriptFileName, parseScriptIndex, parseScriptPageUrl, parseScriptText } = require('./imsdb');

describe('imsdb', () => {
	it('names files like the existing scripts', () => {
		expect(scriptFileName('Abyss, The')).toBe('the-abyss.txt');
		expect(scriptFileName('Star Wars: A New Hope')).toBe('star-wars-a-new-hope.txt');
		expect(scriptFileName("Schindler's List")).toBe('schindlers-list.txt');
		expect(scriptFileName('Harold & Kumar')).toBe('harold-and-kumar.txt');
	});

	it('reads the movie list and the script link', () => {
		const index = '<p><a href="/Movie Scripts/Abyss, The Script.html" title="Abyss, The Script">Abyss, The</a> (1988)';
		expect(parseScriptIndex(index)).toEqual([
			{ title: 'Abyss, The', moviePageUrl: 'https://imsdb.com/Movie%20Scripts/Abyss,%20The%20Script.html' },
		]);
		expect(parseScriptPageUrl('<a href="/scripts/Alien-vs.-Predator.html">Read</a>'))
			.toBe('https://imsdb.com/scripts/Alien-vs.-Predator.html');
		expect(parseScriptPageUrl('<p>No script</p>')).toBeNull();
	});

	it('takes the screenplay out of the <pre> block', () => {
		const html = '<td><pre><script>\n<b><!--\n</b>if (window!= top)\n</script><b>INT. HOUSE - DAY</b>\r\n\r\nTom &amp; Jerry run.</pre></td>';
		expect(parseScriptText(html)).toBe('INT. HOUSE - DAY\n\nTom & Jerry run.\n');
		expect(parseScriptText('<p>nothing</p>')).toBeNull();
		expect(parseScriptText('<script><pre>if (window!= top)\n</script>Platoon</pre>')).toBe('Platoon\n');
	});

	it('reads pages that break lines with <br> instead of <pre>', () => {
		const html = '<td class="scrtext">\r\n\r\n<br><b> INT. BAR -- DAY\r\n<br></b>\r\n<br> Monty drinks.\r\n<br><table width="85%" border="0">Writers';
		expect(parseScriptText(html)).toBe('INT. BAR -- DAY\n\n Monty drinks.\n');
	});

	it('escapes a ? in a movie title', () => {
		const index = '<a href="/Movie Scripts/What About Bob? Script.html" title="x">What About Bob?</a>';
		expect(parseScriptIndex(index)[0].moviePageUrl).toBe('https://imsdb.com/Movie%20Scripts/What%20About%20Bob%3F%20Script.html');
	});
});
