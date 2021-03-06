const mongoose = require('mongoose');
const config = require('../src/config');

async function removeAllCollections () {
  const collections = Object.keys(mongoose.connection.collections)
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName]
    await collection.deleteMany()
  }
}

async function dropAllCollections () {
  const collections = Object.keys(mongoose.connection.collections)
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName]
    try {
      await collection.drop()
    } catch (error) {
      // Sometimes this error happens, but you can safely ignore it
      if (error.message === 'ns not found') {
        return;
      }

      // This error occurs when you use it.todo. You can
      // safely ignore this error too
      if (error.message.includes('a background operation is currently running')) {
        return;
      }
    }
  }
}

module.exports = {
  setupDB: (options = {}) => {
    let db;
    const { debug = config.mongodb.debug, dsn = config.mongodb.dsn } = options;

    // Connect to Mongoose
    before(async () => {
      db = await config.initDb({ debug, dsn });
    });

    // Clean up database between each test
    afterEach(async () => {
      await removeAllCollections()
    });

    // Disconnect Mongoose
    after(async () => {
      await dropAllCollections();
      await db.disconnect();
      config.debug('Successfully disconnected from MongoDB server');
    });
  }
};
