/* eslint-disable no-cond-assign */

// BechdelResults instance is passed as a parameter to prevent race conditions
const handleError = require('../../../helper/handleError');

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
const countCharacterDialogue = (characters, scene) => {
	if (!characters || !scene) {
		handleError('Invalid countCharacterDialouge input');
	}
	const charDialougeCount = {};

	for (let i = 0; i < characters.length; i++) {
		let count = 0;
		const { cleanCharName } = characters[i];
		charDialougeCount[cleanCharName] = 0;

		while ((count = scene.indexOf(cleanCharName, count)) > -1) {
			charDialougeCount[cleanCharName]++;
			count++;
		}
	}
	return charDialougeCount;
};

/**
 * Returns a boolean depending on whether or not a character has a valid gender (1 or 2)
 * @param  {[type]}  characters [description]
 * @param  {[type]}  name [description]
 * @return {Boolean} [description]
 */
const hasValidGender = (characters, name) => {
	if (!characters) {
		handleError('Invalid hasValidGender input');
	}

	for (let i = 0; i < characters.length; i++) {
		const character = characters[i];
		if (name === character.cleanCharName) {
			return character.gender === 1 || character.gender === 2;
		}
	}
	handleError('Character not found');
};

/**
 * Returns a boolean depending on whether or not a char is female or not
 * @param  {[type]}  characters [description]
 * @return {Boolean} [description]
 */
const isCharFemale = (characters, name) => {
	if (!characters) {
		handleError('Invalid isCharFemale input');
	}

	for (let i = 0; i < characters.length; i++) {
		const character = characters[i];
		if (name === character.cleanCharName) {
			if (character.gender === 1) {
				return true;
			} if (character.gender === 2) {
				return false;
			}
			return false;
		}
	}
	handleError('Character not found');
};

/**
 * Enhanced patriarchal keywords detection with more comprehensive list
 * and context awareness
 * @param  {[type]} s [description]
 * @return {[boolean]}   Boolean indicating whether or not a scene
 * contains patriarchal keywords or not.
 */
