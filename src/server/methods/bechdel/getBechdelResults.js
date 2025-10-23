const script = require('../script');
const scriptAnalysis = require('./scriptAnalysis/scriptAnalysis');
const BechdelResults = require('./BechdelResults');
const extractScenes = require('./extractScenes');
const getFilmData = require('../getFilmData/getFilmData');
const handleError = require('../../helper/handleError');
const EnhancedAnalytics = require('../enhancedAnalytics');

const getBechdelResults = async (title, path, processId = null, claudeApiKey = null) => {
	try {
		// Create a new BechdelResults instance for this request (prevents race conditions)
		const bechdelResults = new BechdelResults();

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
			movieScript,
			bechdelResults
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

		const sceneAnalysis = scriptAnalysis.scriptAnalysis(bechdelResults.characters, scenes, bechdelResults);

		// Prepare preliminary Bechdel results for enhanced validation
		const preliminaryBechdelResults = {
			pass: bechdelResults.bechdelPass,
			bechdelScore: bechdelResults.bechdelScore,
			numScenesPass: bechdelResults.numScenesPass,
			numScenesDontPass: bechdelResults.numScenesDontPass,
			scenesThatPass: bechdelResults.scenesThatPassBechdel,
		};

		// Run enhanced analytics if Claude API key is provided
		let enhancedAnalyticsData = null;
		if (claudeApiKey) {
			try {
				if (processId) {
					const cleanupManager = require('../../helper/cleanupManager');
					cleanupManager.updateProcessStage(processId, 'running_enhanced_analytics');
					cleanupManager.setProcessMessage(processId, 'Running advanced AI analytics (including Bechdel validation)...');
				}

				const enhancedAnalytics = new EnhancedAnalytics(claudeApiKey);
				// Pass preliminary Bechdel results for validation
				enhancedAnalyticsData = await enhancedAnalytics.analyzeScript(
					path,
					bechdelResults.characters,
					processId,
					preliminaryBechdelResults
				);
			} catch (error) {
				console.error('Enhanced analytics failed:', error);
				// Continue without enhanced analytics rather than failing completely
				if (processId) {
					const cleanupManager = require('../../helper/cleanupManager');
					cleanupManager.setProcessMessage(processId, 'Enhanced analytics failed, continuing with basic analysis...');
				}
			}
		}

		// Combine both results, preserving character dialogue statistics
		const result = {
			...sceneAnalysis,
			numOfFemalesChars: genderAnalytics.numOfFemalesChars,
			numOfMaleChars: genderAnalytics.numOfMaleChars,
			numOfFemalesCharsWithDialogue: genderAnalytics.numOfFemalesCharsWithDialogue,
			numOfMaleCharsWithDialogue: genderAnalytics.numOfMaleCharsWithDialogue,
			totalLinesFemaleDialogue: genderAnalytics.totalLinesFemaleDialogue,
			totalLinesMaleDialogue: genderAnalytics.totalLinesMaleDialogue,
			scenesThatPass: bechdelResults.scenesThatPassBechdel,
		};

		// Add enhanced analytics if available
		if (enhancedAnalyticsData) {
			result.enhancedAnalytics = enhancedAnalyticsData.enhancedAnalytics;
			result.analyticsSummary = enhancedAnalyticsData.analyticsSummary;
			result.analysisMetadata = enhancedAnalyticsData.analysisMetadata;
		}

		return result;
	} catch (err) {
		handleError(err);
		throw err; // Re-throw the error so it can be caught by processScript
	}
};

module.exports = getBechdelResults;
