const webpack = require('webpack');
const WebpackDevMiddleware = require('webpack-dev-middleware');
const config = require('../../../webpack.config.js');

const compiler = webpack(config);

// Create middleware with Webpack 5 compatible options
const middleware = WebpackDevMiddleware(compiler, {
	publicPath: config.output.publicPath,
	stats: {
		colors: true,
		hash: false,
		timings: true,
		chunks: false,
		chunkModules: false,
		modules: false,
	},
	// Webpack 5 compatibility options
	serverSideRender: false,
	writeToDisk: false,
});

module.exports = {
	compiler,
	middleware,
};
