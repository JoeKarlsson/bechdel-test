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

		// Check if we have an IMDB ID
		if (!filmData.imdbID) {
			console.warn('No IMDB ID available, skipping image fetch');
			filmData.images = { backdrop: '', poster: '' };
			return filmData.images;
		}

		const imagesURL = createImageUrl(filmData.imdbID);
		const images = await getDataFrom(imagesURL);
		if (notValidData(images)) {
			console.warn('Image data not valid, using empty images');
			filmData.images = { backdrop: '', poster: '' };
			return filmData.images;
		}
		filmData.images = images;
		return images;
	} catch (err) {
		console.error('Error fetching images:', err.message);
		// Set fallback empty images instead of throwing
		filmData.images = { backdrop: '', poster: '' };
		throw err; // Still throw to mark as rejected in Promise.allSettled
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
		// Use allSettled to handle partial failures gracefully
		const results = await Promise.allSettled([
			handleImageData(processId),
			handleBechdelData(processId),
			handleGetCredits(processId)
		]);

		// Log any failures but continue with available data
		const [imagesResult, bechdelResult, creditsResult] = results;

		if (imagesResult.status === 'rejected') {
			console.error('Failed to fetch TMDB images:', imagesResult.reason);
			// Set empty images as fallback
			filmData.images = { backdrop: '', poster: '' };
		}

		if (bechdelResult.status === 'rejected') {
			console.error('Failed to fetch Bechdel API data:', bechdelResult.reason);
			// Bechdel data is optional, continue without it
		}

		if (creditsResult.status === 'rejected') {
			console.error('Failed to fetch TMDB credits:', creditsResult.reason);
			// Credits data is optional, continue without it
		}

		// Update progress after all API calls complete
		const successCount = results.filter(r => r.status === 'fulfilled').length;
		if (processId) {
			const cleanupManager = require('../../helper/cleanupManager');
			cleanupManager.setProcessMessage(processId, `Film data retrieved (${successCount}/3 API calls successful)`);
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
