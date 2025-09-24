const Film = require('../model/Film');
const filmData = require("./getFilmData/FilmData");
const script = require("./script");
const getBechdelResults = require('./bechdel/getBechdelResults');

const resetAll = scriptPath => {
	filmData.clear();
	script.clearTemp(scriptPath);
	return true;
};

const handleError = (err, scriptPath) => {
	if (scriptPath) {
		resetAll(scriptPath);
	}
	console.error(err);
	return err;
};

const handleFilmFoundInDB = (film, scriptPath) => {
	resetAll(scriptPath);
	const response = {
		...film,
		success: true,
		cacheHit: true,
	};
	return response;
};

const filmFound = film => {
	return film.length > 0;
};

const processScript = async (scriptPath, title) => {
	try {
		console.log('title', title);

		const bechdelResults = await getBechdelResults(title, scriptPath);

		const { actors, images, metadata, bechdelData } = filmData.getAllData();

		const filmMetaData = {
			title,
			bechdelResults,
			bechdelData,
			actors,
			images,
			data: metadata,
		};

		// Use updateOrInsertFilm to replace existing films or create new ones
		const savedFilm = await Film.updateOrInsertFilm(filmMetaData);
		const finalFilm = await Film.findByTitle(title);

		resetAll(scriptPath);

		const response = {
			...finalFilm[0].toObject(),
			title,
			success: true,
			cacheHit: false,
		};
		console.log('saved/updated film');
		return response;
	} catch (err) {
		console.error('Error processing script:', err);
		return handleError(err, scriptPath);
	}
};

module.exports = processScript;
