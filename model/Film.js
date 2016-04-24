'use strict'

const db = require('./index.js');
const mongoose = require('mongoose');

let filmSchema = mongoose.Schema({
  title : String,
  date : { type : Date, default : Date.now },
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
});

const Film = mongoose.model( 'Film', filmSchema);

module.exports = Film;