const meta = require('../../helper/meta');

const createImageUrl = idIMDB => {
	return (
		'https://api.themoviedb.org/3/movie/' +
		`${idIMDB}/images?` +
		`api_key=${meta.THEMOVIEDB}` +
		'&language=en&' +
		'include_image_language=en,null'
	);
};

const splitTitle = title => {
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

const createFullDataURL = idIMDB => {
	return (
		'http://www.myapifilms.com/' +
		`imdb/idIMDB?idIMDB=${idIMDB}&` +
		`token=${meta.MYAPIFILMS}&` +
		'format=json&' +
		'language=en-us&' +
		'aka=0&' +
		'business=0&' +
		'seasons=0&' +
		'seasonYear=0&' +
		'technical=0&' +
		'trailers=1&' +
		'movieTrivia=0&' +
		'awards=0&' +
		'moviePhotos=0&' +
		'movieVideos=0&' +
		'actors=1&' +
		'biography=1&' +
		'actorActress=1&' +
		'similarMovies=0&' +
		'goofs=0&' +
		'keyword=0&' +
		'quotes=0&' +
		'fullSize=0&' +
		'companyCredits=0&' +
		'filmingLocations=0'
	);
};

module.exports = {
	createImageUrl,
	createSimpleDataURL,
	createFullDataURL,
};
