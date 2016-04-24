const db = require('./index.js');

const filmSchema = mongoose.Schema({
  title : String,
  date: { type: Date, default: Date.now }
});

const Film = mongoose.model('Film', filmSchema);