import { DEFAULT_ERROR_MESSAGE } from './constants';

const getAllFilms = (filmID = null) => {

	const myInit = {
		method: 'GET',
	};

	return fetch(`/api/film/${filmID}`, myInit)
		.then(response => response.json())
		.then(data => data)
		.catch((err) => {
			return {
				err,
				msg: DEFAULT_ERROR_MESSAGE,
			};
		});
};

export default getAllFilms;
