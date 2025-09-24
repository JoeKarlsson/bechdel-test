const express = require('express');
const path = require('path');
const multer = require('multer');
const Film = require('../model/Film');
const filmData = require('../methods/getFilmData/FilmData');
const script = require('../methods/script');
const processScript = require('../methods/processScript');

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
	const response = await processScript(scriptPath, title);

	return handleResponse(res, response);
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

/*
 * FILM ROUTES
 */
router
	.route('/')
	.get(handleGetAllFilms)
	.post(upload.single('script'), handlePostFilm);

router
	.route('/:id')
	.get(handleGetFilm);

module.exports = router;
