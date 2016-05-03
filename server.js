'use strict';

const express        = require('express');
const app            = express();
const path           = require('path');
const os             = require('os');
const favicon        = require('serve-favicon');
const logger         = require('morgan');
const bodyParser     = require('body-parser');
const methodOverride = require('method-override');
const errorHandler   = require('errorhandler');
const winston        = require('./server/logger.js');
const Promise        = require('bluebird');
const root           = require('./routes/root');
const film           = require('./routes/film');

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

Promise.onPossiblyUnhandledRejection(function(error){
    throw error;
});

// error handling middleware should be loaded last
// log for all environments
app.use((err, req, res, next) => {
  winston.error(req.method + ' ' + req.url + ': ' + err.stack);
  next(err);
});

if ( 'development' === app.get( 'env' )) {
  app.use(errorHandler());
  app.set('host', 'http://localhost');
}

// routes
app.use('/', root);
app.use('/film', film);
app.get('/404', (req, res) => {
  res.render('404');
});
app.all('*', (req, res ) => {
  res.redirect('/404');
});

app.listen(app.get('port'), () => {
  const h = (app.get('host') || os.hostname() || 'unknown') + ':' + app.get('port');
  console.log('Express server listening at %s', h);
  winston.info('Server started');
});