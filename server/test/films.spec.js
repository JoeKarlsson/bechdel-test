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
  let id;
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

  describe('POST /api/film/', () => {
    it('should create a new film in the database', function(done) {
      this.timeout(0);
      request(app)
        .post('/api/film/')
        .attach('script', path.join(__dirname, 'test-script.txt'))
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          id = res.body[0]._id;
          expect(res.body).to.be.an('array');
          expect(res.body[0]).to.include.keys('title');
          expect(res.body[0].title).to.equal('BOYHOOD');
          expect(res.body[0].idIMDB).to.equal('tt1065073');
          expect(res.body[0].bechdelResults.pass).to.equal(false);
          expect(res.body[0].bechdelResults.bechdelScore).to.equal(1);
          expect(res.body[0].bechdelResults.numScenesPass).to.equal(0);
          expect(res.body[0].bechdelResults.numScenesDontPass).to.equal(161);
          expect(res.body[0].bechdelResults.numOfFemalesChars).to.equal(38);
          expect(res.body[0].bechdelResults.numOfMaleChars).to.equal(57);
          expect(res.body[0].bechdelResults.numOfFemalesCharsWithDialogue).to.equal(21);
          expect(res.body[0].bechdelResults.numOfMaleCharsWithDialogue).to.equal(21);
          expect(res.body[0].bechdelResults.totalLinesFemaleDialogue).to.equal(806);
          expect(res.body[0].bechdelResults.totalLinesMaleDialogue).to.equal(1061);
          expect(res.body[0].images.backdrop).to.equal('https://image.tmdb.org/t/p/w1000/aE1gbq6nw8zyVqvEBXMVMCqZpCs.jpg');
          expect(res.body[0].images.poster).to.equal('https://image.tmdb.org/t/p/w300/eKi4e5zXhQKs0De4xu5AAMvu376.jpg');
          expect(res.body[0].actors).to.be.an('array');
          expect(res.body[0].actors).to.have.length.above(1);
          return done();
        });
    });
  });

  describe('POST /api/film/', () => {
    it('should create a new film in the database', (done) => {
      request(app)
        .post('/api/film/')
        .attach('script', path.join(__dirname, 'test-script-2.txt'))
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.be.an('array');
          expect(res.body[0]).to.include.keys('title');
          expect(res.body[0].title).to.equal('AMERICAN HUSTLE');
          expect(res.body[0].idIMDB).to.equal('tt1800241');
          expect(res.body[0].bechdelResults.pass).to.equal(false);
          expect(res.body[0].bechdelResults.bechdelScore).to.equal(1);
          expect(res.body[0].bechdelResults.numScenesPass).to.equal(0);
          expect(res.body[0].bechdelResults.numScenesDontPass).to.equal(185);
          expect(res.body[0].bechdelResults.numOfFemalesChars).to.equal(45);
          expect(res.body[0].bechdelResults.numOfMaleChars).to.equal(109);
          expect(res.body[0].bechdelResults.numOfFemalesCharsWithDialogue).to.equal(10);
          expect(res.body[0].bechdelResults.numOfMaleCharsWithDialogue).to.equal(25);
          expect(res.body[0].bechdelResults.totalLinesFemaleDialogue).to.equal(232);
          expect(res.body[0].bechdelResults.totalLinesMaleDialogue).to.equal(844);
          expect(res.body[0].images.backdrop).to.equal('https://image.tmdb.org/t/p/w1000/dpGGeiTPDzqrcbK7h8if2YHHBXN.jpg');
          expect(res.body[0].images.poster).to.equal('https://image.tmdb.org/t/p/w300/mhB7C62lSMpGO2HYNaW6d7W3TVH.jpg');
          expect(res.body[0].actors).to.be.an('array');
          expect(res.body[0].actors).to.have.length.above(1);
          return done();
        });
    });
  });

  describe('GET /api/film/:id', () => {
    it('should send JSON with a single film', (done) => {
      request(app)
        .get(`/api/film/${id}`)
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

  describe('DELETE /api/film/:id', () => {
    it('should delete a film from the database', (done) => {
      request(app)
        .del(`/api/film/${id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          request(app)
          .get(`/api/film/${id}`)
          .end((error, response) => {
            if (error) {
              return done(err);
            }
            expect(response.body).to.be.empty;
            return done();
          });
        });
    });
  });
}

);
