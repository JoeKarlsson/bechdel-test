const meta = require('../../helper/meta');

const createImageUrl = ID => {
	return (
		'https://api.themoviedb.org/3/movie/' +
		`${ID}/images?` +
		`api_key=${meta.THEMOVIEDB}` +
		'&language=en&' +
		'include_image_language=en,null'
	);
};

const createSimpleDataURL = title => {
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
		'awards=0&' +
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

const createFullDataURL = imdbID => {
	return (
		'http://api.myapifilms.com/imdb/idIMDB?' +
		`title=${imdbID}&` +
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
		'awards=0&' +
		'moviePhotos=0&' +
		'movieVideos=0&' +
		'actors=2&' +
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

module.exports = {
	createImageUrl,
	createSimpleDataURL,
	createFullDataURL,
};
