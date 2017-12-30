const express = require('express');
const path = require('path');
const Film = require('../model/Film');
const getFilmData = require('../methods/getFilmData/getFilmData');
const filmData = require('../methods/getFilmData/FilmData');
const script = require('../methods/script');
const getBechdelResults = require('../methods/bechdel/bechdel');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

/*
  * FILM ROUTES
*/
router
	.route('/')
	.get((req, res) => {
		Film.listAll()
			.then(films => {
				if (!films) {
					res.status(500).send('No list of films returned from film.listAll()');
					throw new Error('No list of films returned from film.listAll()');
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

		if (!file) {
			return res.status(500).send('No script submitted, please try again');
		}
		if (path.extname(file.originalname) !== '.txt') {
			return res.status(500).send('Please send a .txt script');
		}
		try {
			const title = await script.readMovieTitle(scriptPath);
			const film = await Film.findByTitle(title);
			if (film.title) {
				script.clearTemp(scriptPath);
				return res.json({
					...film,
					title,
					success: true,
					cacheHit: true,
				});
			}
			const bechdelResults = await getBechdelResults(title, scriptPath);
			const data = await getFilmData();

			const filmMetaData = {
				title,
				bechdelResults,
				actors: data.actors,
				images: data.images,
				data: data.metadata,
			};
			await Film.insertFilm(filmMetaData);
			const finalFilm = await Film.findByTitle(title);

			filmData.clear();
			script.clearTemp(scriptPath);

			res.json({
				...finalFilm,
				title,
				success: true,
				cacheHit: false,
			});
		} catch (err) {
			console.log(err);
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
