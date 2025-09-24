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

const handleImageData = async (processId = null) => {
	try {
		// Update stage to TMDB images
		if (processId) {
			const cleanupManager = require('../../helper/cleanupManager');
			cleanupManager.updateProcessStage(processId, 'tmdb_images');
		}

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

const handleBechdelData = async (processId = null) => {
	try {
		// Update stage to Bechdel API
		if (processId) {
			const cleanupManager = require('../../helper/cleanupManager');
			cleanupManager.updateProcessStage(processId, 'bechdel_api');
		}

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

const handleGetCredits = async (processId = null) => {
	try {
		// Update stage to TMDB credits
		if (processId) {
			const cleanupManager = require('../../helper/cleanupManager');
			cleanupManager.updateProcessStage(processId, 'tmdb_credits');
		}

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

const handleSimpleData = async (title, processId = null) => {
	try {
		// Update stage to OMDB API
		if (processId) {
			const cleanupManager = require('../../helper/cleanupManager');
			cleanupManager.updateProcessStage(processId, 'omdb_api');
		}

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

		// Update progress after OMDB data is retrieved
		if (processId) {
			const cleanupManager = require('../../helper/cleanupManager');
			cleanupManager.setProcessMessage(processId, 'OMDB data retrieved, fetching additional data...');
		}

		// Run these API calls in parallel for faster processing
		await Promise.all([
			handleImageData(processId),
			handleBechdelData(processId),
			handleGetCredits(processId)
		]);

		// Update progress after all API calls complete
		if (processId) {
			const cleanupManager = require('../../helper/cleanupManager');
			cleanupManager.setProcessMessage(processId, 'All film data retrieved successfully!');
		}

		return filmData.getAllData();
	} catch (err) {
		return handleError(err);
	}
};

const getFilmData = (title, processId = null) => {
	return handleSimpleData(title, processId);
};

module.exports = getFilmData;
