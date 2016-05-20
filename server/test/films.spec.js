/* eslint-env mocha */

const request = require('supertest');
const app = require('../server.js');
const chai = require('chai');
const expect = chai.expect;

describe('film routes', () => {
  describe('GET /api/film', () => {
    it('should send JSON with a list of films', (done) => {
      request(app)
        .get('/api/film')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.be.an('object');
          return done();
        });
    });
  });
});
