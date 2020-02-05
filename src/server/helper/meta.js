/* eslint
	no-unused-vars: 0
	prefer-destructuring: 0
*/
let CONFIG;
let THEMOVIEDB;
let MYAPIFILMS;
let MONGODB_URI;

const { PORT, NODE_ENV } = process.env;

const isDeveloping = NODE_ENV !== 'production';

const isTest = NODE_ENV === 'test';

const port = isDeveloping ? 3000 : PORT;

if (isDeveloping) {
	CONFIG = require('../config/config.json'); // eslint-disable-line global-require
	THEMOVIEDB = CONFIG.THEMOVIEDB;
	MYAPIFILMS = CONFIG.MYAPIFILMS;
	MONGODB_URI = CONFIG.MONGODB_URI;
} else {
	THEMOVIEDB = process.env.THEMOVIEDB;
	MYAPIFILMS = process.env.MYAPIFILMS;
	MONGODB_URI = process.env.MONGODB_URI;
}

module.exports = {
	THEMOVIEDB,
	MYAPIFILMS,
	MONGODB_URI,
	isDeveloping,
	isTest,
	port,
};
