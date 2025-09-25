const mockReply = require('./mockReply.json');

const getAllFilms = () => {
	const p = new Promise(resolve => {
		const SECONDS = 1000;
		setTimeout(() => {
			resolve(mockReply);
		}, 0.5 * SECONDS);
	});
	return p;
};

export default getAllFilms;
