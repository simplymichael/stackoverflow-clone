const util = require('util');
const mongoose = require('mongoose');
const config = require('./config');
const debug = require('debug')(config.applicationName);

config.initDb = async (options = {}) => {
  const {
    debug: debugMongo = config.mongodb.debug,
    dsn = config.mongodb.dsn
  } = options;

  try {
    mongoose.set('debug', debugMongo);
    const db = await mongoose.connect(dsn, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    debug('Successfully connected to MongoDb server');

    return db;
  } catch(err) {
    debug(`Failed to connect to MongoDB server:
    message: ${err.message}
    reason: ${util.format(err.reason)}
    `);

    process.exit(1);
  }
};

/*
mongoose.set('debug', config.mongodb.debug);
mongoose.connect(config.mongodb.dsn, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Successfully connected to MongoDb server'))
  .catch((err) => {
    console.log(`Failed to connect to MongoDB server:
    message: ${err.message}
    reason: ${util.format(err.reason)}
    `);
    process.exit(1);
  });
*/

module.exports = config;
