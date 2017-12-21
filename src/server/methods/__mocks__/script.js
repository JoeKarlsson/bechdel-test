const script = require('./mock-boyhood');

const readMovieTitle = jest.fn(() => {
	return new Promise(resolve => {
		resolve('Boyhood');
	});
});

const clearTemp = jest.fn(() => {
	return new Promise(resolve => {
		resolve();
	});
});

const read = () => {
	return new Promise(resolve => {
		resolve(script);
	});
};

module.exports = {
	readMovieTitle,
	clearTemp,
	read,
};
