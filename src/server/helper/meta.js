/* eslint
	no-unused-vars: 0
	prefer-destructuring: 0
*/
let CONFIG;
let THEMOVIEDB;
let MYAPIFILMS;

const {
	PORT,
	NODE_ENV,
} = process.env;

const isDeveloping = NODE_ENV !== 'production';

const isTest = NODE_ENV === 'test';

const port = isDeveloping ? 3000 : PORT;

if (isDeveloping) {
	CONFIG = require('../config/config.json'); // eslint-disable-line global-require
	THEMOVIEDB = CONFIG.THEMOVIEDB;
	MYAPIFILMS = CONFIG.MYAPIFILMS;
} else {
	THEMOVIEDB = process.env.THEMOVIEDB;
	MYAPIFILMS = process.env.MYAPIFILMS;
}

module.exports = {
	THEMOVIEDB,
	MYAPIFILMS,
	isDeveloping,
	isTest,
	port,
};
