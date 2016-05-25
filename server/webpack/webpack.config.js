/* eslint strict: 0*/
'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'eval-source-map',
  entry: [
    'webpack-hot-middleware/client?reload=true',
    path.join(__dirname, '../../app/entry.jsx'),
  ],
  output: {
    path: path.resolve(__dirname, '../dist/'),
    filename: '[name].js',
    publicPath: '/',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'app/index.tpl.html',
      inject: 'body',
      filename: 'index.html',
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
  module: {
    // preLoaders: [
    //   {
    //     test: /(\.js$|\.jsx$)/,
    //     loader: 'eslint',
    //     exclude: /node_modules/,
    //   },
    // ],
    loaders: [{
      test: /(\.js$|\.jsx$)/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['react', 'es2015', 'stage-0', 'react-hmre'],
      },
    }, {
      test: /\.json?$/,
      loader: 'json',
    }, {
      test: /(\.scss$|\.css$)/,
      loaders: [
        'style',
        'css?modules&importLoaders=1' +
        '&localIdentName=[path][local]__[hash:base64:5]!sass',
        'sass',
      ],
    }],
  },
  eslint: {
    configFile: '.eslintrc.js',
    failOnWarning: false,
    failOnError: false,
  },
};
