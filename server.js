/*jshint esversion: 6 */
(function() {
  'use strict';

  const express               = require('express');
  const app                   = express();
  const path                  = require('path');
  const webpack               = require('webpack');
  const webpackMiddleware     = require('webpack-dev-middleware');
  const webpackHotMiddleware  = require('webpack-hot-middleware');
  const config                = require('./webpack.config.js');
  const bodyParser            = require('body-parser');
  const methodOverride        = require('method-override');
  const partials              = require('express-partials');
  const Promise               = require('bluebird');
  const CONFIG                = require('./config/config');
  const film                  = require('./routes/film');
  const isDeveloping          = process.env.NODE_ENV !== 'production';
  const port                  = isDeveloping ? 3000 : process.env.PORT;

  app.use(partials());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(express.static(__dirname + '/public'));

  Promise.onPossiblyUnhandledRejection((error) => {
      throw new Error(error);
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
        modules: false
      }
    });

    app.use(middleware);
    app.use(webpackHotMiddleware(compiler));
    app.get('*', function response(req, res) {
        res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
        res.end();
      });
  } else {
    app.use(express.static(__dirname + '/dist'));
    app.get('*', function response(req, res) {
      res.sendFile(path.join(__dirname, 'dist/index.html'));
    });
  }

  app.listen(port, '0.0.0.0', function onStart(err) {
    if (err) {
      console.error(err);
    }
    console.info('==> 🌎 Listening on port %s.' +
      'Open up http://0.0.0.0:%s/ in your browser.', port, port);
  });
}());