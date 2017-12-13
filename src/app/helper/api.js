import { DEFAULT_ERROR_MESSAGE } from './constants';

const getAllFilms = () => {

	const myInit = {
		method: 'GET',
	};

	return fetch('/api/film', myInit)
		.then(response => response.json())
		.then((data) => {
			return {
				films: data,
			};
		})
		.catch((err) => {
			return {
				err,
				msg: DEFAULT_ERROR_MESSAGE,
			};
		});
};

export default getAllFilms;
