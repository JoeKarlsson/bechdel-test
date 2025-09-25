const mockFindByIDResponse = { title: 'Boyhood' };

const getBechdelResults = jest.fn(() => {
	const p = new Promise((resolve) => {
		resolve(mockFindByIDResponse);
	});
	return p;
});

module.exports = getBechdelResults;
