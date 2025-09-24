const script = require('../script');
const scriptAnalysis = require('./scriptAnalysis/scriptAnalysis');
const bechdelResults = require('./BechdelResults');
const extractScenes = require('./extractScenes');
const getFilmData = require('../getFilmData/getFilmData');
const handleError = require('../../helper/handleError');

const getBechdelResults = async (title, path, processId = null) => {
	try {
		// Reset the bechdelResults singleton to ensure clean state
		bechdelResults.reset();

		const data = await getFilmData(title, processId);

		bechdelResults.characters = data.actors;

		// Update stage to reading script
		if (processId) {
			const cleanupManager = require('../../helper/cleanupManager');
			cleanupManager.updateProcessStage(processId, 'reading_script');
		}

		const movieScript = await script.read(path);

		// Update progress after script is read
		if (processId) {
			const cleanupManager = require('../../helper/cleanupManager');
			cleanupManager.setProcessMessage(processId, 'Script read successfully, analyzing characters...');
		}

		// Update stage to analyzing characters
		if (processId) {
			const cleanupManager = require('../../helper/cleanupManager');
			cleanupManager.updateProcessStage(processId, 'analyzing_characters');
		}

		// First, get gender analytics for the entire script
		const genderAnalytics = scriptAnalysis.scriptGenderAnalytics(
			bechdelResults.characters,
			movieScript
		);

		// Update progress after character analysis
		if (processId) {
			const cleanupManager = require('../../helper/cleanupManager');
			cleanupManager.setProcessMessage(processId, 'Character analysis complete, extracting scenes...');
		}

		// Update stage to extracting scenes
		if (processId) {
			const cleanupManager = require('../../helper/cleanupManager');
			cleanupManager.updateProcessStage(processId, 'extracting_scenes');
		}

		// Then, analyze scenes for Bechdel test
		const scenes = extractScenes(movieScript);

		// Update progress after scene extraction
		if (processId) {
			const cleanupManager = require('../../helper/cleanupManager');
			cleanupManager.setProcessMessage(processId, 'Scenes extracted, running Bechdel test...');
		}

		// Update stage to running Bechdel test
		if (processId) {
			const cleanupManager = require('../../helper/cleanupManager');
			cleanupManager.updateProcessStage(processId, 'running_bechdel_test');
		}

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
			scenesThatPass: bechdelResults.scenesThatPassBechdel,
		};
	} catch (err) {
		handleError(err);
		throw err; // Re-throw the error so it can be caught by processScript
	}
};

module.exports = getBechdelResults;
