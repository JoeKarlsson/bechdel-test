require('isomorphic-fetch');
const filmData = require('./FilmData');
const meta = require('../../helper/meta');

const getFullCastData = idIMDB => {
	const URL =
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
		'filmingLocations=0';

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
