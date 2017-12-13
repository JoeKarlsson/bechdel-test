const path = require('path');
const request = require('supertest');
const app = require('../server.js');

const mockResponse = ['foo', 'bar'];

jest.mock('../model/Film', () => {
	class Film {
		constructor() {
			this.listAll = jest.fn(() => {
				const p = new Promise((resolve) => {
					resolve(mockResponse);
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
					expect(res.body).toMatchObject(mockResponse);
					return done();
				});
		});
	});

	// describe('POST /api/film/ already in the database', () => {
	// 	it('should return the film', (done) => {
	//
	// 		const testScript = path.join(__dirname, '../../../scripts/boyhood.txt');
	// 		console.log('hit');
	// 		console.log('testScript', testScript);
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
	// 				expect(res.body).toContain('_id');
	// 				expect(res.body._id).toTruthy();
	// 				expect(typeof res.body._id).toBe('string');
	// 			});
	// 	});
	// });
});
