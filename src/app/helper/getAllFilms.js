import { DEFAULT_ERROR_MESSAGE } from './constants';

const getAllFilms = (filmID = '') => {
	const url = `/api/film/${filmID}`;
	const myInit = {
		method: 'GET',
	};

	return fetch(url, myInit)
		.then(response => {
			if (response.status >= 400) {
				throw new Error('Bad response from server');
			}
			return response.json();
		})
		.catch(err => {
			console.error(err.toString());
			return {
				err,
				msg: DEFAULT_ERROR_MESSAGE,
			};
		});
};

export default getAllFilms;
