const mockGetFilmData = require('./mock-film-data');

const getFilmData = jest.fn(() => {
	const p = new Promise(resolve => {
		resolve(mockGetFilmData);
	});
	return p;
});

module.exports = getFilmData;
