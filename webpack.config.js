const webpack = require('webpack');
const path = require('path');
const config = require('./webpack.config.prod.js');

config.devtool = 'eval-source-map';

config.entry = [
	'webpack-hot-middleware/client?reload=true',
	path.join(__dirname, './app/entry.jsx'),
];

config.output = {
	path: path.resolve(__dirname, './dist'),
	filename: '[name].js',
	publicPath: '/',
};

config.plugins.push(new webpack.HotModuleReplacementPlugin());

module.exports = config;
