const express = require('express');
const path = require('path');
const Film = require('../model/Film');
const filmData = require('../methods/getFilmData/FilmData');
const script = require('../methods/script');
const getBechdelResults = require('../methods/bechdel/bechdel');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const handleFilmFoundInDB = (res, film, scriptPath) => {
	script.clearTemp(scriptPath);
	return res.json({
		...film,
		success: true,
		cacheHit: true,
	});
};

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
	console.log(errMsg);
	return res.status(500).send(errMsg);
};

const filmFound = film => {
	return film.length > 0;
};

/*
  * FILM ROUTES
*/
router
	.route('/')
	.get((req, res) => {
		Film.listAll()
			.then(films => {
				if (!films) {
					return handleError(
						res,
						'No list of films returned from film.listAll()'
					);
				}
				res.send(films);
			})
			.catch(err => {
				res.status(500).send(err);
				throw new Error(err);
			});
	})
	.post(upload.single('script'), async (req, res) => {
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
				console.log('hit');
				return handleError(res, 'Error reading script');
			}
			const film = await Film.findByTitle(title);
			if (filmFound(film)) {
				return handleFilmFoundInDB(res, film, scriptPath);
			}
			const bechdelResults = await getBechdelResults(title, scriptPath);
			console.log(bechdelResults, 'bechdelResults');
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

			filmData.clear();
			script.clearTemp(scriptPath);

			return res.json({
				...finalFilm,
				title,
				success: true,
				cacheHit: false,
			});
		} catch (err) {
			console.error(err);
			filmData.clear();
			script.clearTemp(scriptPath);
			return res.status(500).send('Please try again');
		}
	});

router
	.route('/:id')
	.get((req, res) => {
		Film.findByID(req.params.id)
			.then(movie => {
				if (!movie) {
					return res.send('No movie found by that ID');
				}
				return res.status(200).send(movie);
			})
			.catch(err => {
				return res.status(500).send(err);
			});
	})
	.delete((req, res) => {
		Film.deleteFilm(req.params.id)
			.then(movie => {
				if (!movie) {
					return res.send('No movie found by that ID');
				}
				return res.json({ success: true });
			})
			.catch(err => {
				res.status(500).send(err);
				throw new Error(err);
			});
	});

module.exports = router;
