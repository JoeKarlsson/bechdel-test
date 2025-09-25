const mockFilmData = require('./mock-film-data');

const getFilmData = jest.fn(() => {
	const p = new Promise(resolve => {
		resolve(mockFilmData);
	});
	return p;
});

module.exports = getFilmData;
