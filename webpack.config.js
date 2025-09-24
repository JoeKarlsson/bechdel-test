const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: [
		'webpack-hot-middleware/client?reload=true',
		path.join(__dirname, './src/app/entry.js'),
	],
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: '[name].js',
		chunkFilename: '[name].chunk.js',
		publicPath: '/',
		clean: false, // Don't clean in development for faster builds
	},
	mode: 'development',
	devtool: 'eval-cheap-module-source-map',
	resolve: {
		extensions: ['.js', '.jsx'],
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	optimization: {
		minimize: false,
		splitChunks: {
			chunks: 'all',
			cacheGroups: {
				default: false,
				vendors: false,
				// Only split vendor chunks in development
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					chunks: 'all',
				},
			},
		},
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('development'),
		}),
		new HtmlWebpackPlugin({
			template: 'src/app/index.tpl.html',
			inject: 'body',
			filename: 'index.html',
			favicon: './src/app/assets/images/my_logo.png',
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: 'public',
					to: '.',
					noErrorOnMissing: true,
				},
			],
		}),
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
							presets: [
								['@babel/preset-env', {
									targets: {
										browsers: ['> 1%', 'last 2 versions', 'not ie <= 8']
									},
									modules: false,
								}],
								['@babel/preset-react', {
									runtime: 'automatic'
								}],
							],
							cacheDirectory: true,
						},
					},
				],
			},
			{
				test: /\.(png|jpg|jpeg|gif|svg|eot|ttf|woff|woff2)$/,
				type: 'asset/resource',
				generator: {
					filename: 'assets/[name]-[contenthash][ext]',
				},
			},
			{
				test: /\.(mp4|webm)$/,
				type: 'asset/inline',
			},
			{
				test: /(\.scss$|\.css$)/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							sourceMap: true,
							modules: false,
						},
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
						},
					},
				],
			},
		],
	},
	performance: {
		hints: 'warning',
		maxEntrypointSize: 512000,
		maxAssetSize: 512000,
	},
};