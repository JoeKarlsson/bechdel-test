const handleFilmSubmit = formData => {
	const url = '/api/film';
	const myInit = {
		method: 'POST',
		body: formData,
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
			throw new Error(err);
		});
};

export default handleFilmSubmit;
