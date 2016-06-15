/*
  eslint
    no-unused-expressions: 0,
    func-names: 0,
    strict: 0
*/
/* eslint-env mocha */

'use strict';

const Bluebird = require('bluebird');
const mongoose = require('mongoose');
const sinon = require('sinon');
require('sinon-mongoose');
require('sinon-as-promised')(Bluebird);
const chai = require('chai');
const expect = chai.expect;

describe('Film Model', () => {
  let id = '';
  const Film = mongoose.model('Film');

  describe('#findByTitle', () => {
    it('should find a film by its Title', sinon.test(function (done) {
      const FilmMock = this.mock(Film, 'findByTitle');
      const response = { _id: '1234', title: 'BOYHOOD' };
      FilmMock
        .expects('find').withArgs()
        .chain('exec')
        .resolves(response);

      Film.findByTitle(response.title).then((result) => {
        FilmMock.verify();
        // FilmMock.restore();
        id = result._id.toString();
        expect(result._id).to.be.ok;
        expect(id).to.be.an('string');
        expect(result).to.be.ok;
        expect(result).to.be.an('object');
        expect(result.title).to.equal('BOYHOOD');
        done();
      })
      .catch((err) => {
        done(err);
      });
    }));
  });

  describe('#findByID', () => {
    it('should find a film by its ID', sinon.test(function (done) {
      const FilmMock = this.mock(Film);
      const response = { _id: '1234', title: 'BOYHOOD' };

      FilmMock
        .expects('find').withArgs()
        .chain('exec')
        .resolves(response);

      Film.findByID(response._id).then((result) => {
        FilmMock.verify();
        expect(result._id).to.be.ok;
        expect(result).to.be.ok;
        expect(result).to.be.an('object');
        expect(result.title).to.equal('BOYHOOD');
        done();
      })
      .catch((err) => {
        done(err);
      });
    }));
  });

  describe('#listAll', () => {
    it('should return all the films', sinon.test(function (done) {
      const FilmMock = this.mock(Film);
      const response = [{ id: '1234', title: 'MovieTitle' }];
      FilmMock
        .expects('find').withArgs()
        .chain('sort', '-date')
        .chain('exec')
        .resolves(response);

      Film.listAll().then((result) => {
        FilmMock.verify();
        expect(result).to.be.deep.equal(response);
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
});
