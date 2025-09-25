const Film = require('../model/Film');
const filmData = require("./getFilmData/FilmData");
const script = require("./script");
const getBechdelResults = require('./bechdel/getBechdelResults');
const cleanupManager = require('../helper/cleanupManager');

const resetAll = scriptPath => {
	filmData.clear();
	script.clearTemp(scriptPath);
	return true;
};

const handleError = (err, scriptPath) => {
	if (scriptPath) {
		resetAll(scriptPath);
	}
	console.error(err);
	return {
		success: false,
		error: err.message || 'Unknown error occurred during script processing'
	};
};

const handleFilmFoundInDB = (film, scriptPath) => {
	resetAll(scriptPath);
	const response = {
		...film,
		success: true,
		cacheHit: true,
	};
	return response;
};

const filmFound = film => {
	return film.length > 0;
};

const processScript = async (scriptPath, title, processId = null, claudeApiKey = null) => {
	// Generate processId if not provided (for backward compatibility)
	if (!processId) {
		processId = `process_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		// Register this process with the cleanup manager
		cleanupManager.registerProcess(processId, scriptPath, title);
	}

	try {
		console.log(`Starting script processing: ${processId} for "${title}"`);

		// Update stage to fetching film data
		cleanupManager.updateProcessStage(processId, 'fetching_film_data');

		const bechdelResults = await getBechdelResults(title, scriptPath, processId, claudeApiKey);

		// Update stage to saving results
		cleanupManager.updateProcessStage(processId, 'saving_results');

		const { actors, images, metadata, bechdelData } = filmData.getAllData();

		const filmMetaData = {
			title: metadata.title || title, // Use IMDb title if available, fallback to filename
			bechdelResults,
			bechdelData,
			actors,
			images,
			data: metadata,
		};

		// Add enhanced analytics data if available
		if (bechdelResults.enhancedAnalytics) {
			filmMetaData.enhancedAnalytics = bechdelResults.enhancedAnalytics;
		}
		if (bechdelResults.analyticsSummary) {
			filmMetaData.analyticsSummary = bechdelResults.analyticsSummary;
		}
		if (bechdelResults.analysisMetadata) {
			filmMetaData.analysisMetadata = bechdelResults.analysisMetadata;
		}

		// Use updateOrInsertFilm to replace existing films or create new ones
		const savedFilm = await Film.updateOrInsertFilm(filmMetaData);
		// Search for the film using the actual title that was saved (IMDb title if available, otherwise filename)
		const searchTitle = metadata.title || title;
		const finalFilm = await Film.findByTitle(searchTitle);

		resetAll(scriptPath);

		// Check if film was found
		if (!finalFilm || finalFilm.length === 0) {
			throw new Error(`Film "${searchTitle}" not found in database after saving. Searched for: "${searchTitle}", Original filename: "${title}"`);
		}

		const response = {
			...finalFilm[0].toObject(),
			title: metadata.title || title, // Use IMDb title if available, fallback to filename
			success: true,
			cacheHit: false,
			processId, // Include processId in response
		};

		console.log(`Script processing completed successfully: ${processId}`);

		// Mark process as completed
		cleanupManager.completeProcess(processId, true);

		return response;
	} catch (err) {
		console.error(`Error processing script ${processId}:`, err);

		// Clean up failed process
		await cleanupManager.cleanupFailedProcess(processId, err);

		return handleError(err, scriptPath);
	}
};

module.exports = processScript;
