const mongoose = require('mongoose');
const meta = require('../helper/meta');

const { isDeveloping } = meta;

// mongodb+srv://joeKarlsson:<password>@bechdel-lmhrw.mongodb.net/test?retryWrites=true&w=majority

if (isDeveloping) {
	mongoose.connect('mongodb://database/bechdelTest', {
		useMongoClient: true,
	});
} else {
	const options = {
		useMongoClient: true,
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


const mongoose = require('mongoose');
const userSchema = require('./userSchema.js');
const User = mongoose.model('user', userSchema, 'user');

async function createUser(username) {
	return new User({
		username,
		created: Date.now(),
	}).save();
}

async function findUser(username) {
	return await User.findOne({ username });
}

(async () => {
	const connector = mongoose.connect(connectionString);
	const username = process.argv[2].split('=')[1];

	let user = await connector.then(async () => {
		return findUser(username);
	});

	if (!user) {
		user = await createUser(username);
	}

	console.log(user);
	process.exit(0);
})();