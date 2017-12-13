const request = require('supertest');
const app = require('../server.js');

const mockListAllResponse = ['foo', 'bar'];
const mockFindByIDResponse = { title: 'Boyhood' };

jest.mock('../methods/getFilmData');
jest.mock('../methods/bechdel');
jest.mock('../methods/script');

jest.mock('../model/Film', () => {
	class Film {
		constructor() {

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

	return new Film();
});

describe('Film Routes Test', () => {
	describe('GET /api/film', () => {
		it('should send JSON with an array of films', (done) => {
			request(app)
				.get('/api/film')
				.expect(200)
				.expect('Content-Type', /json/)
				.end((err, res) => {
					if (err) {
						return done(err);
					}
					expect(res.body).toMatchObject(mockListAllResponse);
					return done();
				});
		});
	});

	// describe('POST /api/film/ already in the database', () => {
	// 	it('should return the film', (done) => {
	// 		const testScript = path.join(__dirname, '../../../scripts/boyhood.txt');
	//
	// 		request(app)
	// 			.post('/api/film/')
	// 			.attach('script', testScript)
	// 			.expect(200)
	// 			.expect('Content-Type', /json/)
	// 			.end((err, res) => {
	// 				if (err) {
	// 					console.log('err', err);
	// 					return done(err);
	// 				}
	// 				console.log('res.body', res);
	// 				console.log('res.status', res.status);
	// 				expect(res.body).toContain('_id');
	// 				expect(res.body._id).toTruthy();
	// 				expect(typeof res.body._id).toBe('string');
	// 			});
	// 	});
	// });

	describe('GET /api/film/:id', () => {
		it('should send JSON with a single film', (done) => {
			const id = 1234;

			request(app)
				.get(`/api/film/${id}`)
				.expect(200)
				.expect('Content-Type', /json/)
				.end((err, res) => {
					if (err) {
						return done(err);
					}
					expect(res.body).toBeTruthy();
					expect(res.body.title).toEqual('Boyhood');
					expect(res.body).toMatchObject(mockFindByIDResponse);
					return done();
				});
		});
	});

	describe('DELETE /api/film/:id', () => {
		it('should return success:true after deleting movie from the database', (done) => {
			const id = 1234;

			request(app)
				.del(`/api/film/${id}`)
				.expect(200)
				.expect('Content-Type', /json/)
				.end((err, res) => {
					if (err) {
						return done(err);
					}
					expect(typeof res.body).toBe('object');
					return done();
				});
		});
	});
});
