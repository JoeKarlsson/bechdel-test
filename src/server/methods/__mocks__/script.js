const fs = require('fs');
const path = require('path');

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

const read = () => {
	const scriptPath = path.join(
		__dirname,
		'../../../../scripts/boyhood.txt',
	);
	const promise = new Promise((resolve, reject) => {
		const rs = fs.createReadStream(scriptPath, { encoding: 'utf8' });
		let movieScript = '';

		rs.on('data', (chunk) => {
			movieScript += chunk;
		})
			.on('close', () => {
				resolve(movieScript);
			})
			.on('error', (err) => {
				reject(new Error(err));
			});
	});
	return promise;
};

module.exports = {
	readMovieTitle,
	clearTemp,
	read,
};
