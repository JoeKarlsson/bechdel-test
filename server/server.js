/* eslint strict: 0*/
'use strict';

const express = require('express');
const app = express();
const path = require('path');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config.js');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const partials = require('express-partials');
const Promise = require('bluebird');
const film = require('./routes/film');
const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 3000 : process.env.PORT;

app.use(partials());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(`${__dirname}/public`));

Promise.onPossiblyUnhandledRejection((err) => {
  throw new Error(err);
});

app.use('/api/film', film);

if (isDeveloping) {
  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false,
    },
  });
  const response = (req, res) => {
    res.write(middleware.fileSystem.readFileSync(path.join(`${__dirname}/dist/index.html`)));
    res.end();
  };

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  app.get('*', response);
} else {
  const response = (req, res) => {
    res.sendFile(path.join(`${__dirname}/dist/index.html`));
  };
  app.use(express.static(`${__dirname}/dist`));
  app.get('*', response);
}

const onStart = (err) => {
  if (err) {
    throw new Error(err);
  }
  console.info(
    `==> 🌎 Listening on port ${port}. ` +
    `Open up http://0.0.0.0:${port}/ in your browser.`
  );
};
app.listen(port, '0.0.0.0', onStart);

module.exports = app;
