'use strict'

var express = require('express');
var app = express();
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
var request = require('request');

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
app.use((err, req, res, next) => {
  winston.error(req.method + ' ' + req.url + ': ' + err.stack);
  next(err);
});

if ('development' === app.get( 'env' )) {
  app.use(errorHandler());
  app.set('host', 'http://localhost');
};

var root = require('./routes/root');
var film = require('./routes/film');

// var americanSniper = require('./routes/american-sniper');

// routes
app.use('/', root);
app.use('/film', film);

app.get('/404', (req, res) => {
  res.render('404');
});

app.all('*', (req, res ) => {
  res.redirect('/404');
});

// start
app.listen(app.get('port'), () => {
  var h = (app.get('host') || os.hostname() || 'unknown') + ':' + app.get('port');
  console.log('Express server listening at %s', h);
  winston.info('Server started');
});