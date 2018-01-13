const getDataFrom = require('./getDataFrom');
const fetchMock = require('fetch-mock');
const URLFormatter = require('./URLFormatter');
const mockSimpleData = require('./__mocks__/mock-simple-data.json');
const mockFullCastData = require('./__mocks__/mock-full-cast-data.json');
const mockImagesData = require('./__mocks__/mock-images-data.json');

const {
	createSimpleDataURL,
	createFilmCreditsURL,
	createImageUrl,
} = URLFormatter;

describe('getDataFrom', () => {
	beforeEach(() => {
		fetchMock.reset();
	});

	it('should return data from simple data endpoint', () => {
		const title = 'American Hustle';
		const simpleURL = createSimpleDataURL(title);

		fetchMock.mock(simpleURL, mockSimpleData);

		getDataFrom(simpleURL).then(body => {
			expect(body).toMatchObject(mockSimpleData);
		});
	});

	it('should return data from cast data endpoint', () => {
		const imdbID = 'tt1065073';
		const castURL = createFilmCreditsURL(imdbID);

		fetchMock.mock(castURL, mockFullCastData);

		getDataFrom(castURL).then(body => {
			expect(body).toMatchObject(mockFullCastData);
		});
	});

	it('should return data from images data endpoint', () => {
		const imdbID = 'tt1065073';
		const imagesURL = createImageUrl(imdbID);

		fetchMock.mock(imagesURL, mockImagesData);

		getDataFrom(imagesURL).then(body => {
			expect(body).toMatchObject(mockImagesData);
		});
	});
});
