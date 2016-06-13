/* eslint strict: 0 */
'use strict';

const Promise = require('bluebird');
const request = require('request');
const Film = require('../model/Film');
const CONFIG = require('./../config/config.json');
let filmData = {
  actors: [],
  images: {},
  data: [],
};
let imdbID = null;

/**
 * Find Film in the datavase by ID
 * @param  {[String]} id [description]
 * @return {[type]}    [description]
 */
module.exports.findByID = (id) => {
  const promise = new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(new Error('Invalid findByID input'));
    }
    return Film.find({ _id: id }).exec()
    .then((film) => {
      if (Array.isArray(film)) {
        return resolve(film[0]);
      }
      return resolve(film);
    })
    .catch((err) => {
      reject(new Error(err));
    });
  });
  return promise;
};


module.exports.findByTitle = (movieTitle) => {
  const promise = new Promise((resolve, reject) => {
    if (!movieTitle) {
      reject(new Error('No film tile found'));
    }
    Film.find({ title: movieTitle }).exec()
    .then((film) => {
      if (Array.isArray(film)) {
        return resolve(film[0]);
      }
      return resolve(film);
    })
    .catch((err) => {
      throw new Error(err);
    });
  });
  return promise;
};

const save = (film) => {
  const promise = new Promise((resolve, reject) => {
    if (!film) {
      throw new Error('Cannot save film');
    }
    film.save()
    .then(() => {
      resolve(film);
    })
    .catch((err) => {
      reject(new Error(err));
    });
  });
  return promise;
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

module.exports.insert = (filmTitle, bechdelResults, actors, images, data) => {
  if (
    !filmTitle ||
    !bechdelResults ||
    !actors ||
    !images
  ) {
    throw new Error('Cannot insert film into the database');
  }
  const film = new Film({ title: filmTitle });
  film.bechdelResults = bechdelResults;
  film.plot = data[0].plot;
  film.simplePlot = data[0].simplePlot;
  film.year = data[0].year;
  film.releaseDate = data[0].releaseDate;
  film.directors = data[0].directors;
  film.writers = data[0].writers;
  film.rated = data[0].rated;
  film.genres = data[0].genres;
  film.urlPoster = data[0].urlPoster;
  film.idIMDB = data[0].idIMDB;
  film.rating = data[0].rating;
  film.metascore = data[0].metascore;
  film.urlIMDB = data[0].urlIMDB;
  film.actors = parseActorArr(actors[0]);
  film.images = parseImageData(images);

  return save(film)
  .then((savedFilm) => {
    if (Array.isArray(savedFilm)) {
      return savedFilm[0];
    }
    return savedFilm;
  })
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
    throw new Error('invalid dataParser input');
  }
  const rawMovieCharacters = body.data.movies[0].actors;
  let movieCharacters = [];

  if (rawMovieCharacters !== []) {
    movieCharacters = createCharcArr(movieCharacters, rawMovieCharacters, type);
  } else {
    throw new Error('Error: Connected to myfilmapi, but no actor data returned');
  }
  filmData.actors.push(movieCharacters);
  return movieCharacters;
};

const getFilmImages = (ID) => {
  const promise = new Promise((resolve, reject) => {
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
      }
    );
  });
  return promise;
};

module.exports.getSimpleCastData = (title) => {
  const promise = new Promise((resolve, reject) => {
    if (!title) {
      throw new Error('No Title sent getSimpleCastData');
    }
    request.get(
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
        if (!error) {
          const data = JSON.parse(body);
          filmData.data.push(data);
          imdbID = data.data.movies[0].idIMDB;
          resolve(data);
        }
        reject(new Error(error));
      }
    );
  });
  return promise;
};

module.exports.getFullCastData = (title) => {
  const promise = new Promise((resolve, reject) => {
    request.get(
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
      if (!error) {
        const data = JSON.parse(body);
        filmData.data.push(data);
        resolve(data);
      } else {
        reject(new Error(error));
      }
    });
  });
  return promise;
};

module.exports.getData = (movieTitle) => {
  const promise = new Promise((resolve, reject) => {
    if (!movieTitle) {
      reject(new Error('Invalid Movie Title'));
    }
    const splitTitle = movieTitle
      .split(' ')
      .join('+');
    this.getSimpleCastData(splitTitle, dataParser)
    .then((simpleCastdata) => {
      if (!simpleCastdata) {
        reject(new Error('Failed on getSimpleCastData'));
      }
      dataParser(simpleCastdata, 'mainCast');
      getFilmImages(imdbID)
      .then((images) => {
        if (!images) {
          reject(new Error('Failed on getFilmImages'));
        }
        filmData.images = images;
      });
      return this.getFullCastData(splitTitle)
      .then((fullCastdata) => {
        if (!fullCastdata) {
          reject(new Error('Failed on getFullCastData'));
        }
        dataParser(fullCastdata, 'fullCast');
        resolve(filmData.actors);
      });
    })
    .catch((err) => {
      throw new Error(err);
    });
  });
  return promise;
};

module.exports.getAllData = () => {
  if (
    filmData.actors === [] ||
    filmData.images === {} ||
    filmData.data === []
  ) {
    throw new Error('No film data found');
  }
  return filmData;
};

module.exports.clearData = () => {
  filmData = {
    actors: [],
    images: {},
    data: [],
  };
};
