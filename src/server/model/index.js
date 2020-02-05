const mongoose = require('mongoose');
const meta = require('../helper/meta');
const handleError = require('../helper/handleError');

const { isDeveloping, MONGODB_URI } = meta;

if (isDeveloping) {
	mongoose
		.connect(MONGODB_URI)
		.then(() => console.log('Connected to MongoDB Atlas!'))
		.catch(error => {
			handleError(error);
		});
} else {
	const options = {
		server: {
			socketOptions: {
				keepAlive: 300000,
				connectTimeoutMS: 30000,
			},
		},
		replset: {
			socketOptions: {
				keepAlive: 300000,
				connectTimeoutMS: 30000,
			},
		},
	};
	mongoose.connect(process.env.MONGODB_URI, options);
}
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

module.exports = db;
