const webpack = require('webpack');
const path = require('path');
const config = require('./webpack.config.prod.js');

// Development-specific overrides
config.devtool = 'eval-cheap-module-source-map';

config.entry = [
	'webpack-hot-middleware/client?reload=true',
	path.join(__dirname, './src/app/entry.js'),
];

config.output = {
	path: path.resolve(__dirname, './dist'),
	filename: '[name].js',
	chunkFilename: '[name].chunk.js',
	publicPath: '/',
	clean: false, // Don't clean in development for faster builds
};

config.mode = 'development';

// Remove production optimizations
config.optimization = {
	...config.optimization,
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
};

// Remove production plugins and add development ones
config.plugins = config.plugins.filter(plugin => 
	plugin.constructor.name !== 'MiniCssExtractPlugin' &&
	plugin.constructor.name !== 'CssMinimizerPlugin' &&
	plugin.constructor.name !== 'TerserPlugin'
);

// Add HotModuleReplacementPlugin for development
config.plugins.push(new webpack.HotModuleReplacementPlugin());

// Update CSS loader for development to use style-loader
config.module.rules.forEach(rule => {
	if (rule.test && rule.test.toString().includes('scss|css')) {
		rule.use = [
			'style-loader',
			{
				loader: 'css-loader',
				options: {
					sourceMap: true,
				},
			},
			{
				loader: 'sass-loader',
				options: {
					sourceMap: true,
				},
			},
		];
	}
});

// Add resolve aliases for development
config.resolve.alias = {
	...config.resolve.alias,
	'react-dom': '@hot-loader/react-dom',
};

module.exports = config;
