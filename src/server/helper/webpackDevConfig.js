const webpack = require('webpack');
const WebpackDevMiddleware = require('webpack-dev-middleware');
const config = require('../../../webpack.config.js');

const compiler = webpack(config);
const middleware = WebpackDevMiddleware(compiler, {
	publicPath: config.output.publicPath,
	contentBase: 'src',
	historyApiFallback: true,
	hot: true,
	quiet: true,
	noInfo: false,
	lazy: false,
	stats: {
		colors: true,
		hash: false,
		timings: true,
		chunks: false,
		chunkModules: false,
		modules: false,
	},
});

module.exports = {
	compiler,
	middleware,
};
