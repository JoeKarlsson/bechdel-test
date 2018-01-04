require('isomorphic-fetch');

const getDataFrom = async URL => {
	try {
		const response = await fetch(URL);

		if (response.status >= 400) {
			throw new Error('Bad response from server');
		}
		return response.json();
	} catch (err) {
		throw new Error(err);
	}
};

module.exports = getDataFrom;
