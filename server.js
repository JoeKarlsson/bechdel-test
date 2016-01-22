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
var request = require('request');
var readAndAnalyzeScript = require('./methods/readScript');
var app = express();
var index = require('./routes/index');
var about = require('./routes/about');
var film = require('./routes/film');
var philosophy = require('./routes/philosophy');
var caseStudy = require('./routes/case-study');
var contact = require('./routes/contact');

app.locals.isProd = (app.get('env') === 'production');

// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, 'server/views'));
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/client/favicon/favicon.ico'));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'client')));

// parsing for http requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }));
app.use(methodOverride());
app.use(methodOverride(function(req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

// error handling middleware should be loaded last
// log for all environments
app.use((err, req, res, next) => {
  winston.error(req.method + ' ' + req.url + ': ' + err.stack);
  next(err);
});

if ( 'development' === app.get( 'env' ) ) {
  app.use(errorHandler());
  app.set('host', 'http://localhost');
}



// common routes
app.use('/film', film);

// var americanSniper = require('./routes/american-sniper');
// var birdman = require('./routes/birdman');
// var boyhood = require('./routes/boyhood');
// var foxcatcher = require('./routes/foxcatcher');
// var goneGirl = require('./routes/gone-girl');
// var grandBudapestHotel = require('./routes/grand-budapest-hotel');
// var imitationGame = require('./routes/imitation-game');
// var intoTheWoods = require('./routes/into-the-woods');
// var stillAlice = require('./routes/still-alice');
// var theoryOfEverything = require('./routes/theory-of-everything');
// var judge = require('./routes/judge');
// var whiplash = require('./routes/whiplash');
// var wild = require('./routes/wild');


// routes
app.use('/', index);
app.use('/about', about);
app.use('/films', film);
app.use('/philosophy', philosophy);
app.use('/case-study', caseStudy);
// app.use('/american-sniper', americanSniper);


// start
app.listen(app.get('port'), function() {
  var h = (app.get('host') || os.hostname() || 'unknown') + ':' + app.get('port');
  console.log('Express server listening at %s', h);
  winston.info('Server started');
});

readAndAnalyzeScript();