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
			try {
				const data = simpleCastdata.data.movies[0];
				const { actors } = data;
				filmData.imdbID = data.idIMDB;
				filmData.addMetaData(data);
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
						const data = fullCastdata.data.movies[0];
						const { actors } = data;
						dataParser(actors, 'fullCast');
						filmData.addMetaData(data);
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
