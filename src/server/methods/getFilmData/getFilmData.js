const filmData = require('./FilmData');
const dataParser = require('./dataParser');
const getDataFrom = require('./getDataFrom');
const URLFormatter = require('./URLFormatter');

const { createSimpleDataURL, createFullDataURL, createImageUrl } = URLFormatter;

const handleError = err => {
	console.error(err);
	throw new Error(err);
};

const notValidData = data => {
	if (!data) {
		return true;
	}
	return false;
};

const handleImageData = async () => {
	try {
		const imagesURL = createImageUrl(filmData.imdbID);
		const images = await getDataFrom(imagesURL);

		if (notValidData(images)) {
			handleError('imageData not valid');
		}
		filmData.images = images;
		return images;
	} catch (err) {
		return handleError(err);
	}
};

const handleFullData = async () => {
	try {
		const fullURL = createFullDataURL(filmData.imdbID);
		const fullData = await getDataFrom(fullURL);
		const fullMetaData = fullData.data.movies[0];

		if (notValidData(fullMetaData)) {
			handleError('fullMetaData not valid');
		}
		filmData.addMetaData(fullMetaData);
		return dataParser(fullMetaData, 'fullCast');
	} catch (err) {
		return handleError(err);
	}
};

const handleSimpleData = async title => {
	try {
		const simpleURL = createSimpleDataURL(title);
		const data = await getDataFrom(simpleURL);
		const simpleMetaData = data.data.movies[0];

		if (notValidData(simpleMetaData)) {
			handleError('simpleMetaData not valid');
		}

		filmData.imdbID = simpleMetaData.idIMDB;
		filmData.addMetaData(simpleMetaData);
		dataParser(simpleMetaData, 'mainCast');

		handleImageData();
		await handleFullData();
		return filmData.getAllData();
	} catch (err) {
		return handleError(err);
	}
};

const getFilmData = title => {
	return handleSimpleData(title);
};

module.exports = getFilmData;
