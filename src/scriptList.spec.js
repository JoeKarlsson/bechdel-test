const { queueNewTitles } = require('./scriptList');

describe('queueNewTitles', () => {
	it('skips titles we have, keeps the first of two copies, and names files by title and year', () => {
		const scripts = [
			{ title: 'The Big Sleep', year: '1946', url: 'a' },
			{ title: 'Big Sleep', year: '1946', url: 'b' },
			{ title: 'Heat', year: '1995', url: 'c' },
			{ title: 'Cat People', year: null, url: 'd' },
		];
		expect(queueNewTitles(scripts, ['heat.txt', 'deep-cover-1992.txt'])).toEqual([
			{ title: 'The Big Sleep', year: '1946', url: 'a', file: 'the-big-sleep-1946.txt' },
			{ title: 'Cat People', year: null, url: 'd', file: 'cat-people.txt' },
		]);
	});
});
