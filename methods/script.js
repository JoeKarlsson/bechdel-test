'use strict'

const fs      = require('fs');
const Q       = require('q');
const bechdel = require('./bechdel');
const Film    = require('../model/Film');

module.exports.readMovieTitle = (path) => {
  return Q.promise( (resolve, reject) => {
    let rs = fs.createReadStream(path, { encoding : 'utf8' });
    let acc = '';
    let pos = 0;
    let index;

    rs.on('data', (chunk) => {
      index = chunk.indexOf('\n');
      acc += chunk;
      index !== -1 ? rs.close() : pos += chunk.length;
    })
    .on('close', () => {
      let movieTitle = acc.slice(0, pos + index);
      resolve(movieTitle);
    })
    .on('error', (err) => {
      reject(err);
    })
  });
};

module.exports.read = (path) => {
  return Q.promise( (resolve, reject) => {
    let rs = fs.createReadStream(path, { encoding : 'utf8' });
    let movieScript = '';

    rs.on('data', (chunk) => {
      movieScript += chunk;
    })
      .on('close', () => {
        resolve(movieScript);
      })
      .on('error', (err) => {
        reject(err);
      })
  });
};

module.exports.clearTemp = (path) => {
  return Q.promise( (resolve, reject) => {
    fs.unlink(scriptPath, function(err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};
