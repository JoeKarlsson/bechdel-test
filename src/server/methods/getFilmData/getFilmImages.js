require('isomorphic-fetch');
const meta = require('../../helper/meta');

const getFilmImages = ID => {
	const URL =
		'https://api.themoviedb.org/3/movie/' +
		`${ID}/images?` +
		`api_key=${meta.THEMOVIEDB}` +
		'&language=en&' +
		'include_image_language=en,null';

	return fetch(URL)
		.then(response => {
			if (response.status >= 400) {
				throw new Error('Bad response from server');
			}
			return response.json();
		})
		.catch(err => {
			throw new Error(err);
		});
};

module.exports = getFilmImages;
