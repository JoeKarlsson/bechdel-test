const webpack = require('webpack');
const path = require('path');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const StatsPlugin = require('stats-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	entry: [path.join(__dirname, '/src/app/entry.js')],
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: '[name]-[hash].min.js',
		publicPath: '/',
	},
	mode: 'production',
	resolve: {},
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].css',
			chunkFilename: '[id].css',
		}),
		new HtmlWebpackPlugin({
			template: 'src/app/index.tpl.html',
			inject: 'body',
			filename: 'index.html',
			favicon: './src/app/assets/images/my_logo.png',
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
		rules: [
			{
				test: /(\.js$|\.jsx$)/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-react', '@babel/preset-env'],
						},
					},
				],
			},
			{
				test: /\.png$/,
				use: 'url-loader?lmit=1000&mimetype=image/png',
			},
			{
				test: /\.(jpg|png|gif|eot|svg|ttf|woff|woff2)$/,
				use: 'file-loader',
			},
			{
				test: /\.(mp4|webm)$/,
				use: 'url-loader?limit=10000',
			},
			{
				test: /(\.scss$|\.css$)/,
				use: [
					process.env.NODE_ENV !== 'production'
						? 'style-loader'
						: MiniCssExtractPlugin.loader,
					'css-loader',
					'sass-loader',
				],
			},
		],
	},
};