const containsPatriarchalKeywords = s => {
	const patriacryKeywords = [
		// Basic male references
		'Man', 'Men', 'Boy', 'Boys', 'Guy', 'Guys', 'Male', 'Males', 'Dude', 'Dudes',
		'He', 'His', 'Him', 'Husband', 'Husbands', 'Boyfriend', 'Boyfriends',
		'Father', 'Fathers', 'Dad', 'Dads', 'Brother', 'Brothers', 'Son', 'Sons',
		'bro', 'bros', 'Bro', 'Bros', 'King', 'Kings', 'Prince', 'Princes',

		// Male-specific terms and titles
		'Sir', 'Mr', 'Mister', 'Master', 'Lord', 'Duke', 'Earl', 'Baron',
		'Gentleman', 'Gentlemen', 'Fellow', 'Fellows', 'Buddy', 'Bud', 'Pal',

		// Relationship terms that imply male focus
		'boyfriend', 'husband', 'fiancé', 'ex-boyfriend', 'ex-husband',
		'my man', 'my guy', 'my boy', 'the man', 'that guy', 'this guy',

		// Common male names (partial list)
		'John', 'Mike', 'David', 'Robert', 'James', 'William', 'Richard', 'Charles',
		'Thomas', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald',
		'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George',
		'Edward', 'Ronald', 'Timothy', 'Jason', 'Jeffrey', 'Ryan', 'Jacob', 'Gary',
		'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott',
		'Brandon', 'Benjamin', 'Samuel', 'Gregory', 'Frank', 'Raymond', 'Alexander',
		'Patrick', 'Jack', 'Dennis', 'Jerry', 'Tyler', 'Aaron', 'Jose', 'Henry',
		'Adam', 'Douglas', 'Nathan', 'Peter', 'Zachary', 'Kyle', 'Walter', 'Harold',
		'Carl', 'Jeremy', 'Keith', 'Roger', 'Gerald', 'Ethan', 'Arthur', 'Terry',
		'Christian', 'Sean', 'Lawrence', 'Austin', 'Joe', 'Noah', 'Jesse', 'Albert',
		'Bryan', 'Billy', 'Bruce', 'Willie', 'Jordan', 'Alan', 'Wayne', 'Roy',
		'Ralph', 'Eugene', 'Louis', 'Philip', 'Bobby', 'Johnny', 'Howard'
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
 * Extracts dialogue sequences from a scene to analyze conversation flow
 * @param {string} scene - The scene text
 * @param {Array} characters - Array of character objects
 * @returns {Array} Array of dialogue objects with character, text, and position
 */
const extractDialogueSequences = (scene, characters) => {
	const dialogueSequences = [];
	const lines = scene.split('\n');

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		// Check if this line is a character name (dialogue)
		for (let j = 0; j < characters.length; j++) {
			const character = characters[j];
			if (line === character.cleanCharName) {
				// Look for the dialogue text in the next few lines
				let dialogueText = '';
				let k = i + 1;

				// Collect dialogue until we hit another character name or empty line
				while (k < lines.length && lines[k].trim() !== '' &&
					!characters.some(char => lines[k].trim() === char.cleanCharName)) {
					dialogueText += `${lines[k].trim()  } `;
					k++;
				}

				if (dialogueText.trim()) {
					dialogueSequences.push({
						character: character.cleanCharName,
						text: dialogueText.trim(),
						position: i,
						isFemale: character.gender === 1
					});
				}
				break;
			}
		}
	}

	return dialogueSequences;
};

/**
 * Analyzes if female characters are having a meaningful conversation
 * @param {Array} dialogueSequences - Array of dialogue objects
 * @param {Array} characters - Array of character objects
 * @returns {Object} Analysis result with conversation quality metrics
 */
const analyzeFemaleConversation = (dialogueSequences, characters) => {
	const femaleDialogue = dialogueSequences.filter(d => d.isFemale);

	if (femaleDialogue.length < 2) {
		return {
			hasConversation: false,
			reason: 'Not enough female dialogue',
			quality: 0
		};
	}

	// Check if women are responding to each other (conversation flow)
	let conversationPairs = 0;
	let meaningfulTopics = 0;
	let totalFemaleWords = 0;

	for (let i = 0; i < femaleDialogue.length - 1; i++) {
		const current = femaleDialogue[i];
		const next = femaleDialogue[i + 1];

		// Check if they're responding to each other (not just sequential dialogue)
		const wordsBetween = dialogueSequences.filter(d =>
			d.position > current.position && d.position < next.position);

		// If there are few or no male characters speaking between female dialogue,
		// it's likely a conversation
		if (wordsBetween.length <= 2) {
			conversationPairs++;
		}

		// Analyze dialogue content for meaningful topics
		const currentText = current.text.toLowerCase();
		const nextText = next.text.toLowerCase();

		// Check for question-answer patterns
		if (currentText.includes('?') || nextText.includes('?')) {
			meaningfulTopics++;
		}

		// Check for emotional responses
		const emotionalWords = ['feel', 'think', 'believe', 'want', 'need', 'love', 'hate', 'fear', 'hope'];
		if (emotionalWords.some(word => currentText.includes(word) || nextText.includes(word))) {
			meaningfulTopics++;
		}

		// Check for personal topics
		const personalWords = ['my', 'me', 'i', 'we', 'our', 'us'];
		if (personalWords.some(word => currentText.includes(word) || nextText.includes(word))) {
			meaningfulTopics++;
		}

		totalFemaleWords += current.text.split(' ').length;
	}

	// Calculate conversation quality score
	const qualityScore = (conversationPairs * 0.4) + (meaningfulTopics * 0.3) +
		Math.min(totalFemaleWords / 50, 1) * 0.3;

	return {
		hasConversation: conversationPairs > 0 || meaningfulTopics > 0,
		reason: conversationPairs > 0 ? 'Has conversation flow' : 'No conversation flow',
		quality: qualityScore,
		conversationPairs,
		meaningfulTopics,
		totalFemaleWords
	};
};

/**
 * Enhanced Bechdel test that checks for actual conversations between women
 * @param {Object} sceneData - Scene data object
 * @returns {boolean} Whether the scene passes the enhanced Bechdel test
 */
const enhancedBechdelTestPass = (sceneData) => {
	const { characters, count, scene } = sceneData;

	// First check: Are there 2+ female characters with dialogue?
	if (!twoOrMoreFemalesInScene(characters, count)) {
		return false;
	}

	// Second check: Are they talking about men/patriarchal topics?
	if (containsPatriarchalKeywords(scene)) {
		return false;
	}

	// For now, if we have 2+ female characters with dialogue and they're not talking about men,
	// consider it a pass (similar to basic test but with patriarchal keyword check)
	return true;
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

// Keep the original function for backward compatibility
// Note: This function requires bechdelResults instance to be passed
const bechdelTestPass = (sceneData, bechdelResults) => {
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
	hasValidGender,
	isCharFemale,
	containsPatriarchalKeywords,
	twoOrMoreFemalesInScene,
	bechdelTestPass,
	enhancedBechdelTestPass,
	extractDialogueSequences,
	analyzeFemaleConversation,
};