/* eslint
  func-names: 0,
  arrow-body-style: 0
*/

require('./index.js');
const mongoose = require('mongoose');
const parseData = require('./parseData');
const schema = require('./schema');

mongoose.Promise = global.Promise;

const filmSchema = mongoose.Schema(schema);

filmSchema.static('listAll', function () {
	const promise = new Promise((resolve, reject) => {
		this.find()
			.sort('-dateUploaded')
			.exec()
			.then(result => {
				return resolve(result);
			})
			.catch(err => {
				reject(new Error(err));
			});
	});
	return promise;
});

filmSchema.static('listAllPaginated', function (page = 1, limit = 10) {
	const promise = new Promise((resolve, reject) => {
		const skip = (page - 1) * limit;

		Promise.all([
			this.find()
				.sort('-dateUploaded')
				.skip(skip)
				.limit(limit)
				.exec(),
			this.countDocuments()
		])
			.then(([films, totalCount]) => {
				const totalPages = Math.ceil(totalCount / limit);
				const hasNextPage = page < totalPages;
				const hasPrevPage = page > 1;

				return resolve({
					films,
					pagination: {
						currentPage: page,
						totalPages,
						totalCount,
						limit,
						hasNextPage,
						hasPrevPage
					}
				});
			})
			.catch(err => {
				reject(new Error(err));
			});
	});
	return promise;
});

filmSchema.static('findByID', function (id) {
	const promise = new Promise((resolve, reject) => {
		this.find({ _id: id })
			.sort('-dateUploaded')
			.exec()
			.then(result => {
				if (Array.isArray(result)) {
					return resolve(result[0]);
				}
				return resolve(result);
			})
			.catch(err => {
				reject(new Error(err));
			});
	});
	return promise;
});

filmSchema.static('findByTitle', function (title) {
	const promise = new Promise((resolve, reject) => {
		if (!title) {
			reject(new Error('No film tile found'));
		}
		this.find({ title })
			.exec()
			.then(result => {
				return resolve(result);
			})
			.catch(err => {
				reject(new Error(err));
			});
	});
	return promise;
});

filmSchema.static('deleteFilm', function (id) {
	if (!id) {
		return 'Invalid input on deleteFilm';
	}
	return this.findOne({ _id: id })
		.exec()
		.then(film => film.remove)
		.then(() => true)
		.catch(error => {
			throw new Error(error);
		});
});

filmSchema.static('insertFilm', filmMetaData => {
	const promise = new Promise((resolve, reject) => {
		const {
			title,
			bechdelResults,
			bechdelData,
			actors,
			images,
			data,
		} = filmMetaData;
		const film = new Film({ title: data.title });
		film.title = data.title;
		film.bechdelResults = bechdelResults;
		film.bechdelData = bechdelData;
		film.plot = data.plot;
		film.simplePlot = data.plot; // Use plot as simplePlot for OMDB
		film.year = data.year;
		film.releaseDate = data.released;

		// Parse comma-separated strings into arrays of objects
		film.directors = data.director ? data.director.split(',').map(name => ({ name: name.trim() })) : [];
		film.writers = data.writer ? data.writer.split(',').map(name => ({ name: name.trim() })) : [];
		film.awards = data.awards ? [{ name: data.awards }] : [];

		film.rated = data.rated;
		film.genres = data.genre ? data.genre.split(',').map(genre => genre.trim()) : [];
		film.urlPoster = data.poster;
		film.idIMDB = data.idIMDB;
		film.rating = data.imdbRating;
		film.metascore = data.metascore && data.metascore !== 'N/A' ? parseInt(data.metascore, 10) : null;
		film.urlIMDB = `https://www.imdb.com/title/${data.idIMDB}/`;
		film.actors = parseData.parseActorArr(actors);
		film.images = parseData.parseImageData(images);
		film.dateUploaded = new Date(); // Set the upload date

		return film
			.save()
			.then(result => {
				return resolve(result);
			})
			.catch(err => {
				return reject(new Error(err));
			});
	});
	return promise;
});

filmSchema.static('updateOrInsertFilm', function (filmMetaData) {
	const promise = new Promise((resolve, reject) => {
		const {
			title,
			bechdelResults,
			bechdelData,
			actors,
			images,
			data,
		} = filmMetaData;

		// First, try to find existing film by title
		this.findOne({ title })
			.then(existingFilm => {
				if (existingFilm) {
					// Update existing film
					existingFilm.bechdelResults = bechdelResults;
					existingFilm.bechdelData = bechdelData;
					existingFilm.plot = data.plot;
					existingFilm.simplePlot = data.plot;
					existingFilm.year = data.year;
					existingFilm.releaseDate = data.released;
					existingFilm.directors = data.director ? data.director.split(',').map(name => ({ name: name.trim() })) : [];
					existingFilm.writers = data.writer ? data.writer.split(',').map(name => ({ name: name.trim() })) : [];
					existingFilm.awards = data.awards ? [{ name: data.awards }] : [];
					existingFilm.rated = data.rated;
					existingFilm.genres = data.genre ? data.genre.split(',').map(genre => genre.trim()) : [];
					existingFilm.urlPoster = data.poster;
					existingFilm.idIMDB = data.idIMDB;
					existingFilm.rating = data.imdbRating;
					existingFilm.metascore = data.metascore && data.metascore !== 'N/A' ? parseInt(data.metascore, 10) : null;
					existingFilm.urlIMDB = `https://www.imdb.com/title/${data.idIMDB}/`;
					existingFilm.actors = parseData.parseActorArr(actors);
					existingFilm.images = parseData.parseImageData(images);
					existingFilm.dateUploaded = new Date(); // Update the upload date

					return existingFilm.save();
				} else {
					// Create new film
					const film = new Film({ title: data.title });
					film.title = data.title;
					film.bechdelResults = bechdelResults;
					film.bechdelData = bechdelData;
					film.plot = data.plot;
					film.simplePlot = data.plot;
					film.year = data.year;
					film.releaseDate = data.released;
					film.directors = data.director ? data.director.split(',').map(name => ({ name: name.trim() })) : [];
					film.writers = data.writer ? data.writer.split(',').map(name => ({ name: name.trim() })) : [];
					film.awards = data.awards ? [{ name: data.awards }] : [];
					film.rated = data.rated;
					film.genres = data.genre ? data.genre.split(',').map(genre => genre.trim()) : [];
					film.urlPoster = data.poster;
					film.idIMDB = data.idIMDB;
					film.rating = data.imdbRating;
					film.metascore = data.metascore && data.metascore !== 'N/A' ? parseInt(data.metascore, 10) : null;
					film.urlIMDB = `https://www.imdb.com/title/${data.idIMDB}/`;
					film.actors = parseData.parseActorArr(actors);
					film.images = parseData.parseImageData(images);
					film.dateUploaded = new Date();

					return film.save();
				}
			})
			.then(result => {
				return resolve(result);
			})
			.catch(err => {
				return reject(new Error(err));
			});
	});
	return promise;
});

const Film = mongoose.model('Film', filmSchema);

module.exports = Film;
