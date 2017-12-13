const webpack = require('webpack');
const path = require('path');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const StatsPlugin = require('stats-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

module.exports = {
	entry: [
		path.join(__dirname, '/src/app/entry.js'),
	],
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: '[name]-[hash].min.js',
		publicPath: '/',
	},
	resolve: {},
	plugins: [
		new ExtractTextPlugin({
			filename: '[name]-[hash].css',
			allChunks: true,
		}),
		new HtmlWebpackPlugin({
			template: 'src/app/index.tpl.html',
			inject: 'body',
			filename: 'index.html',
		}),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false,
				screw_ie8: false,
				conditionals: true,
				unused: true,
				comparisons: true,
				sequences: true,
				dead_code: true,
				evaluate: true,
				if_return: true,
				join_vars: true,
			},
			output: {
				comments: false,
			},
		}),
		new webpack.NoEmitOnErrorsPlugin(),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('development'),
		}),
		new StatsPlugin('webpack.stats.json', {
			source: false,
			modules: false,
		}),
		new StyleLintPlugin(),
	],
	module: {
		rules: [{
			test: /(\.js$|\.jsx$)/,
			exclude: /node_modules/,
			use: [
				{
					loader: 'babel-loader',
					options: {
						presets: [
							'react',
							'env',
						],
					},
				},
			],
		}, {
			test: /\.(jpg|png|gif|eot|svg|ttf|woff|woff2)$/,
			use: 'file-loader',
		}, {
			test: /\.(mp4|webm)$/,
			use: 'url-loader?limit=10000',
		}, {
			test: /(\.scss$|\.css$)/,
			use: ExtractTextPlugin.extract({
				fallback: 'style-loader',
				use: ['css-loader', 'sass-loader'],
			}),
		}],
	},
};
