/* eslint
	no-unused-vars: 0
	prefer-destructuring: 0
*/
let CONFIG;
let THEMOVIEDB;
let OMDB;
let MONGODB_URI;
let CLAUDE_API_KEY;

const { PORT, NODE_ENV } = process.env;

const isDeveloping = NODE_ENV !== 'production';

const isTest = NODE_ENV === 'test';

const port = isDeveloping ? 3000 : PORT;

if (isDeveloping) {
	CONFIG = require('../config/config.json'); // eslint-disable-line global-require
	THEMOVIEDB = CONFIG.THEMOVIEDB;
	OMDB = CONFIG.OMDB;
	MONGODB_URI = CONFIG.MONGODB_URI;
	CLAUDE_API_KEY = CONFIG.CLAUDE_API_KEY;
} else {
	THEMOVIEDB = process.env.THEMOVIEDB;
	OMDB = process.env.OMDB;
	MONGODB_URI = process.env.MONGODB_URI;
	CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
}

module.exports = {
	THEMOVIEDB,
	OMDB,
	MONGODB_URI,
	CLAUDE_API_KEY,
	isDeveloping,
	isTest,
	port,
};
