const readMovieTitle = jest.fn(() => {
	const p = new Promise((resolve) => {
		resolve('Boyhood');
	});
	return p;
});

const clearTemp = jest.fn(() => {
	const p = new Promise((resolve) => {
		resolve();
	});
	return p;
});

module.exports = {
	readMovieTitle,
	clearTemp,
};
