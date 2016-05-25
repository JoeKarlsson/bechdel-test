/* eslint strict: 0*/
'use strict';

const Promise = require('bluebird');
const request = require('request');
const Film = require('../model/Film');
const CONFIG = require('./../config/config.json');
let filmData = {
  actors: [],
  images: {},
};
let imdbID = null;

/**
 * Find Film in the datavase by ID
 * @param  {[String]} id [description]
 * @return {[type]}    [description]
 */
module.exports.findByID = (id) => {
  if (!id) {
    throw new Error('Invalid findByID input');
  }
  return Film.findById(id).exec()
  .then((film) => film)
  .catch((err) => {
    throw new Error(err);
  });
};

module.exports.findByTitle = (movieTitle) => {
  if (!movieTitle) {
    throw new Error('No film tile found');
  }
  return Film.find({ title: movieTitle }).exec()
  .then((film) => film)
  .catch((err) => {
    throw new Error(err);
  });
};

module.exports.listAll = () => {
  const query = Film.find();

  return query.exec((err, films) => {
    if (err) {
      throw new Error(err);
    }
    return films;
  });
};

const save = (film) => {
  if (!film) {
    throw new Error('Cannot save film');
  }
  return film.save()
  .then(() => film)
  .catch((err) => {
    throw new Error(err);
  });
};

const parseActorArr = (arr) => {
  if (!arr) {
    throw new Error('Cannot parseActorArr');
  }
  const actorsArr = [];
  let i;
  for (i = 0; i < arr.length; i++) {
    const actor = {};
    actor.actorName = arr[i].actorName;
    actor.character = arr[i].character;
    actor.actorActress = arr[i].gender;
    actorsArr.push(actor);
  }
  return actorsArr;
};

const parseImageData = (images) => {
  if (!images) {
    throw new Error('Cannot parseImageData');
  }
  const img = {};

  img.backdrop = `https://image.tmdb.org/t/p/w1000${images.backdrops[0].file_path}`;
  img.poster = `https://image.tmdb.org/t/p/w300${images.posters[0].file_path}`;
  return img;
};

module.exports.insert = (filmTitle, bechdelResults, data, images) => {
  if (
    !filmTitle ||
    !bechdelResults ||
    !data ||
    !images
  ) {
    throw new Error('Cannot insert film');
  }
  const film = new Film({ title: filmTitle });
  film.bechdelResults = bechdelResults;
  film.plot = data[0].plot;
  film.simplePlot = data[0].simplePlot;
  film.year = data[0].year;
  film.directors = data[0].directors;
  film.writers = data[0].writers;
  film.rated = data[0].rated;
  film.genres = data[0].genres;
  film.urlPoster = data[0].urlPoster;
  film.idIMDB = data[0].idIMDB;
  film.urlIMDB = data[0].urlIMDB;
  film.actors = parseActorArr(data[0]);
  film.images = parseImageData(images);
  console.log('done')

  return save(film)
  .then((savedFilm) => savedFilm)
  .catch((error) => {
    throw new Error(error);
  });
};

module.exports.deleteFilm = (filmID) => {
  if (!filmID) {
    throw new Error('Invalid input on deleteFilm');
  }
  return Film.findOne({ _id: filmID }).exec()
  .then((film) => film.remove())
  .catch((error) => {
    throw new Error(error);
  });
};

const createCharcArr = (arr, characters, type) => {
  if (!arr || !characters || !type) {
    throw new Error('Invalid input on createCharcArr');
  }
  let castType;
  let cleanName;
  let i;

  for (i = 0; i < characters.length; i++) {
    cleanName = characters[i].character.replace(/'([^']+(?='))'/g, '$1').toUpperCase();
    if (
      cleanName !== '' ||
      cleanName !== undefined ||
      cleanName !== null ||
      'biography' in characters[i]
      ) {
      if (type === 'fullCast') {
        castType = true;
      } else {
        castType = false;
      }
      arr.push({
        actorName: characters[i].actorName,
        gender: characters[i].biography.actorActress,
        characterName: cleanName,
        mainCast: castType,
      });
    }
  }
  return arr;
};

const dataParser = (body, type) => {
  if (!body || !type) {
    throw new Error('Body is undefined');
  }
  const rawMovieCharacters = body.data.movies[0].actors;
  let movieCharacters = [];

  if (rawMovieCharacters !== undefined || null || '') {
    movieCharacters = createCharcArr(movieCharacters, rawMovieCharacters, type);
  } else {
    throw new Error('Error: Connected to myfilmapi, but no actor data returned');
  }
  filmData.actors.push(movieCharacters);
  return movieCharacters;
};

