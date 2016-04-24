'use strict'

var fs = require('fs');
var Q = require('q');
var omdb = require('./omdb');
var bechdel = require('./bechdel');

//Test movie scripts
var scriptPath = './scripts/american-sniper.txt';

// var scriptPath = './scripts/birdman.txt';
// var scriptPath = './scripts/boyhood.txt';
// var scriptPath = './scripts/foxcatcher.txt';
// var scriptPath = './scripts/gone-girl.txt';
// var scriptPath = './scripts/grand-budapest-hotel.txt';
// var scriptPath = './scripts/imitation-game.txt';
// var scriptPath = './scripts/still-alice.txt';
// var scriptPath = './scripts/taxi-driver.txt';
// var scriptPath = './scripts/theory-of-everything.txt';
// var scriptPath = './scripts/whiplash.txt';
// var scriptPath = './scripts/american-hustle.txt';
// var scriptPath = './scripts/into-the-woods.txt';
// var scriptPath = './scripts/judge.txt';
// var scriptPath = './scripts/wild.txt';

let readMovieTitle = (path) => {
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

let readScript = (path) => {
  return Q.promise( (resolve, reject) => {
    var rs = fs.createReadStream(path, { encoding : 'utf8' });
    var movieScript = '';

    rs.on('data', (chunk) => {
      movieScript += chunk;
    })
      .on('close', () => {
        // console.log(movieScript);
        resolve(movieScript);
      })
      .on('error', (err) => {
        reject(err);
      })
  });
};

//In order to test locally, you must uncomment this section. I have commented this out, because I was making too many API calls on the server and it was causing issues when testing.

let readAndAnalyzeScript = () => {
  let movieCharacters = [];
  let movieScript = '';

  readMovieTitle(scriptPath)
  .then( (movieTitle) => {
    // If the HTTP response returns 200 OK, log the response text.
    console.log( 'Movie Script Title: ', movieTitle );
    return omdb.getOmdbData( movieTitle )

      .then( ( movieCharacters ) => {

        movieCharacters = movieCharacters;

        return readScript(scriptPath)

          .then( ( movieScript ) => {
            movieScript = movieScript;
            return bechdel.extractScenes( movieCharacters, movieScript )

              .then( ( sceneArray ) => {
                return bechdel.sceneAnalysis( movieCharacters, sceneArray )
                  .then( ( result ) => {

                  }, ( error ) => {
                    // If there's an error or a non-200 status code, log the error.
                    throw new Error( error );
                  })

              }, (error) => {
                // If there's an error or a non-200 status code, log the error.
                throw new Error(error);
              })

          }, (error) => {
            // If there's an error or a non-200 status code, log the error.
            throw new Error(error);
          })

      }, (error) => {
        // If there's an error or a non-200 status code, log the error.
        throw new Error(error);
      })

  }, (error) => {
    // If there's an error or a non-200 status code, log the error.
    throw new Error(error);
  })

  .catch(function (error) {
    // Handle any error from all above steps
    throw new Error(error);
  })

  .done();
}

module.exports = readAndAnalyzeScript;