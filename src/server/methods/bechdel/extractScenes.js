/* eslint-disable guard-for-in, no-cond-assign, no-restricted-syntax */
const bechdelResults = require('./BechdelResults');

const extractScenes = movieScript => {
	const keywords = ['EXT', 'INT', 'EXTERIOR', 'INTERIOR', 'INT/EXT', 'I/E'];
	let subScene = '';
	movieScript.split('\n').forEach(pg => {
		for (const idx in keywords) {
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

	if (bechdelResults.scenes.length === 0) {
		throw new Error('Error while exctracting scenes');
	}
	return bechdelResults.scenes;
};

module.exports = extractScenes;