const getFilmImages = (ID) => {
  return new Promise((resolve, reject) => {
    if (!ID) {
      reject(new Error('No IMDB ID found.'));
    }
    request(
      'https://api.themoviedb.org/3/movie/' +
      `${ID}/images?` +
      `api_key=${CONFIG.THEMOVIEDB}` +
      '&language=en&' +
      'include_image_language=en,null',
      (error, response, body) => {
        if (!error && response.statusCode === 200) {
          const images = JSON.parse(body);
          resolve(images);
        } else {
          reject(new Error(error));
        }
      });
  });
};

const getSimpleCastData = (title) => {
  return new Promise((resolve, reject) => {
    if (!title) {
      reject(new Error('No Title sent getSimpleCastData'));
    }
    request(
      'http://api.myapifilms.com/imdb/idIMDB?' +
      `title=${title}&` +
      `token=${CONFIG.MYAPIFILMS}&` +
      'format=json&' +
      'language=en-us&' +
      'aka=0&' +
      'business=0&' +
      'seasons=0&' +
      'seasonYear=0&' +
      'technical=0&' +
      'filter=3&' +
      'exactFilter=0&' +
      'limit=1&' +
      'forceYear=0&' +
      'trailers=0&' +
      'movieTrivia=0&' +
      'awards=0&' +
      'moviePhotos=0&' +
      'movieVideos=0&' +
      'actors=1&' +
      'biography=1&' +
      'uniqueName=0&' +
      'filmography=0&' +
      'bornAndDead=0&' +
      'starSign=0&' +
      'actorActress=1&' +
      'actorTrivia=0&' +
      'similarMovies=0&' +
      'adultSearch=0',
      (error, response, body) => {
        if (!error && response.statusCode === 200) {
          const data = JSON.parse(body);
          imdbID = data.data.movies[0].idIMDB;
          resolve(dataParser(data, 'mainCast'));
        } else {
          reject(new Error(error));
        }
      }
    );
  });
};

const getFullCastData = (title) => {
  return new Promise((resolve, reject) => {
    request(
      'http://api.myapifilms.com/imdb/idIMDB?' +
      `title=${title}&` +
      `token=${CONFIG.MYAPIFILMS}&` +
      'format=json&' +
      'language=en-us&' +
      'aka=0&' +
      'business=0&' +
      'seasons=0&' +
      'seasonYear=0&' +
      'technical=0&' +
      'filter=3&' +
      'exactFilter=0&' +
      'limit=1&' +
      'forceYear=0&' +
      'trailers=0&' +
      'movieTrivia=0&' +
      'awards=0&' +
      'moviePhotos=0&' +
      'movieVideos=0&' +
      'actors=2&' +
      'biography=1&' +
      'uniqueName=0&' +
      'filmography=0&' +
      'bornAndDead=0&' +
      'starSign=0&' +
      'actorActress=1&' +
      'actorTrivia=0&' +
      'similarMovies=0&' +
      'adultSearch=0',
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const data = JSON.parse(body);
        resolve(dataParser(data, 'fullCast'));
      } else {
        reject(new Error(error));
      }
    });
  });
};

module.exports.getData = (movieTitle) => {
  return new Promise((resolve, reject) => {
    if (!movieTitle) {
      reject(new Error('Invalid Movie Title'));
    }
    const splitTitle = movieTitle
      .split(' ')
      .join('+');
    getSimpleCastData(splitTitle)
    .then((simpleCastdata) => {
      if (!simpleCastdata) {
        reject(new Error('Failed on getSimpleCastData'));
      }
      getFilmImages(imdbID)
      .then((images) => {
        if (!images) {
          reject(new Error('Failed on getFilmImages'));
        }
        filmData.images = images;
      });
      return getFullCastData(splitTitle)
      .then((fullCastdata) => {
        if (!fullCastdata) {
          reject(new Error('Failed on getFullCastData'));
        }
        resolve(filmData.actors);
      });
    })
    .catch((err) => {
      throw new Error(err);
    });
  });
};

module.exports.getAllData = () => {
  if (
    filmData.actors === [] ||
    filmData.images === {}
  ) {
    throw new Error('No film data found');
  }
  return filmData;
};

module.exports.clearData = () => {
  filmData = {
    actors: [],
    images: {},
  };
};
