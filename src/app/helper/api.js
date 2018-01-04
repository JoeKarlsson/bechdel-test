import { DEFAULT_ERROR_MESSAGE } from './constants';

const isNotHappyStatus = status => {
	return status >= 400;
};

const handleError = err => {
	console.error(err.toString());
	return {
		err,
		msg: DEFAULT_ERROR_MESSAGE,
	};
};

const handleResponse = response => {
	const { status } = response;
	if (isNotHappyStatus(status)) {
		return handleError('Bad response from server');
	}
	return response.json();
};

const api = (url, options) => {
	return fetch(url, options)
		.then(handleResponse)
		.catch(handleError);
};

export default api;
