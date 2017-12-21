// const nock = require('nock');
const getFilmImages = require('./getFilmImages');
const fetchMock = require('fetch-mock');
const meta = require('../../helper/meta');
const mockImagesData = require('./__mocks__/mock-images-data.json');

describe('getFilmImages', () => {
	beforeEach(() => {
		fetchMock.reset();
	});

	it('should call callback after success', () => {
		const ID = 'tt1065073';
		const hostname = `https://api.themoviedb.org/3/movie/${ID}/images?`;
		const path = `api_key=${
			meta.THEMOVIEDB
		}&language=en&include_image_language=en,null`;

		fetchMock.mock(hostname + path, mockImagesData);

		getFilmImages('tt1065073').then(body => {
			expect(body).toMatchObject(mockImagesData);
		});
	});
});
