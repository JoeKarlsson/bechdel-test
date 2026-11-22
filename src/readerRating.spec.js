const fs = require('fs');
const os = require('os');
const path = require('path');
const { updateFilmRatings } = require('./readerRating');

describe('readerRating', () => {
	it('gives a film its newer reader rating and leaves the rest alone', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'films-'));
		const write = (name, film) => fs.writeFileSync(path.join(dir, name), JSON.stringify(film));
		const read = name => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
		write('stale.json', { idIMDB: 'tt1', title: 'Stale' });
		write('current.json', { idIMDB: 'tt2', bechdelData: { rating: 3, dubious: 0, id: 7 } });
		write('unrated.json', { idIMDB: 'tt3' });
		const ratings = {
			tt1: { rating: 1, dubious: true, url: 'https://bechdeltest.com/view/5975/stale/' },
			tt2: { rating: 3, dubious: false, url: 'https://bechdeltest.com/view/7/current/' },
		};

		expect(updateFilmRatings(dir, ratings)).toBe(1);
		expect(read('stale.json')).toEqual({ idIMDB: 'tt1', title: 'Stale', bechdelData: { rating: 1, dubious: 1, id: 5975 } });
		expect(read('unrated.json')).toEqual({ idIMDB: 'tt3' });
		fs.rmSync(dir, { recursive: true });
	});
});
