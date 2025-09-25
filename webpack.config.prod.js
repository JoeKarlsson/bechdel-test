const webpack = require('webpack');
const path = require('path');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const StyleLoader = require('style-loader');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: [path.join(__dirname, '/src/app/entry.js')],
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: '[name]-[contenthash].min.js',
		chunkFilename: '[name]-[contenthash].chunk.js',
		publicPath: '/',
		clean: true, // Clean output directory before emit
	},
	mode: 'production',
	resolve: {
		extensions: ['.js', '.jsx'],
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					compress: {
						drop_console: true, // Remove console.log in production
						drop_debugger: true,
					},
				},
			}),
		],
		splitChunks: {
			chunks: 'all',
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					chunks: 'all',
				},
				common: {
					name: 'common',
					minChunks: 2,
					chunks: 'all',
					enforce: true,
				},
			},
		},
		runtimeChunk: 'single',
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'src/app/index.tpl.html',
			inject: 'body',
			filename: 'index.html',
			favicon: './src/app/assets/images/my_logo.png',
			minify: {
				removeComments: true,
				collapseWhitespace: true,
				removeRedundantAttributes: true,
				useShortDoctype: true,
				removeEmptyAttributes: true,
				removeStyleLinkTypeAttributes: true,
				keepClosingSlash: true,
				minifyJS: true,
				minifyCSS: true,
				minifyURLs: true,
			},
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production'),
		}),
		new StyleLintPlugin({
			files: ['src/**/*.{css,scss}'],
			fix: true,
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
		// Add bundle analyzer in development
		...(process.env.ANALYZE === 'true' ? [new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)()] : []),
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
							sourceMap: false,
							esModule: false,
							modules: false,
						},
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: false,
							api: 'modern-compiler',
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
