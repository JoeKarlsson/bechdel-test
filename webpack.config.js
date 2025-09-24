const webpack = require('webpack');
const path = require('path');
const config = require('./webpack.config.prod.js');

config.devtool = 'eval-source-map';

config.entry = [
	'webpack-hot-middleware/client?reload=true',
	path.join(__dirname, './src/app/entry.js'),
];

config.output = {
	path: path.resolve(__dirname, './dist'),
	filename: '[name].js',
	publicPath: '/',
};

config.mode = 'development';

// Remove MiniCssExtractPlugin for development
config.plugins = config.plugins.filter(plugin => plugin.constructor.name !== 'MiniCssExtractPlugin');

// Add HotModuleReplacementPlugin for development
config.plugins.push(new webpack.HotModuleReplacementPlugin());

// Update CSS loader for development to use style-loader
config.module.rules.forEach(rule => {
	if (rule.test && rule.test.toString().includes('scss|css')) {
		rule.use = [
			'style-loader',
			'css-loader',
			'sass-loader',
		];
	}
});

module.exports = config;
