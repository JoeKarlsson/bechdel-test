const { exactTitleMatch, isSameRelease } = require('./fetchMetadata');

describe('exactTitleMatch', () => {
	it('matches a file-name title despite punctuation, or by original title, and nothing looser', () => {
		const results = [
			{ id: 1, title: 'Breakfast at Tiffany\'s: A Retrospective', original_title: 'x' },
			{ id: 2, title: 'Breakfast at Tiffany\'s', original_title: 'Breakfast at Tiffany\'s' },
			{ id: 3, title: 'Pan\'s Labyrinth', original_title: 'El laberinto del fauno' },
		];
		expect(exactTitleMatch(results, 'breakfast at tiffanys').id).toBe(2);
		expect(exactTitleMatch(results, 'el laberinto del fauno').id).toBe(3);
		expect(exactTitleMatch(results, 'breakfast')).toBeUndefined();
	});

	it('takes the release a draft year points to, not a remake', () => {
		const results = [
			{ id: 1, title: 'Forbidden Planet', release_date: '2027-01-01' },
			{ id: 2, title: 'Forbidden Planet', release_date: '1956-03-15' },
		];
		expect(exactTitleMatch(results, 'forbidden planet', '1954').id).toBe(2);
		expect(exactTitleMatch(results, 'forbidden planet', '1990')).toBeUndefined();
	});
});

describe('isSameRelease', () => {
	it('takes a copy a year either side, not a remake or a copy with no year', () => {
		expect(isSameRelease('1991', '1992')).toBe(true);
		expect(isSameRelease('1991', '2017')).toBe(false);
		expect(isSameRelease('1991', '')).toBe(false);
		expect(isSameRelease(undefined, '1991')).toBe(false);
	});
});
