const filmData = require('./FilmData');
const dataParser = require('./dataParser');
const getDataFrom = require('./getDataFrom');
const URLFormatter = require('./URLFormatter');

const {
	createSimpleDataURL,
	createFilmCreditsURL,
	createImageUrl,
} = URLFormatter;

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

const handleGetCredits = async () => {
	try {
		const castURL = createFilmCreditsURL(filmData.imdbID);
		const castData = await getDataFrom(castURL);

		if (notValidData(castData)) {
			handleError('castData not valid');
		}
		const { cast } = castData;
		const cleanCastData = dataParser(cast);
		filmData.addActors(cleanCastData);
		return cleanCastData;
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

		handleImageData();
		await handleGetCredits();
		return filmData.getAllData();
	} catch (err) {
		return handleError(err);
	}
};

const getFilmData = title => {
	return handleSimpleData(title);
};

module.exports = getFilmData;
