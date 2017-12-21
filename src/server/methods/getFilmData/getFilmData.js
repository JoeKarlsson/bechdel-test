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
			filmData.imdbID = simpleCastdata.data.movies[0].idIMDB;
			filmData.addMetaData(simpleCastdata);
			dataParser(simpleCastdata, 'mainCast');
			getFilmImages(filmData.imdbID).then(images => {
				filmData.images = images;
			});
			return getFullCastData(title).then(fullCastdata => {
				dataParser(fullCastdata, 'fullCast');
				return filmData.getAllData();
			});
		})
		.catch(err => {
			throw new Error(err);
		});
};

module.exports = getFilmData;
