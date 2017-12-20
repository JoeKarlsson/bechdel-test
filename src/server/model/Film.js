/* eslint
  func-names: 0,
  arrow-body-style: 0
*/

require('./index.js');
const mongoose = require('mongoose');
const parseData = require('./parseData');

mongoose.Promise = global.Promise;

const filmSchema = mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	plot: String,
	simplePlot: String,
	year: Number,
	releaseDate: String,
	actors: [{
		actorName: String,
		character: String,
		actorActress: String,
	}],
	directors: [{
		name: String,
		id: String,
	}],
	writers: [{
		name: String,
		id: String,
	}],
	rated: String,
	genres: [String],
	urlPoster: String,
	idIMDB: String,
	urlIMDB: String,
	rating: String,
	metascore: Number,
	createdAt: {
		type: Date,
		default: Date.now,
	},
	bechdelResults: {
		pass: Boolean,
		bechdelScore: Number,
		numScenesPass: Number,
		numScenesDontPass: Number,
		numOfFemalesChars: Number,
		numOfMaleChars: Number,
		numOfFemalesCharsWithDialogue: Number,
		numOfMaleCharsWithDialogue: Number,
		totalLinesFemaleDialogue: Number,
		totalLinesMaleDialogue: Number,
	},
	images: {
		backdrop: String,
		poster: String,
	},
});

filmSchema.static('listAll', function () {
	const promise = new Promise((resolve) => {
		this.find()
			.sort('-date')
			.exec()
			.then((result) => {
				return resolve(result);
			});
	});
	return promise;
});

filmSchema.static('findByID', function (id) {
	const promise = new Promise((resolve, reject) => {
		this.find({ _id: id })
			.sort('-date')
			.exec()
			.then((result) => {
				if (Array.isArray(result)) {
					return resolve(result[0]);
				}
				return resolve(result);
			})
			.catch((err) => {
				reject(new Error(err));
			});
	});
	return promise;
});

filmSchema.static('findByTitle', function (movieTitle) {
	const promise = new Promise((resolve, reject) => {
		if (!movieTitle) {
			reject(new Error('No film tile found'));
		}
		this.find({ title: movieTitle }).exec()
			.then((result) => {
				if (Array.isArray(result)) {
					return resolve(result[0]);
				}
				return resolve(result);
			})
			.catch((err) => {
				throw new Error(err);
			});
	});
	return promise;
});

filmSchema.static('saveFilm', (film) => {
	const promise = new Promise((resolve, reject) => {
		if (!film) {
			reject(new Error('Cannot save film'));
		}
		film.save()
			.then((result) => {
				resolve(result);
			})
			.catch((err) => {
				reject(new Error(err));
			});
	});
	return promise;
});

filmSchema.static('deleteFilm', function (id) {
	if (!id) {
		return 'Invalid input on deleteFilm';
	}
	return this.findOne({ _id: id }).exec()
		.then(film => film.remove)
		.then(() => true)
		.catch((error) => {
			throw new Error(error);
		});
});

filmSchema.static('insert', function (filmMetaData) {
	const {
		filmTitle,
		bechdelResults,
		actors,
		images,
		data,
	} = filmMetaData;

	const film = new Film({ title: filmTitle });
	film.bechdelResults = bechdelResults;
	film.plot = data.plot;
	film.simplePlot = data.simplePlot;
	film.year = data.year;
	film.releaseDate = data.releaseDate;
	film.directors = data.directors;
	film.writers = data.writers;
	film.rated = data.rated;
	film.genres = data.genres;
	film.urlPoster = data.urlPoster;
	film.idIMDB = data.idIMDB;
	film.rating = data.rating;
	film.metascore = data.metascore;
	film.urlIMDB = data.urlIMDB;
	film.actors = parseData.parseActorArr(actors);
	film.images = parseData.parseImageData(images);

	return this.saveFilm(film)
		.then((savedFilm) => {
			if (Array.isArray(savedFilm)) {
				// resolve(savedFilm[0]);
				console.log('hiut');
				return savedFilm[0];
			}
			console.log('hit');
			// resolve(savedFilm);
			return savedFilm;
		})
		.catch((error) => {
			throw new Error(error);
		});
});

const Film = mongoose.model('Film', filmSchema);

module.exports = Film;
