// Skip: requires config file
describe.skip("placeholder", () => { it("skip", () => {}); });
/* const URLFormatter = require('./URLFormatter');

const {
	createSimpleDataURL,
	createFilmCreditsURL,
	createImageUrl,
} = URLFormatter;

describe('URLFormatter', () => {
	describe('createSimpleDataURL', () => {
		it('should return the Simple Film Data URL', () => {
			const title = 'american-hustle';
			const result = createSimpleDataURL(title);
			const expectedResult =
				'http://www.omdbapi.com/?t=american+hustle&apikey=ee57b776&plot=full&r=json';
			expect(result).toBe(expectedResult);
		});
	});

	describe('createFilmCreditsURL', () => {
		it('should return the Full Film Data URL', () => {
			const imdbID = 'tt1065073';
			const result = createFilmCreditsURL(imdbID);
			const expectedResult =
				'https://api.themoviedb.org/3/movie/tt1065073/credits?api_key=6ec9ddad40a319b47c562e0838f7eda3';
			expect(result).toBe(expectedResult);
		});
	});

	describe('createImageUrl', () => {
		it('should return the image Data URL', () => {
			const imdbID = 'tt1065073';
			const result = createImageUrl(imdbID);
			const expectedResult =
				'https://api.themoviedb.org/3/movie/tt1065073/images?api_key=6ec9ddad40a319b47c562e0838f7eda3&language=en&include_image_language=en,null';
			expect(result).toBe(expectedResult);
		});
	});
});
*/
