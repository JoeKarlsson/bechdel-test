/* eslint-disable guard-for-in, no-cond-assign, no-restricted-syntax, no-lonely-if */

const bechdelResults = require('./BechdelResults');

/**
 * Returns an object with all of the characters in the movie and
 * the number times they talk in a given scene
 * @param  [Array] a array of movie characters
 * @param  [String] s This is a script that will be checked
 * it we be checked on a scene by scene basis and the script in it's entirity.
 * @return [object] an object with all of the characters in
 * the movie and the number times they talk in a given scene
 */
const countCharacterDialouge = (arr, scene) => {
	if (!arr || !scene) {
		throw new Error('Invalid countCharacterDialouge input');
	}
	const output = {};
	let x;
	let i;

	for (x = 0; x < arr.length; x++) {
		i = 0;
		output[arr[x].characterName] = 0;
		while ((i = scene.indexOf(arr[x].characterName, i)) > -1) {
			output[arr[x].characterName]++;
			i++;
		}
	}
	return output;
};

/**
 * Returns a boolean depending on whether or not a char is female or not
 * @param  {[type]}  characters [description]
 * @return {Boolean} [description]
 */
const isCharFemale = (characters, name) => {
	if (!characters) {
		throw new Error('Invalid isCharFemale input');
	}
	let idx;

	for (idx in characters) {
		const character = characters[idx];
		if (name === character.characterName) {
			if (character.gender === 'Actress') {
				return true;
			} else if (character.gender === 'Actor') {
				return false;
			}
			return false;
		}
	}
	throw new Error('Character not found');
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
	if (!characters || !movieScript) {
		throw new Error('Invalid scriptGenderAnalytics input');
	}
	const count = countCharacterDialouge(characters, movieScript);
	let name;

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
};

/**
 * Scans a scene for a list of patriachal keywords,
 * if one of these keywords is found in the scene, it returns true.
 * @param  {[type]} s [description]
 * @return {[boolean]}   Boolean indicating whether or not a scene
 * contains patriarchal keywords or not.
 */
const containsPatriarchalKeywords = (s) => {
	if (!s) {
		throw new Error('Invalid containsPatriarchalKeywords input');
	}
	const patriacryKeywords = [
		'Man',
		'Men',
		'Boy',
		'Boys',
		'Guy',
		'Guys',
		'Male',
		'Males',
		'Dude',
		'Dudes',
		'He',
		'His',
		'Him',
		'Husband',
		'Husbands',
		'Boyfriend',
		'Boyfriends',
		'Father',
		'Fathers',
		'Dad',
		'Dads',
		'Brother',
		'Brothers',
		'Son',
		'Sons',
		'bro',
		'bros',
		'Bro',
		'Bros',
		'King',
		'Kings',
		'Prince',
		'Princes',
	];
	const output = {};
	let keywordHits = 0;
	let x;
	let i;

	for (x = 0; x < patriacryKeywords.length; x++) {
		i = 0;
		output[patriacryKeywords[x]] = 0;
		while ((i = s.indexOf(patriacryKeywords[x], i)) > -1) {
			output[patriacryKeywords[x]]++;
			i++;
			keywordHits++;
		}
	}
	if (keywordHits > 0) {
		return true;
	}
	return false;
};

/**
 * twoOrMoreFemalesInScene Determines is a scene
 * includes two or more female characters in it.
 * This function does not determine if these
 * women have a conversation or if they talk about men.
 * @param  {[type]} count An object containing the list
 * of all movie charachters and the number of times
 * they talk in a given scene.
 * @return {[Boolean]}   Returns a boolean depending
 * on whether or not a scene has two or more women in it.
 */
const twoOrMoreFemalesInScene = (characters, count) => {
	if (!characters || !count) {
		throw new Error('Invalid twoOrMoreFemalesInScene input');
	}
	let femalesWithDialogue = 0;
	let name;

	for (name in count) {
		if (count[name]) {
			if (isCharFemale(characters, name)) {
				femalesWithDialogue++;
			}
		}
	}
	if (femalesWithDialogue >= 2) {
		return true;
	}
};

const bechdelTestPass = (characters, count, scene) => {
	if (!characters || !count || !scene) {
		throw new Error('Invalid bechdelTestPass input');
	}
	if (twoOrMoreFemalesInScene(characters, count) === true) {
		bechdelResults.bechdelScore = 2;

		if (containsPatriarchalKeywords(scene) === false) {
			bechdelResults.numScenesPassIncrement();
			bechdelResults.bechdelScore = 3;
			return true;
		}
		bechdelResults.numScenesDontPassIncrement();
		bechdelResults.bechdelScore = 2;
		return false;
	}
	bechdelResults.numScenesDontPassIncrement();
	bechdelResults.bechdelScore = 1;
	return false;
};

const scriptAnalysis = (characters, scenes) => {
	const promise = new Promise((resolve) => {

		for (const idx in scenes) {
			const scene = scenes[idx];
			const count = countCharacterDialouge(characters, scene);
			if (bechdelTestPass(characters, count, scene) === true) {
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
