const path = require('path');
const webpackDevConfig = require('./webpackDevConfig');

const response = (req, res) => {
	res.write(webpackDevConfig.middleware.fileSystem.readFileSync(path.resolve(__dirname, '../dist/index.html')));
	res.end();
};

module.exports = response;
