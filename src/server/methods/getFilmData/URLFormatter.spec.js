const URLFormatter = require('./URLFormatter');

const { createSimpleDataURL, createFullDataURL, createImageUrl } = URLFormatter;

describe('URLFormatter', () => {
	describe('createSimpleDataURL', () => {
		it('should return the Simple Film Data URL', () => {
			const title = 'American Hustle';
			const result = createSimpleDataURL(title);
			const expectedResult =
				'http://api.myapifilms.com/imdb/idIMDB?title=American+Hustle&token=d44147a7-5e6e-4450-92ba-773be44791ce&format=json&language=en-us&aka=0&business=0&seasons=0&seasonYear=0&technical=0&filter=3&exactFilter=0&limit=1&forceYear=0&trailers=0&movieTrivia=0&awards=0&moviePhotos=0&movieVideos=0&actors=1&biography=1&uniqueName=0&filmography=0&bornAndDead=0&starSign=0&actorActress=1&actorTrivia=0&similarMovies=0&adultSearch=0';
			expect(result).toBe(expectedResult);
		});
	});

	describe('createFullDataURL', () => {
		it('should return the Full Film Data URL', () => {
			const imdbID = 'tt1065073';
			const result = createFullDataURL(imdbID);
			const expectedResult =
				'http://www.myapifilms.com/imdb/idIMDB?idIMDB=tt1065073&token=d44147a7-5e6e-4450-92ba-773be44791ce&format=json&language=en-us&aka=0&business=0&seasons=0&seasonYear=0&technical=0&trailers=1&movieTrivia=0&awards=0&moviePhotos=0&movieVideos=0&actors=1&biography=1&actorActress=1&similarMovies=0&goofs=0&keyword=0&quotes=0&fullSize=0&companyCredits=0&filmingLocations=0';
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
