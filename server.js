var express = require('express');
var path = require('path');
var os = require('os');
var pkg = require('./package.json');

var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var multer = require('multer');
var errorHandler = require('errorhandler');
var mds = require('markdown-serve');
var winston = require('./server/logger.js');
var d3 = require('d3');
var jsdom = require('node-jsdom');

var fs = require('fs'); //node tool for reading and writing from the file system
var Q = require('q'); //A tool for creating and composing asynchronous promises
var request = require('request');

var app = express();

var routes = require('./routes/index');
var about = require('./routes/about');
var films = require('./routes/films');
var philosophy = require('./routes/philosophy');
var caseStudy = require('./routes/case-study');
var americanSniper = require('./routes/american-sniper');
var birdman = require('./routes/birdman');
var boyhood = require('./routes/boyhood');
var foxcatcher = require('./routes/foxcatcher');
var goneGirl = require('./routes/gone-girl');
var grandBudapestHotel = require('./routes/grand-budapest-hotel');
var imitationGame = require('./routes/imitation-game');
var intoTheWoods = require('./routes/into-the-woods');
var stillAlice = require('./routes/still-alice');
var theoryOfEverything = require('./routes/theory-of-everything');
var judge = require('./routes/judge');
var whiplash = require('./routes/whiplash');
var wild = require('./routes/wild');
var contact = require('./routes/contact');

// routes
app.use('/', routes);
app.use('/about', about);
app.use('/films', films);
app.use('/philosophy', philosophy);
app.use('/case-study', caseStudy);
app.use('/american-sniper', americanSniper);
app.use('/birdman', birdman);
app.use('/boyhood', boyhood);
app.use('/foxcatcher', foxcatcher);
app.use('/gone-girl', goneGirl);
app.use('/grand-budapest-hotel', grandBudapestHotel);
app.use('/imitation-game', imitationGame);
app.use('/into-the-woods', intoTheWoods);
app.use('/still-alice', stillAlice);
app.use('/theory-of-everything', theoryOfEverything);
app.use('/judge', judge);
app.use('/whiplash', whiplash);
app.use('/wild', wild);
app.use('/contact', contact);

//My Methods
var omdb = require('./methods/omdb');
var bechdel = require('./methods/bechdel');

//Test movie scripts
var scriptPath = './scripts/american-sniper.txt';
// var scriptPath = './scripts/birdman.txt';
// var scriptPath = './scripts/boyhood.txt'; //issues getting api
// var scriptPath = './scripts/foxcatcher.txt';
// var scriptPath = './scripts/gone-girl.txt';
// var scriptPath = './scripts/grand-budapest-hotel.txt';
// var scriptPath = './scripts/imitation-game.txt'; //issues getting api
// var scriptPath = './scripts/still-alice.txt';
// var scriptPath = './scripts/taxi-driver.txt';
// var scriptPath = './scripts/theory-of-everything.txt';
// var scriptPath = './scripts/whiplash.txt';
// var scriptPath = './scripts/american-hustle.txt';
// var scriptPath = './scripts/into-the-woods.txt';
// var scriptPath = './scripts/judge.txt';
// var scriptPath = './scripts/wild.txt';


app.locals.isProd = (app.get('env') === 'production');

// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, 'server/views'));
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/client/favicon/favicon.ico'));
app.use(logger('dev'));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client')));
app.use(bodyParser.urlencoded({ extended : false }));



// error handling middleware should be loaded last
// log for all environments
app.use(function(err, req, res, next) {
  winston.error(req.method + ' ' + req.url + ': ' + err.stack);
  next(err);
});

if ('development' === app.get('env')) {
  app.use(errorHandler());
  app.set('host', 'http://localhost');
}

// start
app.listen(app.get('port'), function() {
  var h = (app.get('host') || os.hostname() || 'unknown') + ':' + app.get('port');
  console.log('Express server listening at %s', h);
  winston.info('Server started');
});

function readMovieTitle(path) {
  return Q.promise(function (resolve, reject) {
    var rs = fs.createReadStream(path, { encoding : 'utf8' });
    var acc = '';
    var pos = 0;
    var index;

    rs.on('data', function (chunk) {
        index = chunk.indexOf('\n');
        acc += chunk;
        index !== -1 ? rs.close() : pos += chunk.length;
      })
      .on('close', function () {
        movieTitle = acc.slice(0, pos + index);
        resolve(movieTitle);
      })
      .on('error', function (err) {
        reject(err);
      })
  });
};

function readScript(path) {
  return Q.promise(function (resolve, reject) {
    var rs = fs.createReadStream(path, { encoding : 'utf8' });
    var movieScript = '';

    rs.on('data', function (chunk) {
        movieScript += chunk;
      })
      .on('close', function () {
        // console.log(movieScript);
        resolve(movieScript);
      })
      .on('error', function (err) {
        reject(err);
      })
  });
};

//In order to test locally, you must uncomment this section. I have commented this out, because I was making too many API calls on the server and it was causing issues when testing.

// readMovieTitle(scriptPath)
// .then(function (movieTitle) {
//   // If the HTTP response returns 200 OK, log the response text.
//   console.log('Movie Script Title: ', movieTitle);
//   return omdb.getOmdbData(movieTitle)
//     .then(function(movieCharacters) {
//       return readScript(scriptPath)
//         .then(function (movieScript) {
//           return bechdel.extractScenes(movieCharacters, movieScript)
//             .then(function (sceneArray) {
//               return bechdel.sceneAnalysis(movieCharacters, sceneArray)
//                 .then(function (result) {

//                 }, function (error) {
//                   // If there's an error or a non-200 status code, log the error.
//                   console.error(error);
//                 })

//             }, function (error) {
//                 // If there's an error or a non-200 status code, log the error.
//                 console.error(error);
//               })

//         }, function (error) {
//             // If there's an error or a non-200 status code, log the error.
//             console.error(error);
//           })
//     }, function (error) {
//         // If there's an error or a non-200 status code, log the error.
//         console.error(error);
//       })
// }, function (error) {
//   // If there's an error or a non-200 status code, log the error.
//   console.error(error);
// })
// .catch(function (error) {
//   // Handle any error from all above steps
// })
// .done();

