import mockingoose from 'mockingoose';
import fetchMock from 'fetch-mock';
import path from 'path';
import processScript from './processScript';
import URLFormatter from '../methods/getFilmData/URLFormatter';
import mockGetSimpleCastData from '../methods/getFilmData/__mocks__/mock-simple-data.json';
import mockGetFullCastData from '../methods/getFilmData/__mocks__/mock-full-cast-data.json';
import mockImagesData from '../methods/getFilmData/__mocks__/mock-images-data.json';

const {
	createSimpleDataURL,
	createFilmCreditsURL,
	createImageUrl,
} = URLFormatter;

jest.mock('../methods/script');

describe('Film Routes Test', () => {
	beforeEach(() => {
		mockingoose.resetAll();
		fetchMock.reset();
	});

	describe('POST /api/film/', () => {
		it('should return the film [mocked version]', async () => {
			const testScript = path.join(__dirname, './__mocks__/boyhood.txt');
			const title = 'Boyhood';
			const imdbID = 'tt1065073';
			const _doc = { title, test: true };
			mockingoose.Film.toReturn(_doc, 'find');
			mockingoose.Film.toReturn({}, 'save');

			const simpleURL = createSimpleDataURL(title);
			const fullURL = createFilmCreditsURL(imdbID);
			const imagesURL = createImageUrl(imdbID);

			fetchMock.mock(simpleURL, mockGetSimpleCastData);
			fetchMock.mock(fullURL, mockGetFullCastData);
			fetchMock.mock(imagesURL, mockImagesData);

			const result = await processScript(testScript);
			expect(result._doc.title).toBe('Boyhood');
		});
	});
});
