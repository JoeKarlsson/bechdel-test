/*
  eslint
    no-unused-expressions: 0,
    func-names: 0,
    strict: 0
*/
/* eslint-env mocha, mongo */

'use strict';

const path = require('path');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const film = require('../../../../server/methods/film.js');

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
    it('should increment stored value by one', function() {
      var storeMock = sinon.mock(store);
      storeMock.expects('get').withArgs('data').returns(0);
      storeMock.expects('set').once().withArgs('data', 1);

      incrementStoredData();

      storeMock.restore();
      storeMock.verify();
    });
  });
});
