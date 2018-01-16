/* eslint-disable guard-for-in, no-cond-assign, no-restricted-syntax */
const fs = require('fs');
const path = require('path');

const readMovieTitle = scriptPath => {
	const title = path.basename(scriptPath, '.txt');
	console.log('title', title);
	return title;
};

const read = path => {
	const promise = new Promise((resolve, reject) => {
		if (!path) {
			reject(new Error('Invalid read input'));
		}
		const rs = fs.createReadStream(path, { encoding: 'utf8' });
		let movieScript = '';

		rs
			.on('data', chunk => {
				movieScript += chunk;
			})
			.on('close', () => {
				resolve(movieScript);
			})
			.on('error', err => {
				reject(new Error(err));
			});
	});
	return promise;
};

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

module.exports = {
	readMovieTitle,
	read,
	clearTemp,
};
