const fetchMock = require('fetch-mock');
const getFilmData = require('./getFilmData.js');
const filmData = require('./FilmData.js');
const URLFormatter = require('./URLFormatter');
const mockGetSimpleCastData = require('./__mocks__/mock-simple-data.json');
const mockGetFullCastData = require('./__mocks__/mock-full-cast-data.json');
const mockImagesData = require('./__mocks__/mock-images-data.json');
const mockBechdelData = require('./__mocks__/mock-bechdel-data.json');

const {
	createSimpleDataURL,
	createFilmCreditsURL,
	createImageUrl,
	createBechdelUrl,
} = URLFormatter;

describe('Film methods', () => {
	beforeEach(() => {
		fetchMock.reset();
		filmData.clear();
	});

	describe('#getData', () => {
		it('should return all the film data as a promise', () => {
			const filmTitle = 'BOYHOOD';
			const imdbID = 'tt1065073';

			const simpleURL = createSimpleDataURL(filmTitle);
			const fullURL = createFilmCreditsURL(imdbID);
			const imagesURL = createImageUrl(imdbID);
			const bechdelURL = createBechdelUrl(imdbID);

			fetchMock.mock(simpleURL, mockGetSimpleCastData);
			fetchMock.mock(fullURL, mockGetFullCastData);
			fetchMock.mock(imagesURL, mockImagesData);
			fetchMock.mock(bechdelURL, mockBechdelData);

			getFilmData(filmTitle)
				.then(body => {
					expect(body).toMatchObject({});
				})
				.catch(error => {
					throw new Error(error);
				});
		});
	});
});
