/* eslint-disable guard-for-in, no-cond-assign, no-restricted-syntax, no-lonely-if */

const bechdelResults = require('../BechdelResults');
const {
	isCharFemale,
	countCharacterDialouge,
	bechdelTestPass,
} = require('./helper');

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
	console.log('scriptGenderAnalytics started');
	const count = countCharacterDialouge(characters, movieScript);
	let name;
	try {
		for (name in count) {
			if (isCharFemale(characters, name)) {
				bechdelResults.numOfFemalesCharsIncrement();
				if (count[name] > 0) {
					bechdelResults.numOfFemalesCharsWithDialogueIncrement();
					bechdelResults.totalLinesFemaleDialogueAdd(count[name]);
				}
			} else {
				bechdelResults.numOfMaleCharsIncrement();
				if (count[name] > 0) {
					bechdelResults.numOfMaleCharsWithDialogueIncrement();
					bechdelResults.totalLinesMaleDialogueAdd(count[name]);
				}
			}
		}
	} catch (err) {
		console.log(err);
		throw new Error(err);
	}

	console.log('scriptGenderAnalytics finished');
	console.log(
		bechdelResults.getBechdelResults(),
		'bechdelResults.getBechdelResults();'
	);
	return bechdelResults.getBechdelResults();
};

const scriptAnalysis = (characters, scenes) => {
	const promise = new Promise(resolve => {
		for (const idx in scenes) {
			const scene = scenes[idx];
			const count = countCharacterDialouge(characters, scene);
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
		resolve(bechdelResults.getBechdelResults());
	});
	return promise;
};

module.exports = {
	scriptAnalysis,
	scriptGenderAnalytics,
};
