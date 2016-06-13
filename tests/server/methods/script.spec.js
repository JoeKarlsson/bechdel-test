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
const script = require('../../../server/methods/script.js');

describe('Script methods', () => {
  describe('readMovieTitle', () => {
    it('should read a script and return the title', (done) => {
      const scriptPath = path.join(__dirname, 'test-script.txt');
      script.readMovieTitle(scriptPath)
      .then((title) => {
        expect(title).to.equal('BOYHOOD');
        return done();
      })
      .catch((err) => {
        done(err);
      });
    });
  });

  describe('read', () => {
    it('should read a script', function (done) {
      this.timeout(4000);
      const scriptPath = path.join(__dirname, 'test-script.txt');
      script.readMovieTitle(scriptPath)
      .then((scriptBody) => {
        expect(scriptBody).to.be.a('string');
        expect(scriptBody).to.not.be.empty;
        return done();
      })
      .catch((err) => {
        done(err);
      });
    });
  });
});
