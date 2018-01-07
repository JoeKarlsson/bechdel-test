const bechdelResults = require('../BechdelResults');
const {
	isCharFemale,
	countCharacterDialogue,
	bechdelTestPass,
} = require('./helper');

const greaterThanZero = num => {
	return num > 0;
};

/**
 * Function to collect gender statistics based on the entire movie script.
 * Collects information on  numOfFemalesChars, numOfMaleChars,
 * numOfFemalesCharsWithDialogue, numOfMaleCharsWithDialogue,
 * totalLinesFemaleDialogue, and the totalLinesMaleDialogue.
 * @param  {[type]} characters [description]
 * @param  {[type]} movieScript     [description]
 * @return {[type]}                 [description]
 */
const scriptGenderAnalytics = (characters, movieScript) => {
	const charCount = countCharacterDialogue(characters, movieScript);
	const names = Object.keys(charCount);

	for (let i = 0; i < names.length; i++) {
		const name = names[i];

		if (isCharFemale(characters, name)) {
			bechdelResults.numOfFemalesCharsIncrement();
			const numLinesOfDialogue = charCount[name];

			if (greaterThanZero(numLinesOfDialogue)) {
				bechdelResults.numOfFemalesCharsWithDialogueIncrement();
				bechdelResults.totalLinesFemaleDialogueAdd(charCount[name]);
			}
		} else {
			bechdelResults.numOfMaleCharsIncrement();
			const numLinesOfDialogue = charCount[name];
			if (greaterThanZero(numLinesOfDialogue)) {
				bechdelResults.numOfMaleCharsWithDialogueIncrement();
				bechdelResults.totalLinesMaleDialogueAdd(charCount[name]);
			}
		}
	}

	return bechdelResults.getBechdelResults();
};

const scriptAnalysis = (characters, scenes) => {
	for (let i = 0; i < scenes.length; i++) {
		const scene = scenes[i];
		const count = countCharacterDialogue(characters, scene);
		const sceneData = {
			characters,
			count,
			scene,
		};
		if (bechdelTestPass(sceneData) === true) {
			bechdelResults.bechdelPass = true;
			bechdelResults.addBechdelPassingScene(scene);
		}
	}
	return bechdelResults.getBechdelResults();
};

module.exports = {
	scriptAnalysis,
	scriptGenderAnalytics,
};
