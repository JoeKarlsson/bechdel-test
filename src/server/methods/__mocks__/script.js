const fs = require('fs');
const script = require('./mock-boyhood');

const readMovieTitle = jest.fn(() => {
	return new Promise(resolve => {
		resolve('Boyhood');
	});
});

const clearTemp = path => {
	const promise = new Promise((resolve, reject) => {
		if (!path) {
			reject(new Error('Invalid clearTemp input'));
		}
		fs.unlink(path, err => {
			if (err) {
				console.error(err);
			}
			resolve(true);
		});
	});
	return promise;
};

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
