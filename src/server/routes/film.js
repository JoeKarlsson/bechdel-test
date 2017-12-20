const express = require('express');
const path = require('path');
const Film = require('../model/Film');
const FilmData = require('../methods/getFilmData/FilmData');
const script = require('../methods/script');
const getBechdelResults = require('../methods/bechdel/bechdel');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

/*
  * FILM ROUTES
*/
router.route('/')
	.get((req, res) => {
		Film.listAll()
			.then((films) => {
				if (!films) {
					res.status(500).send('No list of films returned from film.listAll()');
					throw new Error('No list of films returned from film.listAll()');
				}
				res.send(films);
			})
			.catch((err) => {
				res.status(500).send(err);
				throw new Error(err);
			});
	})
	.post(upload.single('script'), (req, res) => {
		let filmTitle;
		const { file } = req;
		const scriptPath = file.path;

		if (!file) {
			res.status(500).send('No script submitted, please try again');
		} else {
			if (path.extname(file.originalname) !== '.txt') {
				res.status(500).send('Please send a .txt script');
			}

			script.readMovieTitle(scriptPath)
				.then((title) => {
					if (!title) {
						res.status(500).send('No movie returned from script.readMovieTitle(scriptPath)');
						throw new Error('No movie returned from script.readMovieTitle(scriptPath)');
					}
					filmTitle = title;
					return Film.findByTitle(filmTitle);
				})
				.then((movie) => {
					if (movie.title) {
						script.clearTemp(scriptPath);
						return res.status(200).send(movie);
					}
					getBechdelResults(filmTitle, scriptPath)
						.then((bechdelResults) => {
							const data = FilmData.getAllData();
							console.log('hit');
							console.log('data', data);
							return Film.insert(
								filmTitle,
								bechdelResults,
								data.actors,
								data.images,
								data.data[0].data.movies,
							);
						})
						.then((savedFilm) => {
							console.log('savedFilm', savedFilm);
							if (!savedFilm) {
								return res.status(500).send('Film not properly saved.');
							}
							FilmData.clearData();
							script.clearTemp(scriptPath);
							return res.send(savedFilm);
						})
						.catch((err) => {
							return res.status(500).send(err);
						});
				})
				.catch((err) => {

					// res.status(500).send(err);
					throw new Error(err);
				})
				.error((err) => {
					res.status(500).send(err);
					throw new Error(err);
				});
		}
	});

router.route('/:id')
	.get((req, res) => {
		Film.findByID(req.params.id)
			.then((movie) => {
				if (!movie) {
					return res.send('No movie found by that ID');
				}
				return res.status(200).send(movie);
			})
			.catch((err) => {
				return res.status(500).send(err);
			});
	})
	.delete((req, res) => {
		Film.deleteFilm(req.params.id)
			.then((movie) => {
				if (!movie) {
					return res.send('No movie found by that ID');
				}
				return res.json({ success: true });
			})
			.catch((err) => {
				res.status(500).send(err);
				throw new Error(err);
			});
	});

module.exports = router;
