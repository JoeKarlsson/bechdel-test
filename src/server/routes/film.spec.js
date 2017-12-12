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

	describe('POST /api/film/ already in the database', () => {
		it('should return the film', (done) => {

			const testScript = path.join(__dirname, '../../../scripts/boyhood.txt');
			console.log('hit');
			console.log('testScript', testScript);
			request(app)
				.post('/api/film/')
				.attach('script', testScript)
				.expect(200)
				.expect('Content-Type', /json/)
				.end((err, res) => {
					if (err) {
						console.log('err', err);
						return done(err);
					}
					expect(res.body).toContain('_id');
					expect(res.body._id).toTruthy();
					expect(typeof res.body._id).toBe('string');

					const id = res.body._id;
					expect(res.body).to.be.an('object');
					expect(res.body).to.include.keys('title');
					expect(res.body.title).to.equal('AMERICAN HUSTLE');
					expect(res.body.idIMDB).to.equal('tt1800241');
					expect(res.body.bechdelResults.pass).to.equal(true);
					expect(res.body.bechdelResults.bechdelScore).to.equal(3);
					expect(res.body.bechdelResults.numScenesPass).to.equal(14);
					expect(res.body.bechdelResults.numScenesDontPass).to.equal(171);
					expect(res.body.bechdelResults.numOfFemalesChars).to.equal(3);
					expect(res.body.bechdelResults.numOfMaleChars).to.equal(12);
					expect(res.body.bechdelResults.numOfFemalesCharsWithDialogue).to.equal(3);
					expect(res.body.bechdelResults.numOfMaleCharsWithDialogue).to.equal(9);
					expect(res.body.bechdelResults.totalLinesFemaleDialogue).to.equal(205);
					expect(res.body.bechdelResults.totalLinesMaleDialogue).to.equal(798);
					expect(res.body.images.backdrop).to.equal('https://image.tmdb.org/t/p/w1000/dpGGeiTPDzqrcbK7h8if2YHHBXN.jpg');
					expect(res.body.images.poster).to.equal('https://image.tmdb.org/t/p/w300/mhB7C62lSMpGO2HYNaW6d7W3TVH.jpg');

					const actors = res.body.actors;
					expect(actors).to.be.an('array');
					expect(actors).to.have.length.above(1);

					for (let i = 0; i < actors; i++) {
						expect(actors[i].actorActress).to.be.ok;
						expect(actors[i].actorActress).to.be.an('string');
						expect(actors[i].character).to.be.ok;
						expect(actors[i].character).to.be.an('string');
						expect(actors[i].actorName).to.be.ok;
						expect(actors[i].actorName).to.be.an('string');
					}

					const genres = res.body.genres;
					expect(genres).to.be.an('array');
					expect(genres).to.have.length.above(0);
					for (let i = 0; i < genres; i++) {
						expect(genres[i]).to.be.ok;
						expect(genres[i]).to.be.a('string');
					}

					const writers = res.body.writers;
					expect(writers).to.be.an('array');
					expect(writers).to.have.length.above(0);
					for (let i = 0; i < writers; i++) {
						expect(writers[i].id).to.be.ok;
						expect(writers[i].name).to.be.ok;
						expect(writers[i].name).to.be.an('string');
					}

					const directors = res.body.directors;
					expect(directors).to.be.an('array');
					expect(directors).to.have.length.above(0);
					for (let i = 0; i < directors; i++) {
						expect(directors[i].id).to.be.ok;
						expect(directors[i].name).to.be.ok;
						expect(directors[i].name).to.be.an('string');
					}
					return done();
				});
		});
	});
});
