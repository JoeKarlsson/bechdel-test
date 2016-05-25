/* eslint-env mocha */
'use strict';

const request = require('supertest');
const app = require('../server.js');
const path = require('path');
const chai = require('chai');
const expect = chai.expect;
const mongoose = require('mongoose');

mongoose.models = {};
mongoose.modelSchemas = {};

describe('film routes', () => {
  let connection;
  beforeEach((done) => {
    connection = mongoose.createConnection('mongodb://localhost/bechdelTest');
    connection.once('open', () => {
      done();
    });
  });

  afterEach((done) => {
    connection.close(() => {
      done();
    });
  });

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
          expect(res.body).to.be.an('array');
          return done();
        });
    });
  });

  describe('GET /api/film/:id', () => {
    it('should send JSON with a single film', (done) => {
      request(app)
        .get('/api/film/573cf127b6cb9a35032eefc4')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.keys('title');
          return done();
        });
    });
  });

  describe('POST /api/film/', () => {
    it('should create a new film in the database', (done) => {
      request(app)
        .post('/api/film/')
        .attach('script', path.join(__dirname, 'test-script.txt'))
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.keys('title');
          return done();
        });
    });
  });
});
