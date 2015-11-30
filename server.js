/// <reference path="typings/tsd.d.ts"/>

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

var fs = require('fs'); //node tool for reading and writing from the file system
var Q = require('q'); //A tool for creating and composing asynchronous promises
var request = require('request');

var routes = require('./routes/index');
var about = require('./routes/about');

//My Methods
var omdb = require('./methods/omdb');
var beschel = require('./methods/beschel');

//test movie scripts
// var scriptPath = './scripts/fault-in-our-stars.txt';
var scriptPath = './scripts/taxi-driver.txt';
// var scriptPath = './scripts/american-hustle.txt';

var app = express();

app.locals.isProd = (app.get('env') === 'production');

// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, 'server/views'));
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/client/favicon.ico'));
app.use(logger('dev'));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client')));
app.use(bodyParser.urlencoded({ extended : false }));

// routes
app.use('/', routes);
app.use('/about', about);


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

readMovieTitle(scriptPath)
.then(function (movieTitle) {
  // If the HTTP response returns 200 OK, log the response text.
  console.log('Movie Script Title: ', movieTitle);
  return omdb.getOmdbData(movieTitle)
    .then(function(movieCharacters) {
      return readScript(scriptPath)
        .then(function (movieScript) {
          return beschel.extractScenes(movieScript)
            .then(function (sceneArray) {
              return beschel.sceneAnalysis(movieCharacters, sceneArray)
                .then(function (result) {

                }, function (error) {
                  // If there's an error or a non-200 status code, log the error.
                  console.error(error);
                })

            }, function (error) {
                // If there's an error or a non-200 status code, log the error.
                console.error(error);
              })

        }, function (error) {
            // If there's an error or a non-200 status code, log the error.
            console.error(error);
          })
    }, function (error) {
        // If there's an error or a non-200 status code, log the error.
        console.error(error);
      })
}, function (error) {
  // If there's an error or a non-200 status code, log the error.
  console.error(error);
})
.catch(function (error) {
  // Handle any error from all above steps
})
.done();

