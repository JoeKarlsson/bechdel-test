const handleError = require('../../helper/handleError');

const keywords = ['EXT', 'INT', 'EXTERIOR', 'INTERIOR', 'INT/EXT', 'I/E'];

const isArrayEmpty = arr => {
	return arr.length === 0;
};

const isKeywordOnLine = (keyword, line) => {
	return line.indexOf(keyword) !== -1;
};

const extractScenes = movieScript => {
	const scenes = [];
	let subScene = '';

	movieScript.split('\n').forEach(line => {
		for (let i = 0; i < keywords.length; i++) {
			const keyword = keywords[i];
			if (isKeywordOnLine(keyword, line)) {
				scenes.push(subScene);
				subScene = '';
				break;
			}
		}
		subScene += `${line}\n`;
	});

	scenes.push(subScene);

	if (isArrayEmpty(scenes)) {
		handleError('Error while exctracting scenes');
	}
	return scenes;
};

module.exports = extractScenes;
