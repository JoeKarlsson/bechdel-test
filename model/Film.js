'use strict'

const db = require('./index.js');
const mongoose = require('mongoose');

let filmSchema = mongoose.Schema({
  title : String,
  plot : String,
  simplePlot : String,
  year : Number,
  Actors : [ { actorName : String, character : String } ],
  directors : [ { name : String, id : String } ],
  writers : [ { name : String, id : String } ],
  rated : String,
  genres : [ String ],
  urlPoster : String,
  idIMDB : String,
  urlIMDB : String,
  createdAt : { type : Date, default : Date.now },
  updatedAt : { type : Date, default : Date.now },
  bechdelResults : {
    pass : Boolean,
    bechdelScore : Number,
    numScenesPass : Number,
    numScenesDontPass : Number,
    numOfFemalesChars : Number,
    numOfMaleChars : Number,
    numOfFemalesCharsWithDialogue : Number,
    numOfMaleCharsWithDialogue : Number,
    totalLinesFemaleDialogue : Number,
    totalLinesMaleDialogue : Number
  }
});

const Film = mongoose.model( 'Film', filmSchema);

module.exports = Film;