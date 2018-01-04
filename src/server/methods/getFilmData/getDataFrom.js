require('isomorphic-fetch');

const getDataFrom = URL => {
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

module.exports = getDataFrom;
