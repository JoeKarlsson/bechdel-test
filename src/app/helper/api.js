// import * as $ from 'jquery';
//
// const getAllFilms = () => {
// 	$.ajax({
// 		url: '/api/film',
// 		method: 'GET',
// 		dataType: 'json',
// 		cache: false,
// 		success: (data) => {
// 			return { films: data };
// 		},
// 		error: (xhr, status, err) => {
// 			console.error(this.props, status, err.toString());
// 		}
// 	});
// }
//
//
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
