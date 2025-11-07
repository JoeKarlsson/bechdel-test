const mongoose = require('mongoose');
const meta = require('../helper/meta');
const handleError = require('../helper/handleError');

// Suppress Mongoose 7 deprecation warning for strictQuery
mongoose.set('strictQuery', false);

const { isDeveloping, MONGODB_URI } = meta;

if (isDeveloping) {
	mongoose
		.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(() => console.log('Connected to MongoDB Atlas!'))
		.catch(error => {
			handleError(error);
		});
} else {
	const options = {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		socketTimeoutMS: 30000,
		connectTimeoutMS: 30000,
		serverSelectionTimeoutMS: 30000,
	};
	mongoose
		.connect(process.env.MONGODB_URI, options)
		.then(() => console.log('Connected to MongoDB!'))
		.catch(error => {
			console.error('Database connection error:', error);
			handleError(error);
		});
}
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

module.exports = db;
