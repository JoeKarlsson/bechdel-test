/*
  eslint
    no-unused-expressions: 0,
    func-names: 0,
    strict: 0,
    new-cap:0,
    arrow-body-style: 0
*/
/* eslint-env mocha, mongo */
'use strict';

require('./index.js');
const Promise = require('bluebird');
const mongoose = Promise.promisifyAll(require('mongoose'));
mongoose.Promise = require('bluebird');

const filmSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  plot: String,
  simplePlot: String,
  year: Number,
  releaseDate: String,
  actors: [{
    actorName: String,
    character: String,
    actorActress: String,
  }],
  directors: [{
    name: String,
    id: String,
  }],
  writers: [{
    name: String,
    id: String,
  }],
  rated: String,
  genres: [String],
  urlPoster: String,
  idIMDB: String,
  urlIMDB: String,
  rating: String,
  metascore: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bechdelResults: {
    pass: Boolean,
    bechdelScore: Number,
    numScenesPass: Number,
    numScenesDontPass: Number,
    numOfFemalesChars: Number,
    numOfMaleChars: Number,
    numOfFemalesCharsWithDialogue: Number,
    numOfMaleCharsWithDialogue: Number,
    totalLinesFemaleDialogue: Number,
    totalLinesMaleDialogue: Number,
  },
  images: {
    backdrop: String,
    poster: String,
  },
});

filmSchema.static('listAll', function () {
  const promise = new Promise((resolve) => {
    this.find()
    .sort('-date')
    .exec()
    .then((result) => {
      return resolve(result);
    });
  });
  return promise;
});

filmSchema.static('findByID', function (id) {
  const promise = new Promise((resolve) => {
    this.find({ _id: id })
    .sort('-date')
    .exec()
    .then((result) => {
      if (Array.isArray(result)) {
        return resolve(result[0]);
      }
      return resolve(result);
    });
  });
  return promise;
});

filmSchema.static('findByTitle', function (movieTitle) {
  const promise = new Promise((resolve, reject) => {
    if (!movieTitle) {
      reject(new Error('No film tile found'));
    }
    this.find({ title: movieTitle }).exec()
    .then((result) => {
      if (Array.isArray(result)) {
        return resolve(result[0]);
      }
      return resolve(result);
    })
    .catch((err) => {
      throw new Error(err);
    });
  });
  return promise;
});

const Film = mongoose.model('Film', filmSchema);

module.exports = Film;
