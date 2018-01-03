const fetchMock = require('fetch-mock');
const getFilmData = require('./getFilmData.js');
const filmData = require('./FilmData.js');
const URLFormatter = require('./URLFormatter');
const mockGetSimpleCastData = require('./__mocks__/mock-simple-data.json');
const mockGetFullCastData = require('./__mocks__/mock-full-data.json');
const mockImagesData = require('./__mocks__/mock-images-data.json');

const { createSimpleDataURL, createFullDataURL, createImageUrl } = URLFormatter;

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
			const fullURL = createFullDataURL(imdbID);
			const imagesURL = createImageUrl(imdbID);

			fetchMock.mock(simpleURL, mockGetSimpleCastData);
			fetchMock.mock(fullURL, mockGetFullCastData);
			fetchMock.mock(imagesURL, mockImagesData);

			getFilmData(filmTitle).then(body => {
				expect(body).toMatchObject({});
			});
		});
	});
});
