const Film = require('../model/Film');
const filmData = require('../methods/getFilmData/FilmData');
const script = require('../methods/script');
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

const errorReadingScript = title => {
	return title.length === 0;
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

const processScript = async scriptPath => {
	try {
		const title = script.readMovieTitle(scriptPath);
		console.log('title', title);
		if (errorReadingScript(title)) {
			throw new Error('Error reading script');
		}
		const film = await Film.findByTitle(title);
		if (filmFound(film)) {
			return handleFilmFoundInDB(film, scriptPath);
		}
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
		await Film.insertFilm(filmMetaData);
		const finalFilm = await Film.findByTitle(title);

		resetAll(scriptPath);

		const response = {
			...finalFilm,
			title,
			success: true,
			cacheHit: false,
		};
		console.log('saved film');
		return response;
	} catch (err) {
		return handleError('Please try again', scriptPath);
	}
};

module.exports = processScript;
