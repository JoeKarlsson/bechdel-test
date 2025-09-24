const bechdelResults = require('../BechdelResults');
const {
	isCharFemale,
	hasValidGender,
	countCharacterDialogue,
	bechdelTestPass,
	enhancedBechdelTestPass,
	twoOrMoreFemalesInScene,
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

		// Only count characters with valid gender (1 or 2)
		if (hasValidGender(characters, name)) {
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
		// Characters with gender: 0 (unknown/other) are excluded from the count
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

		// Always use enhanced test by default
		if (enhancedBechdelTestPass(sceneData) === true) {
			bechdelResults.bechdelPass = true;
			bechdelResults.bechdelScore = 3;
			bechdelResults.addBechdelPassingScene(scene);
		} else {
			// Count scenes that don't pass
			bechdelResults.numScenesDontPassIncrement();

			// Check if at least 2 females are present for score 2
			if (twoOrMoreFemalesInScene(characters, count)) {
				bechdelResults.bechdelScore = Math.max(bechdelResults.bechdelScore, 2);
			} else {
				bechdelResults.bechdelScore = Math.max(bechdelResults.bechdelScore, 1);
			}
		}
	}
	return bechdelResults.getBechdelResults();
};

module.exports = {
	scriptAnalysis,
	scriptGenderAnalytics,
};
