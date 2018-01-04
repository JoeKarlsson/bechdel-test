const filmData = require('./FilmData');
const dataParser = require('./dataParser');
const getDataFrom = require('./getDataFrom');
const URLFormatter = require('./URLFormatter');

const { createSimpleDataURL, createFullDataURL, createImageUrl } = URLFormatter;

const handleImageData = images => {
	filmData.images = images;
	return images;
};

const handleFullData = data => {
	filmData.addMetaData(data);
	dataParser(data, 'fullCast');
	return filmData.getAllData();
};

const handleSimpleData = data => {
	filmData.imdbID = data.data.movies[0].idIMDB;
	filmData.addMetaData(data);
	dataParser(data, 'mainCast');

	const imagesURL = createImageUrl(filmData.imdbID);
	getDataFrom(imagesURL).then(handleImageData);

	const fullURL = createFullDataURL(filmData.imdbID);
	return getDataFrom(fullURL).then(handleFullData);
};

const getFilmData = title => {
	const simpleURL = createSimpleDataURL(title);

	return getDataFrom(simpleURL)
		.then(handleSimpleData)
		.catch(err => {
			throw new Error(err);
		});
};

module.exports = getFilmData;
