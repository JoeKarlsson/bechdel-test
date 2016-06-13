/*
  eslint
    no-unused-expressions: 0,
    func-names: 0,
    strict: 0
*/
/* eslint-env mocha, mongo */

'use strict';

const path = require('path');
const request = require('request');
const $ = require('jquery');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const film = require('../../../server/methods/film.js');

describe('Film methods', () => {
  let id = '';

  describe('findByTitle', () => {
    it('should find a film by its Title', (done) => {
      film.findByTitle('BOYHOOD')
      .then((movie) => {
        id = movie._id.toString();
        expect(movie._id).to.be.ok;
        expect(id).to.be.an('string');
        expect(movie).to.be.ok;
        expect(movie).to.be.an('object');
        expect(movie.title).to.equal('BOYHOOD');
        return done();
      })
      .catch((err) => {
        done(err);
      });
    });
  });

  describe('findByID', () => {
    it('should find a film by its ID', (done) => {
      film.findByID(id)
      .then((movie) => {
        expect(movie._id).to.be.ok;
        expect(movie).to.be.ok;
        expect(movie).to.be.an('object');
        expect(movie.title).to.equal('BOYHOOD');
        return done();
      })
      .catch((err) => {
        done(err);
      });
    });
  });

  describe('listAll', () => {
    it('should list all films in the database', (done) => {
      film.listAll()
      .then((movies) => {
        expect(movies).to.be.an('array');
        expect(movies).to.have.length.above(0);
        for (let i = 0; i < movies; i++) {
          expect(movies[i].id).to.be.ok;
          expect(movies[i].title).to.be.ok;
          expect(movies[i].title).to.be.an('string');
        }
        return done();
      })
      .catch((err) => {
        done(err);
      });
    });
  });

  describe('getSimpleCastData', () => {
    const filmTitle = 'BOYHOOD';
    it('should call callback after success', () => {
      const req = sinon.stub(request, 'get');
      const callback = sinon.spy();
      const response = JSON.stringify({ data: { movies: [{ imdbID: 1234 }] } });
      req.yields(null, null, response, 'mainCast');
      film.getSimpleCastData(filmTitle, callback);
      req.restore();
      expect(callback).to.have.been.calledOnce;
    });
    it('should send correct parameters to the expected URL', () => {
      const req = sinon.stub(request, 'get');
      const expectedUrl = 'http://api.myapifilms.com/imdb/idIMDB?title=BOYHOOD&token=d44147a7-5e6e-4450-92ba-773be44791ce&format=json&language=en-us&aka=0&business=0&seasons=0&seasonYear=0&technical=0&filter=3&exactFilter=0&limit=1&forceYear=0&trailers=0&movieTrivia=0&awards=0&moviePhotos=0&movieVideos=0&actors=1&biography=1&uniqueName=0&filmography=0&bornAndDead=0&starSign=0&actorActress=1&actorTrivia=0&similarMovies=0&adultSearch=0';
      film.getSimpleCastData(filmTitle, () => {});
      req.restore();
      sinon.assert.calledWith(req, expectedUrl);
    });
  });

  describe('getFullCastData', () => {
    const filmTitle = 'BOYHOOD';
    it('should call callback after success', () => {
      const req = sinon.stub(request, 'get');
      const callback = sinon.spy();
      const response = JSON.stringify({ data: { movies: [{ imdbID: 1234 }] } });
      req.yields(null, null, response, 'fullCast');
      film.getFullCastData(filmTitle)
      .then((body) => {
        req.restore();
        expect(body).to.deep.equal(JSON.parse(response));
      });
    });
    it('should send correct parameters to the expected URL', () => {
      const req = sinon.stub(request, 'get');
      const expectedUrl = 'http://api.myapifilms.com/imdb/idIMDB?title=BOYHOOD&token=d44147a7-5e6e-4450-92ba-773be44791ce&format=json&language=en-us&aka=0&business=0&seasons=0&seasonYear=0&technical=0&filter=3&exactFilter=0&limit=1&forceYear=0&trailers=0&movieTrivia=0&awards=0&moviePhotos=0&movieVideos=0&actors=2&biography=1&uniqueName=0&filmography=0&bornAndDead=0&starSign=0&actorActress=1&actorTrivia=0&similarMovies=0&adultSearch=0';
      const response = JSON.stringify({ data: { movies: [{ imdbID: 1234 }] } });
      req.yields(null, null, response, 'fullCast');
      film.getFullCastData(filmTitle);
      sinon.assert.calledWith(req, expectedUrl);
      // .then((body) => {
      //   req.restore();
      // });
    });
  });
});
