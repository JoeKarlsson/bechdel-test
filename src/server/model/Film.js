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
	actors: [
		{
			actorName: String,
			character: String,
			actorActress: String,
		},
	],
	directors: [
		{
			name: String,
			id: String,
		},
	],
	writers: [
		{
			name: String,
			id: String,
		},
	],
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

filmSchema.static('listAll', function() {
	const promise = new Promise(resolve => {
		this.find()
			.sort('-date')
			.exec()
			.then(result => {
				return resolve(result);
			});
	});
	return promise;
});

filmSchema.static('findByID', function(id) {
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

filmSchema.static('findByTitle', function(title) {
	const promise = new Promise((resolve, reject) => {
		if (!title) {
			reject(new Error('No film tile found'));
		}
		this.find({ title })
			.exec()
			.then(result => {
				if (result.length === 0) {
					reject(new Error('film not found'));
				}
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

filmSchema.static('deleteFilm', function(id) {
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
		const { title, bechdelResults, actors, images, data } = filmMetaData;
		const film = new Film({ title });
		film.title = title;
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
