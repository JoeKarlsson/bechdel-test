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

const splitTitle = title => {
	console.log('title', title);

	if (title.indexOf('-') > 0) {
		return title.split('-').join('+');
	}
	return title.split(' ').join('+');
};

const createSimpleDataURL = movieTitle => {
	const title = splitTitle(movieTitle);

	return (
		'http://api.myapifilms.com/imdb/idIMDB?' +
		`title=${title}&` +
		`token=${meta.MYAPIFILMS}&` +
		'format=json&' +
		'language=en-us&' +
		'aka=0&' +
		'business=0&' +
		'seasons=0&' +
		'seasonYear=0&' +
		'technical=0&' +
		'filter=3&' +
		'exactFilter=0&' +
		'limit=1&' +
		'forceYear=0&' +
		'trailers=0&' +
		'movieTrivia=0&' +
		'awards=1&' +
		'moviePhotos=0&' +
		'movieVideos=0&' +
		'actors=1&' +
		'biography=1&' +
		'uniqueName=0&' +
		'filmography=0&' +
		'bornAndDead=0&' +
		'starSign=0&' +
		'actorActress=1&' +
		'actorTrivia=0&' +
		'similarMovies=0&' +
		'adultSearch=0'
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
	createSimpleDataURL,
	createFilmCreditsURL,
};
