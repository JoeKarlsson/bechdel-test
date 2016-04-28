'use strict'

const Q = require('q');
const request = require('request');
const omdbDataScrubber = require('./omdbDataScrubber.js');
const config = require('../config/config.json');

let omdbData = [];

module.exports.getOmdbData = (movieTitle) => {
  return Q.promise(function (resolve, reject) {

    if (movieTitle === '') {
      reject('Invalid Movie Title');
    }

    var splitTitle = movieTitle.split(' ').join('+');

    omdbSimpleCast(splitTitle)
      .then(function (data) {
        return omdbFullCast(splitTitle)
          .then(function (movieCharacters) {
            console.log('Finished retrieving all data from myapifilms..');
            resolve(movieCharacters);
          }), function (error) {
            // If there's an error or a non-200 status code, log the error.
            reject(error);
          }
      }, function (error) {
          // If there's an error or a non-200 status code, log the error.
          reject(error);
        })
  })
}

const omdbSimpleCast = ( splitTitle ) => {
  return Q.promise( function ( resolve, reject ) {
    console.log('Started phase I - Retrieving simple movie data via myapifilms...');

    request('http://api.myapifilms.com/imdb/idIMDB?title=' + splitTitle + '&token=' + config.myapifilms + '&format=json&language=en-us&aka=0&business=0&seasons=0&seasonYear=0&technical=0&filter=3&exactFilter=0&limit=1&forceYear=0&trailers=0&movieTrivia=0&awards=0&moviePhotos=0&movieVideos=0&actors=1&biography=1&uniqueName=0&filmography=0&bornAndDead=0&starSign=0&actorActress=1&actorTrivia=0&similarMovies=0&adultSearch=0', (error, response, body) => {
      if ( !error && response.statusCode == 200 ) {
        // Show the request for the omdb api.
        let data = JSON.parse( body );
        omdbData.push( data.data.movies[0] );
        resolve(omdbDataScrubber( data, 'mainCast' ));
      }  else {
        reject( error );
      }
    });
  });
};

const omdbFullCast = (splitTitle) => {
  return Q.promise(function (resolve, reject) {
    console.log('Started Phase II - Retreiving full character data from myapifilms..');

    request('http://api.myapifilms.com/imdb/idIMDB?title=' + splitTitle + '&token=' + config.myapifilms + '&format=json&language=en-us&aka=0&business=0&seasons=0&seasonYear=0&technical=0&filter=3&exactFilter=0&limit=1&forceYear=0&trailers=0&movieTrivia=0&awards=0&moviePhotos=0&movieVideos=0&actors=2&biography=1&uniqueName=0&filmography=0&bornAndDead=0&starSign=0&actorActress=1&actorTrivia=0&similarMovies=0&adultSearch=0',
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        let data = JSON.parse( body );
        resolve(omdbDataScrubber(data, 'fullCast'));
      }  else {
        reject(error);
      }
    });
  });
};

module.exports.getAllOmdbBData = (cb) => {
  return cb(omdbData);
};

module.exports.clearOmdbBData = () => {
  omdbData = [];
};