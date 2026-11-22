const { scriptTextOfXml, filmOfRow } = require('./movieSum');

describe('movieSum', () => {
	it('lays out cues and dialogue indented, and untokenizes the action', () => {
		const xml = '<script><scene><scene_description>CONNOR -LRB- mid - twenties -RRB- kneels .</scene_description><character>MONSIGNOR</character><parenthetical>( quietly )</parenthetical><dialogue>Thank you.</dialogue></scene></script>';
		expect(scriptTextOfXml(xml)).toBe(`\nCONNOR (mid-twenties) kneels.\n\n${' '.repeat(20)}MONSIGNOR\n${' '.repeat(15)}(quietly)\n${' '.repeat(10)}Thank you.`);
	});

	it('reads the title and year from the movie name', () => {
		expect(filmOfRow({ movie_name: 'RED_2010', imdb_id: 'tt1245526', script: '' })).toEqual({ title: 'RED', year: '2010', imdbId: 'tt1245526', xml: '' });
	});
});
