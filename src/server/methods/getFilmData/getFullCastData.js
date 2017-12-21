require('isomorphic-fetch');
const filmData = require('./FilmData');
const meta = require('../../helper/meta');

const getFullCastData = title => {
	const URL =
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
		'actors=2&' +
		'biography=1&' +
		'uniqueName=0&' +
		'filmography=0&' +
		'bornAndDead=0&' +
		'starSign=0&' +
		'actorActress=1&' +
		'actorTrivia=0&' +
		'similarMovies=0&' +
		'adultSearch=0';

	return fetch(URL)
		.then(response => {
			if (response.status >= 400) {
				throw new Error('Bad response from server');
			}
			return response.json();
		})
		.then(metadata => {
			filmData.addMetaData(metadata);
			return metadata;
		})
		.catch(err => {
			throw new Error(err);
		});
};

module.exports = getFullCastData;
