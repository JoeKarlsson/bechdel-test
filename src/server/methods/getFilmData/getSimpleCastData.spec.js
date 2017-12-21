const getSimpleCastData = require('./getSimpleCastData');
const fetchMock = require('fetch-mock');
const filmData = require('./FilmData.js');
const meta = require('../../helper/meta');
const mockSimpleData = require('./__mocks__/mock-simple-data.json');

describe('getSimpleCastData', () => {
	beforeEach(() => {
		fetchMock.reset();
		filmData.clear();
	});

	it('should call callback after success', () => {
		const filmTitle = 'BOYHOOD';
		const URL =
			'http://api.myapifilms.com/imdb/idIMDB?' +
			`title=${filmTitle}&` +
			`token=${meta.MYAPIFILMS}&` +
			'format=json&' +
			'language=en-us&' +
			'aka=0&' +
			'business=0&' +
			'seasons=0&' +
			'seasonYear=0&' +
			'technical=0&' +
			'filter=3&' +
			'exactFilter=0&' +
			'limit=1&' +
			'forceYear=0&' +
			'trailers=0&' +
			'movieTrivia=0&' +
			'awards=0&' +
			'moviePhotos=0&' +
			'movieVideos=0&' +
			'actors=1&' +
			'biography=1&' +
			'uniqueName=0&' +
			'filmography=0&' +
			'bornAndDead=0&' +
			'starSign=0&' +
			'actorActress=1&' +
			'actorTrivia=0&' +
			'similarMovies=0&' +
			'adultSearch=0';

		fetchMock.mock(URL, mockSimpleData);

		getSimpleCastData(filmTitle).then(body => {
			expect(body).toMatchObject(mockSimpleData);
		});
	});
});
