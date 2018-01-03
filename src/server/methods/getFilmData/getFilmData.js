const filmData = require('./FilmData');
const dataParser = require('./dataParser');
const getDataFrom = require('./getDataFrom');
const URLFormatter = require('./URLFormatter');

const { createSimpleDataURL, createFullDataURL, createImageUrl } = URLFormatter;

const getFilmData = title => {
	const simpleURL = createSimpleDataURL(title);

	return getDataFrom(simpleURL)
		.then(simpleCastdata => {
			filmData.imdbID = simpleCastdata.data.movies[0].idIMDB;
			filmData.addMetaData(simpleCastdata);
			dataParser(simpleCastdata, 'mainCast');
			const imagesURL = createImageUrl(filmData.imdbID);

			getDataFrom(imagesURL).then(images => {
				filmData.images = images;
			});

			const fullURL = createFullDataURL(filmData.imdbID);

			return getDataFrom(fullURL).then(fullCastdata => {
				filmData.addMetaData(fullCastdata);
				dataParser(fullCastdata, 'fullCast');
				return filmData.getAllData();
			});
		})
		.catch(err => {
			throw new Error(err);
		});
};

module.exports = getFilmData;
