const getFullCastData = require('./getFullCastData');
const fetchMock = require('fetch-mock');
const filmData = require('./FilmData.js');
const meta = require('../../helper/meta');
const mockFullData = require('./__mocks__/mock-full-data.json');

describe('getFullCastData', () => {
	beforeEach(() => {
		fetchMock.reset();
		filmData.clear();
	});

	it('should call callback after success', () => {
		const idIMDB = 'tt1800241';
		const URL =
			'http://www.myapifilms.com/' +
			`imdb/idIMDB?idIMDB=${idIMDB}&` +
			`token=${meta.MYAPIFILMS}&` +
			'format=json&' +
			'language=en-us&' +
			'aka=0&' +
			'business=0&' +
			'seasons=0&' +
			'seasonYear=0&' +
			'technical=0&' +
			'trailers=1&' +
			'movieTrivia=0&' +
			'awards=0&' +
			'moviePhotos=0&' +
			'movieVideos=0&' +
			'actors=1&' +
			'biography=1&' +
			'actorActress=1&' +
			'similarMovies=0&' +
			'goofs=0&' +
			'keyword=0&' +
			'quotes=0&' +
			'fullSize=0&' +
			'companyCredits=0&' +
			'filmingLocations=0';

		fetchMock.mock(URL, mockFullData);

		getFullCastData(idIMDB).then(body => {
			expect(body).toMatchObject(mockFullData);
			expect(filmData.metaData).toMatchObject([mockFullData]);
		});
	});
});
