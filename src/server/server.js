const express = require('express');
const app = express();

const webpackHotMiddleware = require('webpack-hot-middleware');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const partials = require('express-partials');
const Promise = require('bluebird');
const film = require('./routes/film');
const webpackDevConfig = require('./helper/webpackDevConfig');
const prodResponse = require('./helper/responseProd');
const handleListen = require('./helper/handleListen');
const log = require('./helper/log');
const meta = require('./helper/meta');

app.use(partials());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());

Promise.onPossiblyUnhandledRejection((err) => {
  throw new Error(err);
});

app.use('/api/film', film);

if (meta.isDeveloping) {
	app.set('host', 'http://localhost');
	app.use(webpackDevConfig.middleware);
	app.use(webpackHotMiddleware(webpackDevConfig.compiler));
} else {
	app.use(express.static('dist'));
	app.get('*', prodResponse);
}

if (!module.parent) {
	app.listen(meta.port, handleListen(meta.port, log));
}

module.exports = app;