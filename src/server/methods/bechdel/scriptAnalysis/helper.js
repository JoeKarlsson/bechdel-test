/* eslint-disable guard-for-in, no-cond-assign, no-restricted-syntax, no-lonely-if */
const bechdelResults = require('../BechdelResults');

const greaterThanZero = num => {
	return num > 0;
};

/**
 * Returns an object with all of the characters in the movie and
 * the number times they talk in a given scene
 * @param  [Array] a array of movie characters
 * @param  [String] s This is a script that will be checked
 * it we be checked on a scene by scene basis and the script in it's entirity.
 * @return [object] an object with all of the characters in
 * the movie and the number times they talk in a given scene
 */
const countCharacterDialogue = (arr, scene) => {
	// if (!chars || !scene) {
	// 	throw new Error('Invalid countCharacterDialouge input');
	// }
	// const charDialogueCount = {};
	//
	// console.log('chars', chars);
	//
	// for (let i = 0; i < chars.length; i++) {
	// 	const { characterName } = chars[i];
	// 	let fromIndex = scene.indexOf(characterName, 0);
	// 	charDialogueCount[characterName] = 0;
	//
	// 	console.log('fromIndex', fromIndex);
	//
	// 	while (fromIndex > -1) {
	// 		charDialogueCount[characterName]++;
	// 		fromIndex = scene.indexOf(characterName, fromIndex);
	// 	}
	// }
	// return charDialogueCount;

	if (!arr || !scene) {
		throw new Error('Invalid countCharacterDialouge input');
	}
	const charDialougeCount = {};

	for (let x = 0; x < arr.length; x++) {
		let i = 0;
		charDialougeCount[arr[x].characterName] = 0;
		while ((i = scene.indexOf(arr[x].characterName, i)) > -1) {
			charDialougeCount[arr[x].characterName]++;
			i++;
		}
	}
	return charDialougeCount;
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

	for (let i = 0; i < characters.length; i++) {
		const character = characters[i];
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
 * Scans a scene for a list of patriachal keywords,
 * if one of these keywords is found in the scene, it returns true.
 * @param  {[type]} s [description]
 * @return {[boolean]}   Boolean indicating whether or not a scene
 * contains patriarchal keywords or not.
 */
const containsPatriarchalKeywords = s => {
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
	let femalesWithDialogue = 0;
	const names = Object.keys(count);

	for (let i = 0; i < names.length; i++) {
		const name = names[i];
		const dialogueCount = count[name];

		if (greaterThanZero(dialogueCount)) {
			if (isCharFemale(characters, name)) {
				femalesWithDialogue++;
			}
		}
	}

	if (femalesWithDialogue >= 2) {
		return true;
	}
	return false;
};

const bechdelTestPass = sceneData => {
	const { characters, count, scene } = sceneData;

	if (twoOrMoreFemalesInScene(characters, count) === true) {
		bechdelResults.bechdelScore = 2;

		if (containsPatriarchalKeywords(scene) === false) {
			bechdelResults.numScenesPassIncrement();
			bechdelResults.bechdelScore = 3;
			bechdelResults.bechdelPass = true;
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

module.exports = {
	countCharacterDialogue,
	isCharFemale,
	containsPatriarchalKeywords,
	twoOrMoreFemalesInScene,
	bechdelTestPass,
};
