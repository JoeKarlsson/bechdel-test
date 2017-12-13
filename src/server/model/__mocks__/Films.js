const mockListAllResponse = ['foo', 'bar'];
const mockFindByIDResponse = { title: 'Boyhood' };

class Film {
	constructor() {

		this.getData = jest.fn(() => {
			const p = new Promise((resolve) => {
				resolve(mockFindByIDResponse);
			});
			return p;
		});

		this.listAll = jest.fn(() => {
			const p = new Promise((resolve) => {
				resolve(mockListAllResponse);
			});
			return p;
		});

		this.findByID = jest.fn(() => {
			const p = new Promise((resolve) => {
				resolve(mockFindByIDResponse);
			});
			return p;
		});

		this.deleteFilm = jest.fn(() => {
			const p = new Promise((resolve) => {
				resolve(mockFindByIDResponse);
			});
			return p;
		});

		this.findByTitle = jest.fn(() => {
			const p = new Promise((resolve) => {
				resolve(mockFindByIDResponse);
			});
			return p;
		});
	}
}

module.exports = new Film();
