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
};

const handleSimpleData = async data => {
	filmData.imdbID = data.data.movies[0].idIMDB;
	filmData.addMetaData(data);
	dataParser(data, 'mainCast');

	try {
		const imagesURL = createImageUrl(filmData.imdbID);
		const imageData = await getDataFrom(imagesURL);
		handleImageData(imageData);

		const fullURL = createFullDataURL(filmData.imdbID);
		const fullData = await getDataFrom(fullURL);
		handleFullData(fullData);
		return filmData.getAllData();
	} catch (err) {
		throw new Error(err);
	}
};

const getFilmData = async title => {
	const simpleURL = createSimpleDataURL(title);
	try {
		const data = await getDataFrom(simpleURL);
		return handleSimpleData(data);
	} catch (err) {
		throw new Error(err);
	}
};

module.exports = getFilmData;
