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

filmSchema.static('cleanupDuplicateTitles', function () {
	const promise = new Promise((resolve, reject) => {
		// Get all films and normalize their titles for comparison
		this.find({})
			.then(allFilms => {
				// Group films by normalized title (lowercase, replace hyphens with spaces)
				const normalizedGroups = {};
				allFilms.forEach(film => {
					const normalizedTitle = film.title.toLowerCase().replace(/-/g, ' ').trim();
					if (!normalizedGroups[normalizedTitle]) {
						normalizedGroups[normalizedTitle] = [];
					}
					normalizedGroups[normalizedTitle].push(film);
				});

				// Find groups with duplicates
				const duplicates = Object.entries(normalizedGroups).filter(([normalizedTitle, films]) => films.length > 1);

				if (duplicates.length === 0) {
					return resolve({ message: 'No duplicates found', duplicatesRemoved: 0 });
				}

				// For each duplicate group, keep only the most recent one
				const cleanupPromises = duplicates.map(([normalizedTitle, films]) => {
					// Sort by dateUploaded descending to get the most recent
					const sortedFilms = films.sort((a, b) => new Date(b.dateUploaded) - new Date(a.dateUploaded));
					const keepFilm = sortedFilms[0];
					const deleteFilms = sortedFilms.slice(1);

					if (deleteFilms.length > 0) {
						const deleteIds = deleteFilms.map(film => film._id);
						return this.deleteMany({ _id: { $in: deleteIds } })
							.then(() => ({
								normalizedTitle,
								kept: keepFilm._id,
								keptTitle: keepFilm.title,
								deleted: deleteFilms.length,
								deletedTitles: deleteFilms.map(f => f.title)
							}));
					}
					return { normalizedTitle, kept: null, deleted: 0 };
				});

				return Promise.all(cleanupPromises)
					.then(results => {
						const totalDeleted = results.reduce((sum, result) => sum + result.deleted, 0);
						return resolve({
							message: `Cleaned up ${duplicates.length} duplicate title groups`,
							duplicatesRemoved: totalDeleted,
							details: results
						});
					});
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
			enhancedAnalytics,
			analyticsSummary,
			analysisMetadata,
		} = filmMetaData;

		// Normalize the title for comparison (lowercase, replace hyphens with spaces)
		const normalizedTitle = title.toLowerCase().replace(/-/g, ' ').trim();

		// First, find all films and delete those with normalized titles that match
		this.find({})
			.then(allFilms => {
				// Find films with matching normalized titles
				const filmsToDelete = allFilms.filter(film => {
					const filmNormalizedTitle = film.title.toLowerCase().replace(/-/g, ' ').trim();
					return filmNormalizedTitle === normalizedTitle;
				});

				if (filmsToDelete.length > 0) {
					const deleteIds = filmsToDelete.map(film => film._id);
					return this.deleteMany({ _id: { $in: deleteIds } });
				}
				return Promise.resolve();
			})
			.then(() => {
				// Create new film after deleting duplicates
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

				// Add enhanced analytics if provided
				if (enhancedAnalytics) {
					film.enhancedAnalytics = enhancedAnalytics;
				}
				if (analyticsSummary) {
					film.analyticsSummary = analyticsSummary;
				}
				if (analysisMetadata) {
					film.analysisMetadata = analysisMetadata;
				}

				return film.save();
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
