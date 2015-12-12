var Q = require('q'); //A tool for creating and composing asynchronous promises
var request = require('request');

//Token for http://api.myapifilms.com/imdb.do
var myapifilmstoken = 'd44147a7-5e6e-4450-92ba-773be44791ce';

// Sample complete URL call - used for troubleshooting api
// http://api.myapifilms.com/imdb/idIMDB?title=gone+girl&token=d44147a7-5e6e-4450-92ba-773be44791ce&format=json&language=en-us&aka=0&business=0&seasons=0&seasonYear=0&technical=0&filter=3&exactFilter=0&limit=1&forceYear=0&trailers=0&movieTrivia=0&awards=0&moviePhotos=0&movieVideos=0&actors=1&biography=1&uniqueName=0&filmography=0&bornAndDead=0&starSign=0&actorActress=1&actorTrivia=0&similarMovies=0&adultSearch=0

var movieCharacters = [];

module.exports.getOmdbData = function (movieTitle) {
  return Q.promise(function (resolve, reject) {

    if (movieTitle === '') {
      reject('Invalid Movie Title');
    }

    var splitTitle = movieTitle.split(' ').join('+');

    omdbSimpleCast(splitTitle)
      .then(function (data) {
        return omdbFullCast(splitTitle)
          .then(function () {
            console.log('Finished retrieving all data from myapifilms..');
            resolve(movieCharacters);
          }), function (error) {
            // If there's an error or a non-200 status code, log the error.
            console.error(error);
          }
      }, function (error) {
          // If there's an error or a non-200 status code, log the error.
          console.error(error);
        })
  })
}

function omdbSimpleCast(splitTitle) {
  return Q.promise(function (resolve, reject) {
    console.log('Started phase I - Retrieving simple movie data via myapifilms...');

    request('http://api.myapifilms.com/imdb/idIMDB?title=' + splitTitle + '&token=' + myapifilmstoken + '&format=json&language=en-us&aka=0&business=0&seasons=0&seasonYear=0&technical=0&filter=3&exactFilter=0&limit=1&forceYear=0&trailers=0&movieTrivia=0&awards=0&moviePhotos=0&movieVideos=0&actors=1&biography=1&uniqueName=0&filmography=0&bornAndDead=0&starSign=0&actorActress=1&actorTrivia=0&similarMovies=0&adultSearch=0', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve(omdbDataParser(body, 'mainCast'));
      }  else {
        reject(error);
      }
    })
  })
}

function omdbFullCast(splitTitle) {
  return Q.promise(function (resolve, reject) {
    console.log('Started Phase II - Retreiving full character data from myapifilms..');

    request('http://api.myapifilms.com/imdb/idIMDB?title=' + splitTitle + '&token=' + myapifilmstoken + '&format=json&language=en-us&aka=0&business=0&seasons=0&seasonYear=0&technical=0&filter=3&exactFilter=0&limit=1&forceYear=0&trailers=0&movieTrivia=0&awards=0&moviePhotos=0&movieVideos=0&actors=2&biography=1&uniqueName=0&filmography=0&bornAndDead=0&starSign=0&actorActress=1&actorTrivia=0&similarMovies=0&adultSearch=0',
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve(omdbDataParser(body, 'fullCast'));
      }  else {
        reject(error);
      }
    })
  })
}

function omdbDataParser(body, inputType) {
  if (body === undefined || null || '' ) {
    console.error('Body is undefined');
  }

  movieData = JSON.parse(body); // Show the request for the omdb api.
  console.log(movieData);

  // if ( 'actors' in movieData.data ) {

  rawMovieCharacters = movieData.data.movies[0].actors;

  //Save character/actor & actress data to the movieCharacters array
  var charObj;
  for (var i = 0; i < rawMovieCharacters.length; i++) {
    //TODO Format char names - still has 'around some of the names'
    var characterNameFormatted = rawMovieCharacters[i].character.replace(/'([^']+(?='))'/g, '$1').toUpperCase();
    console.log(characterNameFormatted);

    //If a char is missing biography info - skip this character
    if ( characterNameFormatted = '') {
      if ( 'biography' in rawMovieCharacters[i] ) {
        if ( inputType === 'fullCast') {
          var castType = true;
        } else {
          castType = false
        }
        movieCharacters.push({
              'actorName' : rawMovieCharacters[i].actorName,
              'gender' : rawMovieCharacters[i].biography.actorActress,
              'characterName' : characterNameFormatted,
              'mainCast' : castType
            });

      }
    }

  }

  // } else {
  //   console.error('Error: Connected to myfilmapi, but no actor data returned');
  // }

  //Returns an array of movie characters with gender data
  return movieCharacters;
}