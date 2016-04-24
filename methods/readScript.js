'use strict'

const fs = require('fs');
const Q = require('q');
const omdb = require('./omdb');
const bechdel = require('./bechdel');
const Film = require('../model/Film');

//Test movie scripts
const scriptPath = './scripts/american-sniper.txt';

// const scriptPath = './scripts/birdman.txt';
// const scriptPath = './scripts/boyhood.txt';
// const scriptPath = './scripts/foxcatcher.txt';
// const scriptPath = './scripts/gone-girl.txt';
// const scriptPath = './scripts/grand-budapest-hotel.txt';
// const scriptPath = './scripts/imitation-game.txt';
// const scriptPath = './scripts/still-alice.txt';
// const scriptPath = './scripts/taxi-driver.txt';
// const scriptPath = './scripts/theory-of-everything.txt';
// const scriptPath = './scripts/whiplash.txt';
// const scriptPath = './scripts/american-hustle.txt';
// const scriptPath = './scripts/into-the-woods.txt';
// const scriptPath = './scripts/judge.txt';
// const scriptPath = './scripts/wild.txt';

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
        resolve(movieScript);
      })
      .on('error', (err) => {
        reject(err);
      })
  });
};

const filmExists = ( film ) => {
  Film.findOne({ 'title' : film }, function ( err, film ) {
    if ( err ) {
      return false;
    }
    if ( film === null ) {
      return false;
    }
    return true;
  });
};

module.exports.readAndAnalyzeScript = () => {
  let movieCharacters = [];
  let movieScript = '';

  readMovieTitle(scriptPath)
  .then( (movieTitle) => {
    console.log( 'Movie Script Title: ', movieTitle );
    if (filmExists(movieTitle)) {
      Film.findOne({ 'title' : movieTitle }, function ( err, film ) {
        if ( err ) {
          throw new Error(err);
        }
        console.log(film)
      });
    } else {
      var film = new Film({ title : movieTitle });
      film.save(function (err, film, numAffected) {
        if ( err ) {
          throw new Error(err);
        }
        console.log(film, 'Film saved')
      })

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
    }

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