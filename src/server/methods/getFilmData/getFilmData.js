const filmData = require('./FilmData');
const dataParser = require('./dataParser');
const getDataFrom = require('./getDataFrom');
const URLFormatter = require('./URLFormatter');

const {
	createSimpleDataURL,
	createFilmCreditsURL,
	createImageUrl,
	createBechdelUrl,
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

const handleBechdelData = async () => {
	try {
		const bechdelURL = createBechdelUrl(filmData.imdbID);
		const bechdelData = await getDataFrom(bechdelURL);

		if (notValidData(bechdelData)) {
			handleError('imageData not valid');
		}
		filmData.bechdelData = bechdelData;
		return bechdelData;
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

		// OMDB API returns data directly, not nested in data.movies array
		const simpleMetaData = data;

		if (notValidData(simpleMetaData) || simpleMetaData.Response === 'False') {
			handleError('simpleMetaData not valid');
		}

		// Map OMDB fields to expected format
		const mappedData = {
			idIMDB: simpleMetaData.imdbID,
			title: simpleMetaData.Title,
			year: simpleMetaData.Year,
			rated: simpleMetaData.Rated,
			released: simpleMetaData.Released,
			runtime: simpleMetaData.Runtime,
			genre: simpleMetaData.Genre,
			director: simpleMetaData.Director,
			writer: simpleMetaData.Writer,
			actors: simpleMetaData.Actors, // This will be a comma-separated string
			plot: simpleMetaData.Plot,
			language: simpleMetaData.Language,
			country: simpleMetaData.Country,
			awards: simpleMetaData.Awards,
			poster: simpleMetaData.Poster,
			ratings: simpleMetaData.Ratings,
			metascore: simpleMetaData.Metascore,
			imdbRating: simpleMetaData.imdbRating,
			imdbVotes: simpleMetaData.imdbVotes,
			type: simpleMetaData.Type,
			dvd: simpleMetaData.DVD,
			boxOffice: simpleMetaData.BoxOffice,
			production: simpleMetaData.Production,
			website: simpleMetaData.Website
		};

		filmData.imdbID = mappedData.idIMDB;
		filmData.addMetaData(mappedData);

		await handleImageData();
		await handleBechdelData();
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
