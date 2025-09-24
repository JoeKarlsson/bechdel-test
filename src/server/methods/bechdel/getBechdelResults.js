const script = require('../script');
const scriptAnalysis = require('./scriptAnalysis/scriptAnalysis');
const bechdelResults = require('./BechdelResults');
const extractScenes = require('./extractScenes');
const getFilmData = require('../getFilmData/getFilmData');
const handleError = require('../../helper/handleError');

const getBechdelResults = async (title, path) => {
	try {
		// Reset the bechdelResults singleton to ensure clean state
		bechdelResults.reset();
		
		const data = await getFilmData(title);

		bechdelResults.characters = data.actors;

		const movieScript = await script.read(path);

		// First, get gender analytics for the entire script
		const genderAnalytics = scriptAnalysis.scriptGenderAnalytics(
			bechdelResults.characters,
			movieScript
		);

		// Then, analyze scenes for Bechdel test
		const scenes = extractScenes(movieScript);
		const sceneAnalysis = scriptAnalysis.scriptAnalysis(bechdelResults.characters, scenes);

		// Combine both results, preserving character dialogue statistics
		return {
			...sceneAnalysis,
			numOfFemalesChars: genderAnalytics.numOfFemalesChars,
			numOfMaleChars: genderAnalytics.numOfMaleChars,
			numOfFemalesCharsWithDialogue: genderAnalytics.numOfFemalesCharsWithDialogue,
			numOfMaleCharsWithDialogue: genderAnalytics.numOfMaleCharsWithDialogue,
			totalLinesFemaleDialogue: genderAnalytics.totalLinesFemaleDialogue,
			totalLinesMaleDialogue: genderAnalytics.totalLinesMaleDialogue,
		};
	} catch (err) {
		handleError(err);
	}
};

module.exports = getBechdelResults;
