/*
  eslint
    no-unused-expressions: 0,
    func-names: 0,
    new-cap:0,
    arrow-body-style: 0
*/

require('./index.js');
const Promise = require('bluebird');
const mongoose = Promise.promisifyAll(require('mongoose'));
mongoose.Promise = require('bluebird');

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
	const promise = new Promise((resolve) => {
		this.find({ _id: id })
			.sort('-date')
			.exec()
			.then((result) => {
				if (Array.isArray(result)) {
					return resolve(result[0]);
				}
				return resolve(result);
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
			throw new Error('Cannot save film');
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
		throw new Error('Invalid input on deleteFilm');
	}
	return this.findOne({ _id: id }).exec()
		.then(film => film.remove())
		.catch((error) => {
			throw new Error(error);
		});
});

const parseActorArr = (arr) => {
	if (!arr) {
		throw new Error('Cannot parseActorArr');
	}
	const actorsArr = [];
	let i;
	for (i = 0; i < arr.length; i++) {
		const actor = {};
		actor.actorName = arr[i].actorName;
		actor.character = arr[i].character;
		actor.actorActress = arr[i].gender;
		actorsArr.push(actor);
	}
	return actorsArr;
};

const parseImageData = (images) => {
	if (!images) {
		throw new Error('Cannot parseImageData');
	}
	const img = {};

	img.backdrop = `https://image.tmdb.org/t/p/w1000${images.backdrops[0].file_path}`;
	img.poster = `https://image.tmdb.org/t/p/w300${images.posters[0].file_path}`;
	return img;
};

filmSchema.static('insert', function (filmTitle, bechdelResults, actors, images, data) {
	if (
		!filmTitle ||
		!bechdelResults ||
		!actors ||
		!images
	) {
		throw new Error('Cannot insert film into the database');
	}
	const film = new Film({ title: filmTitle });
	film.bechdelResults = bechdelResults;
	film.plot = data[0].plot;
	film.simplePlot = data[0].simplePlot;
	film.year = data[0].year;
	film.releaseDate = data[0].releaseDate;
	film.directors = data[0].directors;
	film.writers = data[0].writers;
	film.rated = data[0].rated;
	film.genres = data[0].genres;
	film.urlPoster = data[0].urlPoster;
	film.idIMDB = data[0].idIMDB;
	film.rating = data[0].rating;
	film.metascore = data[0].metascore;
	film.urlIMDB = data[0].urlIMDB;
	film.actors = parseActorArr(actors[0]);
	film.images = parseImageData(images);

	return this.saveFilm(film)
		.then((savedFilm) => {
			if (Array.isArray(savedFilm)) {
				return savedFilm[0];
			}
			return savedFilm;
		})
		.catch((error) => {
			throw new Error(error);
		});
});

const Film = mongoose.model('Film', filmSchema);

module.exports = Film;
