/* eslint-disable guard-for-in, no-cond-assign, no-restricted-syntax */

const script = require('../script');
const scriptAnalysis = require('./scriptAnalysis');
const bechdelResults = require('./BechdelResults');
const getFilmData = require('../getFilmData/getFilmData');

const extractScenes = (characters, movieScript) => {
	const keywords = ['EXT', 'INT', 'EXTERIOR', 'INTERIOR', 'INT/EXT', 'I/E'];
	let idx;
	let subScene = '';

	movieScript.split('\n').forEach(pg => {
		for (idx in keywords) {
			const keyword = keywords[idx];
			if (pg.indexOf(keyword) !== -1) {
				bechdelResults.addScene(subScene);
				subScene = '';
				break;
			}
		}
		subScene += `${pg}\n`;
	});
	bechdelResults.addScene(subScene);

	if (bechdelResults.scenes === []) {
		throw new Error('Error while exctracting scenes');
	}
	return bechdelResults.scenes;
};

const getBechdelResults = (title, path) => {
	return new Promise((resolve, reject) => {
		return getFilmData(title)
			.then(data => {
				bechdelResults.characters = data.actors;
				return script.read(path);
			})
			.then(movieScript => {
				scriptAnalysis.scriptGenderAnalytics(
					bechdelResults.characters,
					movieScript
				);
				const scenes = extractScenes(bechdelResults.characters, movieScript);

				const analysis = scriptAnalysis.scriptAnalysis(
					bechdelResults.characters,
					scenes
				);
				resolve(analysis);
			})
			.catch(error => {
				reject(new Error(error));
			});
	});
};

module.exports = getBechdelResults;
