const meta = require('../../helper/meta');

const createImageUrl = idIMDB => {
	return (
		'https://api.themoviedb.org/3/movie/' +
		`${idIMDB}` +
		'/images?' +
		`api_key=${meta.THEMOVIEDB}` +
		'&language=en&' +
		'include_image_language=en,null'
	);
};

const createBechdelUrl = idIMDB => {
	idIMDB = idIMDB.substring(2, idIMDB.length);
	return `http://bechdeltest.com/api/v1/getMovieByImdbId?imdbid=${idIMDB}`;
};

const splitTitle = title => {
	if (title.indexOf('-') > 0) {
		return title.split('-').join('+');
	}
	return title.split(' ').join('+');
};

const createSimpleDataURL = movieTitle => {
	const title = splitTitle(movieTitle);
	
	return (
		'http://www.omdbapi.com/?' +
		`t=${title}&` +
		`apikey=${meta.OMDB}&` +
		'plot=full&' +
		'r=json'
	);
};

const createFilmCreditsURL = idIMDB => {
	return (
		'https://api.themoviedb.org/3/movie/' +
		`${idIMDB}/` +
		'credits?' +
		`api_key=${meta.THEMOVIEDB}`
	);
};

module.exports = {
	createImageUrl,
	createBechdelUrl,
	createSimpleDataURL,
	createFilmCreditsURL,
};
