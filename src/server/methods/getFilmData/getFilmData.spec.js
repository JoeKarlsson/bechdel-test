const fetchMock = require('fetch-mock');
const getFilmData = require('./getFilmData.js');
const filmData = require('./FilmData.js');
const meta = require('../../helper/meta');
const mockGetSimpleCastData = require('./__mocks__/mock-simple-data.json');
const mockGetFullCastData = require('./__mocks__/mock-full-data.json');
const mockImagesData = require('./__mocks__/mock-images-data.json');

describe('Film methods', () => {
	beforeEach(() => {
		fetchMock.reset();
		filmData.clear();
	});

	describe('#getData', () => {
		it('should return all the film data as a promise', () => {
			const ID = 'tt1065073';
			const filmTitle = 'BOYHOOD';

			const simpleURL =
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

			const fullURL =
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
				'actors=2&' +
				'biography=1&' +
				'uniqueName=0&' +
				'filmography=0&' +
				'bornAndDead=0&' +
				'starSign=0&' +
				'actorActress=1&' +
				'actorTrivia=0&' +
				'similarMovies=0&' +
				'adultSearch=0';

			const hostnameImages = `https://api.themoviedb.org/3/movie/${ID}/images?`;
			const pathImages = `api_key=${
				meta.THEMOVIEDB
			}&language=en&include_image_language=en,null`;

			fetchMock.mock(hostnameImages + pathImages, mockImagesData);
			fetchMock.mock(simpleURL, mockGetSimpleCastData);
			fetchMock.mock(fullURL, mockGetFullCastData);

			getFilmData(filmTitle).then(body => {
				console.log('body', body);
				expect(body).toMatchObject({});
			});
		});
	});
});
