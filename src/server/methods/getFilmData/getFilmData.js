const filmData = require('./FilmData');
const dataParser = require('./dataParser');
const getFilmImages = require('./getFilmImages');
const getSimpleCastData = require('./getSimpleCastData');
const getFullCastData = require('./getFullCastData');

const splitTitle = title => {
	return title.split(' ').join('+');
};

const getFilmData = movieTitle => {
	const title = splitTitle(movieTitle);

	return getSimpleCastData(title)
		.then(simpleCastdata => {
			console.log(title);
			try {
				const data = simpleCastdata.data.movies[0];
				filmData.imdbID = data.idIMDB;
				filmData.addMetaData(data);
				const { actors } = data;
				dataParser(actors, 'mainCast');
			} catch (err) {
				console.log(err);
			}
			getFilmImages(filmData.imdbID)
				.then(images => {
					filmData.images = images;
				})
				.catch(error => {
					throw new Error(error);
				});
			return getFullCastData(filmData.imdbID)
				.then(fullCastdata => {
					try {
						const { actors } = fullCastdata.data.movies[0];
						dataParser(actors, 'fullCast');
						return filmData.getAllData();
					} catch (err) {
						console.log(err);
					}
				})
				.catch(error => {
					throw new Error(error);
				});
		})
		.catch(err => {
			throw new Error(err);
		});
};

module.exports = getFilmData;
