const { bookendLines, quoteOf } = require('./bookends');

const speakers = [
	{ name: 'AMY', lines: 40, gender: 'w' },
	{ name: 'NICK', lines: 30, gender: 'm' },
	{ name: 'NARRATOR', lines: 4, gender: null },
	{ name: 'GONE GIRL', lines: 1, gender: 'w' },
	{ name: 'WRITTEN BY', lines: 1, gender: null },
	{ name: 'B.S. KING SONG', lines: 2, gender: 'm' },
];
const names = new Set(['AMY', 'NICK']);
const line = (speaker, text) => ({ speaker, text });
const filler = n => Array.from({ length: n }, () => line('NICK', 'Middle of the film.'));

describe('bookendLines', () => {
	it('skips title pages and songs, keeps a narrator with no known gender', () => {
		const dialogue = [
			line('WRITTEN BY', 'Gillian Flynn'),
			line('GONE GIRL', 'August 29, 2013'),
			line('NARRATOR', 'When I think of my wife.'),
			...filler(20),
			line('AMY', 'What are you thinking? Nick turns and stares. FADE TO BLACK.'),
			line('B.S. KING SONG', "I've been around, I've seen some things"),
		];
		const { first, last } = bookendLines(dialogue, speakers);
		expect(first).toEqual({ speaker: 2, line: 3, text: 'When I think of my wife.' });
		expect(last).toEqual({ speaker: 0, line: 24, text: 'What are you thinking?' });
	});

	it('gives null when nothing near an end is clearly a character speaking', () => {
		const dialogue = [...Array.from({ length: 30 }, () => line('WRITTEN BY', 'Gillian Flynn')), ...filler(200)];
		expect(bookendLines(dialogue, speakers).first).toBeNull();
		expect(bookendLines(dialogue, speakers).last).not.toBeNull();
	});
});

describe('quoteOf', () => {
	it('trims stage directions run into the line, and drops lines that are only direction', () => {
		expect(quoteOf('Yes. NICK I\'ll keep my eye on you.', names)).toBe('Yes.');
		expect(quoteOf('I do. They kiss in the rain.', names)).toBe('I do.');
		expect(quoteOf('Home. The CAMERA CRANES UP.', names)).toBe('Home.');
		expect(quoteOf('We follow Elizabeth into the house.', names)).toBe('');
	});

	it('keeps a shouted line and shortens a long one at a sentence', () => {
		expect(quoteOf('Freeze! FBI!', names)).toBe('Freeze! FBI!');
		// Three 100-character sentences: the third would pass 280
		const long = `${'Word '.repeat(20).trim()}. ${'More '.repeat(20).trim()}. ${'Last '.repeat(20).trim()}.`;
		expect(quoteOf(long, names)).toBe(`${'Word '.repeat(20).trim()}. ${'More '.repeat(20).trim()}.`);
	});
});
