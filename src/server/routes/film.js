const express = require('express');
const path = require('path');
const Film = require('../model/Film');
const filmData = require('../methods/getFilmData/FilmData');
const script = require('../methods/script');
const processScript = require('../methods/processScript');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const isNotCorrectFileFormat = file => {
	return path.extname(file.originalname) !== '.txt';
};

const fileWasNotUploadedCorrectly = file => {
	const exists = !file;
	return exists;
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
		const films = await Film.listAll();

		if (!filmFound(films)) {
			return handleError(res, 'No list of films returned from film.listAll()');
		}
		return handleResponse(res, films);
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
	const { files } = req;

	if (fileWasNotUploadedCorrectly(files)) {
		return handleError(res, 'No script submitted, please try again');
	}

	files.forEach(async (file, i) => {
		if (fileWasNotUploadedCorrectly(file)) {
			return handleError(res, 'No script submitted, please try again');
		}
		if (isNotCorrectFileFormat(file)) {
			return handleError(res, 'Please send a .txt script');
		}
		const title = extractTitle(file);
		const scriptPath = file.path;
		const response = await processScript(scriptPath, title);

		if (i === files.length - 1) {
			return handleResponse(res, response);
		}
	});
};

const handleDeleteFilm = async (req, res) => {
	try {
		const success = await Film.deleteFilm(req.params.id);

		if (success) {
			const response = { success: true };
			return handleResponse(res, response);
		}
		return handleError(res, 'No movie found by that ID');
	} catch (err) {
		return handleError(res, err);
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

/*
 * FILM ROUTES
 */
router
	.route('/')
	.get(handleGetAllFilms)
	.post(upload.array('script'), handlePostFilm);

router
	.route('/:id')
	.get(handleGetFilm)
	.delete(handleDeleteFilm);

module.exports = router;
