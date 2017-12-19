/* eslint-disable guard-for-in, no-cond-assign, no-restricted-syntax */

const Promise = require('bluebird');
const script = require('../script');
const scriptAnalysis = require('./scriptAnalysis');
const bechdelResults = require('./BechdelResults');
const getFilmData = require('../getFilmData/getFilmData');

const extractScenes = (characters, movieScript) => {
	if (!characters || !movieScript) {
		throw new Error(
			'Failed when extracting scenes -' +
			' Script has to yet been loaded into memory',
		);
	}
	const keywords = [
		'EXT',
		'INT',
		'EXTERIOR',
		'INTERIOR',
		'INT/EXT',
		'I/E',
	];
	let idx;
	let subScene = '';

	movieScript.split('\n').forEach((pg) => {
		for (idx in keywords) {
			const keyword = keywords[idx];
			if (pg.indexOf(keyword) !== -1) {
				bechdelResults.addScene(subScene);
				subScene = '';
				break;
			}
		}
		subScene += (`${pg}\n`);
	});
	bechdelResults.addScene(subScene);
	if (bechdelResults.scenes === []) {
		throw new Error('Error while exctracting scenes');
	}
	return bechdelResults.scenes;
};

const getBechdelResults = (title, path) => {
	const promise = new Promise((resolve, reject) => {
		if (!title || !path) {
			reject(new Error('Invalid getBechdelResults input'));
		}

		getFilmData.getData(title)
			.then((data) => {
				if (!data) {
					throw new Error('No data returned from getData');
				}
				bechdelResults.characters = data[0].characters;
				return script.read(path);
			})
			.then((movieScript) => {
				if (!movieScript) {
					throw new Error('No movieScript returned from script.read(path)');
				}
				scriptAnalysis.scriptGenderAnalytics(bechdelResults.characters, movieScript);
				const scenes = extractScenes(bechdelResults.characters, movieScript);

				const analysis = scriptAnalysis.scriptAnalysis(bechdelResults.characters, scenes);
				resolve(analysis);
			})
			.catch((error) => {
				throw new Error(error);
			});
	});
	return promise;
};

module.exports = getBechdelResults;
