const parseData = require('./parseData');

describe('Parse Data', () => {
	describe('#parseActorArr', () => {
		it('should parse Actor Array data', () => {
			const mockActorArr = [
				{
					actorName: 'Joe',
					character: 'Mike Bonchez',
					gender: 'actor',
				},
				{
					actorName: 'Laurel',
					character: 'Wonder Woman',
					gender: 'actress',
				},
			];
			const expectedResult = [
				{
					actorName: 'Joe',
					character: 'Mike Bonchez',
					actorActress: 'actor',
				},
				{
					actorName: 'Laurel',
					character: 'Wonder Woman',
					actorActress: 'actress',
				},
			];
			const result = parseData.parseActorArr(mockActorArr);
			expect(result).toMatchObject(expectedResult);
		});
	});

	describe('#parseImageData', () => {
		it('should parse Image Array data', () => {
			const mockImageObj = {
				backdrops: [{ file_path: '/test-backdrop' }],
				posters: [{ file_path: '/test-poster' }],
			};

			const expectedResult = {
				backdrop: 'https://image.tmdb.org/t/p/original/test-backdrop',
				poster: 'https://image.tmdb.org/t/p/w300/test-poster',
			};
			const result = parseData.parseImageData(mockImageObj);
			expect(result).toMatchObject(expectedResult);
		});
	});
});
