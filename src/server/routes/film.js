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
const upload = multer({
	dest: 'uploads/',
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit
	},
	fileFilter: (req, file, cb) => {
		// Check file extension
		if (path.extname(file.originalname) !== '.txt') {
			return cb(new Error('Only .txt files are allowed'), false);
		}
		cb(null, true);
	}
});

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


const handleGetAllFilms = async (req, res) => {
	try {
		// Parse pagination parameters from query string
		const page = parseInt(req.query.page, 10) || 1;
		const limit = parseInt(req.query.limit, 10) || 10;
		const sortBy = req.query.sort || 'popularity';

		// Parse filter parameters
		const filters = {};

		// Bechdel pass/fail filter
		if (req.query.pass !== undefined && req.query.pass !== '') {
			filters.pass = req.query.pass;
		}

		// Genre filter (can be comma-separated or array)
		if (req.query.genres) {
			filters.genres = Array.isArray(req.query.genres)
				? req.query.genres
				: req.query.genres.split(',').map(g => g.trim());
		}

		// Year range filter
		if (req.query.yearMin) {
			filters.yearMin = req.query.yearMin;
		}
		if (req.query.yearMax) {
			filters.yearMax = req.query.yearMax;
		}

		// Minimum rating filter
		if (req.query.minRating) {
			filters.minRating = req.query.minRating;
		}

		// MPAA rating filter
		if (req.query.rated) {
			filters.rated = Array.isArray(req.query.rated)
				? req.query.rated
				: req.query.rated.split(',').map(r => r.trim());
		}

		// Validate pagination parameters
		if (page < 1) {
			return handleError(res, 'Page parameter must be greater than 0');
		}
		if (limit < 1 || limit > 100) {
			return handleError(res, 'Limit parameter must be between 1 and 100');
		}

		// Validate sort parameter
		const validSortOptions = [
			'popularity', 'rating', 'newest', 'oldest',
			'title-asc', 'title-desc', 'year-desc', 'year-asc', 'bechdel-score'
		];
		if (!validSortOptions.includes(sortBy)) {
			return handleError(res, `Invalid sort parameter. Must be one of: ${validSortOptions.join(', ')}`);
		}

		const result = await Film.listAllPaginated(page, limit, sortBy, filters);

		// Check if result is valid (not null/undefined) rather than checking if films array is empty
		if (!result || !result.films) {
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

	// Check for multer errors
	if (req.fileValidationError) {
		return handleError(res, req.fileValidationError);
	}

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
		console.log('Starting film processing for:', String(title).substring(0, 100));
		console.log('Request body:', JSON.stringify(req.body));
		console.log('Request file path:', req.file ? req.file.path : 'none');

		// Generate processId immediately
		const processId = `process_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		// Register the process immediately
		cleanupManager.registerProcess(processId, scriptPath, title);

		console.log('Sending response with processId:', processId);

		// Return processId immediately so client can connect to SSE
		res.json({
			success: true,
			processId,
			title,
			message: 'Processing started. Connect to SSE for real-time updates.',
			enhancedAnalytics: !!claudeApiKey
		});

		// Process asynchronously
		processScript(scriptPath, title, processId, claudeApiKey).then(response => {
			console.log('Film processing completed successfully for:', String(title).substring(0, 100));
		}).catch(error => {
			console.error('Unexpected error during film processing for:', String(title).substring(0, 100), error);
		});

	} catch (error) {
		console.error('Unexpected error during film processing setup for:', String(title).substring(0, 100), error);
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
					processId
				});
			} 
			return handleError(res, 'Film not found after processing');
			
		} if (processInfo.status === 'failed') {
			return handleError(res, processInfo.error || 'Processing failed');
		} 
		// Still processing
		return handleResponse(res, {
			success: false,
			status: 'processing',
			stage: processInfo.stage,
			progress: processInfo.progress,
			message: processInfo.message
		});
		
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
	.post(upload.single('script'), (err, req, res, next) => {
		if (err instanceof multer.MulterError) {
			if (err.code === 'LIMIT_FILE_SIZE') {
				return handleError(res, 'File too large. Maximum size is 10MB.');
			}
			return handleError(res, `Upload error: ${err.message}`);
		}
		if (err) {
			return handleError(res, err.message);
		}
		next();
	}, handlePostFilm);

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
