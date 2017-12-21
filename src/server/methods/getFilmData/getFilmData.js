const request = require('request');
const filmData = require('./FilmData');
const dataParser = require('./dataParser');
const meta = require('../../helper/meta');
const getFilmImages = require('./getFilmImages');
const getSimpleCastData = require('./getSimpleCastData');

const fullCastData = title => {
	const promise = new Promise((resolve, reject) => {
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

		request.get(URL, (error, response, body) => {
			if (!error) {
				const metadata = JSON.parse(body);
				filmData.addMetaData(metadata);
				resolve(metadata);
			} else {
				reject(new Error(error));
			}
		});
	});
	return promise;
};

const completeFilmData = movieTitle => {
	const promise = new Promise((resolve, reject) => {
		if (!movieTitle) {
			reject(new Error('Invalid Movie Title'));
		}
		const splitTitle = movieTitle.split(' ').join('+');

		getSimpleCastData(splitTitle)
			.then(simpleCastdata => {
				console.log('hit');
				console.log('simpleCastdata', simpleCastdata);
				if (!simpleCastdata) {
					reject(new Error('Failed on getSimpleCastData'));
				}
				dataParser(simpleCastdata, 'mainCast');
				getFilmImages(filmData.imdbID).then(images => {
					if (!images) {
						reject(new Error('Failed on getFilmImages'));
					}
					filmData.images = images;
				});
				return fullCastData(splitTitle).then(fullCastdata => {
					if (!fullCastdata) {
						reject(new Error('Failed on getFullCastData'));
					}
					console.log('fullCastdata', fullCastdata);
					dataParser(fullCastdata, 'fullCast');
					resolve(filmData.getAllData());
				});
			})
			.catch(err => {
				throw new Error(err);
			});
	});
	return promise;
};

module.exports = {
	fullCastData,
	completeFilmData,
};
