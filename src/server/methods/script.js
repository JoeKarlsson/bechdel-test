/* eslint-disable guard-for-in, no-cond-assign, no-restricted-syntax */

const fs = require('fs');
const Promise = require('bluebird');
// import bechdelResults from './bechdel/BechdelResults';

const readMovieTitle = (path) => {
	const promise = new Promise((resolve, reject) => {
		if (!path) {
			reject(new Error('Invalid readMovieTitle input'));
		}
		const rs = fs.createReadStream(path, { encoding: 'utf8' });
		let acc = '';
		let pos = 0;
		let index;

		rs.on('data', (chunk) => {
			index = chunk.indexOf('\n');
			acc += chunk;
			if (index !== -1) {
				rs.close();
			} else {
				pos += chunk.length;
			}
		})
			.on('close', () => {
				const movieTitle = acc.slice(0, pos + index);
				resolve(movieTitle);
			})
			.on('error', (err) => {
				reject(new Error(err));
			});
	});
	return promise;
};

const read = (path) => {
	const promise = new Promise((resolve, reject) => {
		if (!path) {
			reject(new Error('Invalid read input'));
		}
		const rs = fs.createReadStream(path, { encoding: 'utf8' });
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

const clearTemp = (path) => {
	const promise = new Promise((resolve, reject) => {
		if (!path) {
			reject(new Error('Invalid clearTemp input'));
		}
		fs.unlink(path, (err) => {
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
