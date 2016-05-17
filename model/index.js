'use strict'

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/bechdelTest');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected')
  // We're connected to MongoDB
});

module.exports = db;