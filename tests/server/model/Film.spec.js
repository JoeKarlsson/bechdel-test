/*
  eslint
    no-unused-expressions: 0,
    func-names: 0,
    strict: 0
*/
/* eslint-env mocha */

'use strict';

const request = require('request');
const Bluebird = require('bluebird');
const mongoose = require('mongoose');
const sinon = require('sinon');
require('sinon-mongoose');
require('sinon-as-promised')(Bluebird);
const chai = require('chai');
const expect = chai.expect;
const film = require('../../../server/methods/film.js');

describe('Film Model', () => {
  let id = '';

  describe('listAll', () => {
    const Film = mongoose.model('Film');
    const FilmMock = sinon.mock(Film);
    const response = [{ id: '1234', title: 'MovieTitle' }];

    it('#listAll', sinon.test((done) => {
      FilmMock
        .expects('find').withArgs()
        .chain('sort', '-date')
        .chain('exec')
        .resolves(response);

      Film.listAll().then((result) => {
        FilmMock.verify();
        FilmMock.restore();
        expect(result).to.be.equal(response);
        expect(result).to.be.an('array');
        expect(result).to.have.length.above(0);
        for (let i = 0; i < result; i++) {
          expect(result[i].id).to.be.ok;
          expect(result[i].title).to.be.ok;
          expect(result[i].title).to.be.an('string');
        }
        done();
      })
      .catch((err) => {
        done(err);
      });
    }));
  });

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
});
