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
			.sort('-date')
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

filmSchema.static('findByID', function (id) {
	const promise = new Promise((resolve, reject) => {
		this.find({ _id: id })
			.sort('-date')
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
		const film = new Film({ title });
		film.title = title;
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
		film.metascore = data.metascore;
		film.urlIMDB = `https://www.imdb.com/title/${data.idIMDB}/`;
		film.actors = parseData.parseActorArr(actors);
		film.images = parseData.parseImageData(images);

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

const Film = mongoose.model('Film', filmSchema);

module.exports = Film;
