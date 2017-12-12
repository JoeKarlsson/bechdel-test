const fs = require('fs');
const path = require('path');

const response = (req, res) => {
	res.write(
		fs.readFileSync(path.resolve(__dirname, '../../dist/index.html')),
	);
	res.end();
};

module.exports = response;
