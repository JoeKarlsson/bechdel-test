const mongoose = require('mongoose');
const isDeveloping = process.env.NODE_ENV !== 'production';

if (isDeveloping) {
  mongoose.connect('mongodb://localhost/bechdelTest');
} else {
  /*
   * Mongoose by default sets the auto_reconnect option to true.
   * We recommend setting socket options at both the server and replica set level.
   * We recommend a 30 second connection timeout because it allows for
   * plenty of time in most operating environments.
   */
  const options = {
    server: { socketOptions: {
      keepAlive: 300000, connectTimeoutMS: 30000,
    } },
    replset: { socketOptions: {
      keepAlive: 300000, connectTimeoutMS: 30000,
    } },
  };
  mongoose.connect(process.env.MONGODB_URI, options);
}
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  // We're connected to MongoDB
});

module.exports = db;