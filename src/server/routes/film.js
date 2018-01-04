const express = require('express');
const path = require('path');
const Film = require('../model/Film');
const filmData = require('../methods/getFilmData/FilmData');
const script = require('../methods/script');
const getBechdelResults = require('../methods/bechdel/getBechdelResults');
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

const errorReadingScript = title => {
	const titleExists = !title;
	return titleExists;
};

const handleError = (res, errMsg) => {
	console.error(errMsg);
	return res.status(500).send(errMsg);
};

const filmFound = film => {
	return film.length > 0;
};

const resetAll = scriptPath => {
	filmData.clear();
	script.clearTemp(scriptPath);
	return true;
};

const handleFilmFoundInDB = (res, film, scriptPath) => {
	script.clearTemp(scriptPath);
	const response = {
		...film,
		success: true,
		cacheHit: true,
	};
	return handleResponse(res, response);
};

const handleGetAllFilms = async (req, res) => {
	try {
		const films = await Film.listAll();
		if (!filmFound) {
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

const handlePostFilm = async (req, res) => {
	const { file } = req;
	const scriptPath = file.path;

	if (fileWasNotUploadedCorrectly(file)) {
		return handleError(res, 'No script submitted, please try again');
	}
	if (isNotCorrectFileFormat(file)) {
		return handleError(res, 'Please send a .txt script');
	}
	try {
		const title = await script.readMovieTitle(scriptPath);
		if (errorReadingScript(title)) {
			return handleError(res, 'Error reading script');
		}
		const film = await Film.findByTitle(title);
		if (filmFound(film)) {
			return handleFilmFoundInDB(res, film, scriptPath);
		}
		const bechdelResults = await getBechdelResults(title, scriptPath);
		const { actors, images, metadata } = filmData.getAllData();

		const filmMetaData = {
			title,
			bechdelResults,
			actors,
			images,
			data: metadata,
		};
		await Film.insertFilm(filmMetaData);
		const finalFilm = await Film.findByTitle(title);

		resetAll(scriptPath);

		const response = {
			...finalFilm,
			title,
			success: true,
			cacheHit: false,
		};
		return handleResponse(res, response);
	} catch (err) {
		resetAll(scriptPath);
		return handleError(res, 'Please try again');
	}
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
	.post(upload.single('script'), handlePostFilm);

router
	.route('/:id')
	.get(handleGetFilm)
	.delete(handleDeleteFilm);

module.exports = router;
