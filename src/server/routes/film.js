const express = require('express');
const path = require('path');
const multer = require('multer');
const Film = require('../model/Film');
const filmData = require('../methods/getFilmData/FilmData');
const script = require('../methods/script');
const processScript = require('../methods/processScript');
const cleanupManager = require('../helper/cleanupManager');
const meta = require('../helper/meta');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const isNotCorrectFileFormat = file => {
	return path.extname(file.originalname) !== '.txt';
};

const fileWasNotUploadedCorrectly = file => {
	return !file;
};

const resetAll = scriptPath => {
	filmData.clear();
	script.clearTemp(scriptPath);
	return true;
};

const handleError = (res, errMsg, scriptPath = null) => {
	console.error(errMsg);
	const response = {
		success: false,
		error: errMsg,
	};
	if (scriptPath) {
		resetAll(scriptPath);
	}
	return res.status(500).json(response);
};

const filmFound = film => {
	return film.length > 0;
};

const handleGetAllFilms = async (req, res) => {
	try {
		// Parse pagination parameters from query string
		const page = parseInt(req.query.page, 10) || 1;
		const limit = parseInt(req.query.limit, 10) || 10;

		// Validate pagination parameters
		if (page < 1) {
			return handleError(res, 'Page parameter must be greater than 0');
		}
		if (limit < 1 || limit > 100) {
			return handleError(res, 'Limit parameter must be between 1 and 100');
		}

		const result = await Film.listAllPaginated(page, limit);

		if (!filmFound(result.films)) {
			return handleError(res, 'No list of films returned from film.listAllPaginated()');
		}
		return handleResponse(res, result);
	} catch (error) {
		return handleError(res, error);
	}
};

const handleResponse = (res, data) => {
	return res.json(data);
};

const extractTitle = file => {
	const title = path.parse(file.originalname).name;
	return title;
};

const handlePostFilm = async (req, res) => {
	const { file } = req;

	if (fileWasNotUploadedCorrectly(file)) {
		return handleError(res, 'No script submitted, please try again');
	}

	if (isNotCorrectFileFormat(file)) {
		return handleError(res, 'Please send a .txt script');
	}

	const title = extractTitle(file);
	const scriptPath = file.path;

	// Extract Claude API key from request body, headers, or environment
	const claudeApiKey = req.body.claudeApiKey || req.headers['x-claude-api-key'] || meta.CLAUDE_API_KEY;

	try {
		console.log(`Starting film processing for: "${title}"`);
		console.log('Request body:', req.body);
		console.log('Request file:', req.file);

		// Generate processId immediately
		const processId = `process_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		// Register the process immediately
		cleanupManager.registerProcess(processId, scriptPath, title);

		console.log('Sending response with processId:', processId);

		// Return processId immediately so client can connect to SSE
		res.json({
			success: true,
			processId: processId,
			title: title,
			message: 'Processing started. Connect to SSE for real-time updates.',
			enhancedAnalytics: !!claudeApiKey
		});

		// Process asynchronously
		processScript(scriptPath, title, processId, claudeApiKey).then(response => {
			console.log(`Film processing completed successfully for: "${title}"`);
		}).catch(error => {
			console.error(`Unexpected error during film processing for "${title}":`, error);
		});

	} catch (error) {
		console.error(`Unexpected error during film processing setup for "${title}":`, error);
		return handleError(res, `Failed to setup script processing: ${error.message}`, scriptPath);
	}
};


const handleGetFilm = async (req, res) => {
	try {
		const film = await Film.findByID(req.params.id);
		if (!film) {
			return handleError(res, 'No movie found by that ID');
		}
		return handleResponse(res, film);
	} catch (err) {
		return handleError(res, err);
	}
};

const handleGetCleanupStatus = async (req, res) => {
	try {
		const activeProcesses = cleanupManager.getActiveProcessesStatus();
		return handleResponse(res, {
			activeProcesses,
			totalActive: activeProcesses.length,
			cleanupEnabled: true
		});
	} catch (err) {
		return handleError(res, err);
	}
};

const handleForceCleanup = async (req, res) => {
	try {
		await cleanupManager.forceCleanupAll();
		return handleResponse(res, {
			success: true,
			message: 'Force cleanup completed successfully'
		});
	} catch (err) {
		return handleError(res, err);
	}
};

const handleCleanupDuplicateTitles = async (req, res) => {
	try {
		const result = await Film.cleanupDuplicateTitles();
		return handleResponse(res, {
			success: true,
			...result
		});
	} catch (err) {
		return handleError(res, err);
	}
};

const handleGetProcessResult = async (req, res) => {
	try {
		const { processId } = req.params;
		const processInfo = cleanupManager.getProcessInfo(processId);

		if (!processInfo) {
			return handleError(res, 'Process not found or expired');
		}

		if (processInfo.status === 'completed') {
			// Find the film by title since we don't have the film ID yet
			const films = await Film.findByTitle(processInfo.title);
			if (films && films.length > 0) {
				const film = films[0].toObject();
				return handleResponse(res, {
					...film,
					title: processInfo.title,
					success: true,
					cacheHit: false,
					processId: processId
				});
			} else {
				return handleError(res, 'Film not found after processing');
			}
		} else if (processInfo.status === 'failed') {
			return handleError(res, processInfo.error || 'Processing failed');
		} else {
			// Still processing
			return handleResponse(res, {
				success: false,
				status: 'processing',
				stage: processInfo.stage,
				progress: processInfo.progress,
				message: processInfo.message
			});
		}
	} catch (err) {
		return handleError(res, err);
	}
};

/*
 * FILM ROUTES
 */
router
	.route('/')
	.get(handleGetAllFilms)
	.post(upload.single('script'), handlePostFilm);

router
	.route('/cleanup/status')
	.get(handleGetCleanupStatus);

router
	.route('/cleanup/force')
	.post(handleForceCleanup);

router
	.route('/cleanup/duplicates')
	.post(handleCleanupDuplicateTitles);

router
	.route('/process/:processId')
	.get(handleGetProcessResult);

router
	.route('/:id')
	.get(handleGetFilm);

module.exports = router;
