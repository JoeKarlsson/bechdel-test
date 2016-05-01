'use strict'

const Q       = require('q');
const request = require('request');
const Film    = require('../model/Film');
const CONFIG  = require('../config/config.json');

let filmData = [];

module.exports.findByID = (id) => {
  if (id == null) {
    throw new Error('No  ID found');
  };
  let query = Film.findById(id);

  return query.exec(function(err, film) {
    if (err) {
      throw new Error(err);
    };
    return film;
  });
};

module.exports.findByTitle = (title) => {
  if (title == null) {
    throw new Error('No film tile found');
  };
  let query = Film.find({ title :title });

  return query.exec(function(err, film) {
    if (err) {
      throw new Error(err);
    };
    return film;
  });
};

module.exports.listAll = () => {
  let query = Film.find();

  return query.exec((err, films) => {
    if (err) {
      throw new Error(err);
    };
    return films;
  });
};

const save = (film) => {
  return film.save((err, film) => {
    if (err) {
      throw new Error(err);
    };
    return film;
  });
};

module.exports.insert = (filmTitle, bechdelResults, data) => {
  let film            = new Film({ title : filmTitle });
  film.bechdelResults = bechdelResults;
  film.plot           = data[0].plot;
  film.simplePlot     = data[0].simplePlot;
  film.year           = data[0].year;
  film.directors      = data[0].directors;
  film.writers        = data[0].writers;
  film.rated          = data[0].rated;
  film.genres         = data[0].genres;
  film.urlPoster      = data[0].urlPoster;
  film.idIMDB         = data[0].idIMDB;
  film.urlIMDB        = data[0].urlIMDB;
  film.actors         = parseActorArr(data[0].actors);

  return save(film)
  .then((film) => {
    return film;
  })
  .catch( (error) => {
    throw new Error(error);
  });
};

const parseActorArr = (arr) => {
  let actorsArr = [];
  let i;

  for (i = 0; i < arr.length; i++) {
    let actor = {};
    actor.actorName = arr[i].actorName;
    actor.character = arr[i].character;
    actor.actorActress = arr[i].biography.actorActress;
    actorsArr.push(actor);
  };
  return actorsArr;
};

module.exports.delete = (filmID) => {
  let query = Film.findOne({ _id :filmID });
  return query.exec((err, film) => {
    if (err) {
      throw new Error(err);
    };
    return film.remove();
  });
};

module.exports.getData = (movieTitle) => {
  return Q.promise((resolve, reject) => {
    if (movieTitle === '') {
      reject('Invalid Movie Title');
    };
    let splitTitle = movieTitle.split(' ').join('+');
    omdbSimpleCast(splitTitle)
    .then((data) => {
      return omdbFullCast(splitTitle);
    })
    .then((movieCharacters) => {
      console.log('Finished retrieving all data from myapifilms..');
      resolve(movieCharacters);
    })
    .catch(function (err) {
      throw new Error(err);
    });
  });
};

const omdbSimpleCast = (splitTitle) => {
  return Q.promise((resolve, reject) => {
    console.log('Started phase I - Retrieving simple movie data via myapifilms...');

    request('http://api.myapifilms.com/imdb/idIMDB?title=' + splitTitle + '&token=' + CONFIG.myapifilms + '&format=json&language=en-us&aka=0&business=0&seasons=0&seasonYear=0&technical=0&filter=3&exactFilter=0&limit=1&forceYear=0&trailers=0&movieTrivia=0&awards=0&moviePhotos=0&movieVideos=0&actors=1&biography=1&uniqueName=0&filmography=0&bornAndDead=0&starSign=0&actorActress=1&actorTrivia=0&similarMovies=0&adultSearch=0', (error, response, body) => {
      if (!error && response.statusCode == 200) {
        let data = JSON.parse( body );
        filmData.push(data.data.movies[0]);
        resolve(omdbDataParser(data, 'mainCast'));
      } else {
        reject(error);
      };
    });
  });
};

const omdbFullCast = (splitTitle) => {
  return Q.promise((resolve, reject) => {
    console.log('Started Phase II - Retreiving full character data from myapifilms..');

    request('http://api.myapifilms.com/imdb/idIMDB?title=' + splitTitle + '&token=' + CONFIG.myapifilms + '&format=json&language=en-us&aka=0&business=0&seasons=0&seasonYear=0&technical=0&filter=3&exactFilter=0&limit=1&forceYear=0&trailers=0&movieTrivia=0&awards=0&moviePhotos=0&movieVideos=0&actors=2&biography=1&uniqueName=0&filmography=0&bornAndDead=0&starSign=0&actorActress=1&actorTrivia=0&similarMovies=0&adultSearch=0',
    (error, response, body) => {
      if (!error && response.statusCode == 200) {
        let data = JSON.parse( body );
        resolve(omdbDataParser(data, 'fullCast'));
      } else {
        reject(error);
      };
    });
  });
};

const omdbDataParser = (body, inputType) => {
  if (body === undefined || null || '') {
    throw new Error( 'Body is undefined' );
  };
  let rawMovieCharacters = body.data.movies[0].actors;
  let movieCharacters = [];

  if (rawMovieCharacters !== undefined || null || '') {
    movieCharacters = createOMDBCharcArr( movieCharacters, rawMovieCharacters, inputType );
  } else {
    throw new Error('Error: Connected to myfilmapi, but no actor data returned');
  };
  return movieCharacters;
};

const createOMDBCharcArr = (arr, rawMovieCharacters, inputType) =>  {
  let charObj,
      castType,
      characterNameFormatted,
      i;

  for (i = 0; i < rawMovieCharacters.length; i++) {
    characterNameFormatted = rawMovieCharacters[i].character.replace(/'([^']+(?='))'/g, '$1').toUpperCase();
    if (
      characterNameFormatted !== '' ||
      characterNameFormatted !== undefined ||
      characterNameFormatted !== null ||
      'biography' in rawMovieCharacters[i]
      ) {
      if (inputType === 'fullCast') {
        castType = true;
      } else {
        castType = false
      };
      arr.push({
        'actorName'     : rawMovieCharacters[i].actorName,
        'gender'        : rawMovieCharacters[i].biography.actorActress,
        'characterName' : characterNameFormatted,
        'mainCast'      : castType
      });
    };
  };
  return arr;
};

module.exports.getAllData = (cb) => {
  if (filmData.length === 0) {
    throw new Error('No OMDB data found');
  };
  return cb(filmData)
};

module.exports.clearData = () => {
  filmData = [];
};