const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/bechdelTest');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  // We're connected to MongoDB
});

module.exports = db;