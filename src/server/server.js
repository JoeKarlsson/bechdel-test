const express = require('express');
const webpack = require('webpack');
const webpackHotMiddleware = require('webpack-hot-middleware');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const partials = require('express-partials');
const favicon = require('express-favicon');
const Promise = require('bluebird');
const film = require('./routes/film');
const webpackDevConfig = require('./helper/webpackDevConfig');
const devResponse = require('./helper/responseDev');
const prodResponse = require('./helper/responseProd');
const handleListen = require('./helper/handleListen');
const log = require('./helper/log');
const meta = require('./helper/meta');

const app = express();

app.use(partials());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(favicon(`${__dirname}/favicon.ico`));

Promise.onPossiblyUnhandledRejection((err) => {
  throw new Error(err);
});

app.use('/api/film', film);

if (meta.isDeveloping) {
	app.set('host', 'http://localhost');
	app.use(webpackDevConfig.middleware);
	app.use(webpackHotMiddleware(webpackDevConfig.compiler));
	app.get('*', devResponse);
} else {
	app.use(express.static('dist'));
	app.get('*', prodResponse);
}

if (!module.parent) {
	app.listen(meta.port, handleListen(meta.port, log));
}

module.exports = app;
