import fetchMock from 'fetch-mock';
// import postFilmScript from './postFilmScript';

describe('postFilmScript', () => {
	beforeEach(() => {
		fetchMock.reset();
	});

	it('should call callback after success', async () => {
		const path = '/api/film/';
		const mockResponse = { success: true };
		const options = { method: 'POST' };
		fetchMock.mock(path, mockResponse, options);

		// const response = await postFilmScript();
		// expect(response).toMatchObject(mockResponse);
	});
});
