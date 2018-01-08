const bechdelResults = require('./BechdelResults');
const handleError = require('../../helper/handleError');

const keywords = ['EXT', 'INT', 'EXTERIOR', 'INTERIOR', 'INT/EXT', 'I/E'];

const isArrayEmpty = arr => {
	return arr.length === 0;
};

const isKeywordOnLine = (keyword, line) => {
	return line.indexOf(keyword) !== -1;
};

const extractScenes = movieScript => {
	let subScene = '';

	movieScript.split('\n').forEach(line => {
		for (let i = 0; i < keywords.length; i++) {
			const keyword = keywords[i];
			if (isKeywordOnLine(keyword, line)) {
				bechdelResults.addScene(subScene);
				subScene = '';
				break;
			}
		}
		subScene += `${line}\n`;
	});

	bechdelResults.addScene(subScene);

	if (isArrayEmpty(bechdelResults.scenes)) {
		handleError('Error while exctracting scenes');
	}
	return bechdelResults.scenes;
};

module.exports = extractScenes;
