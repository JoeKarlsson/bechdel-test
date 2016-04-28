'use strict'

const fs = require('fs');
const Q = require('q');
const omdb = require('./omdb');
const bechdel = require('./bechdel');
const Film = require('../model/Film');


module.exports.readMovieTitle = (path) => {
  return Q.promise( (resolve, reject) => {
    var rs = fs.createReadStream(path, { encoding : 'utf8' });
    var acc = '';
    var pos = 0;
    var index;

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

module.exports.readScript = (path) => {
  return Q.promise( (resolve, reject) => {
    var rs = fs.createReadStream(path, { encoding : 'utf8' });
    var movieScript = '';

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

module.exports.deleteTmpScript = (path) => {
  return Q.promise( (resolve, reject) => {
    fs.unlink(scriptPath, function(err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};