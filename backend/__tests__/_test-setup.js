const mongoose = require('mongoose');
const config = require('../src/config');

module.exports = {
  setupDB: (options = {}) => {
    let db;
    const { debug = config.mongodb.debug, dsn = config.mongodb.dsn } = options;

    // Connect to Mongoose
    before(async () => {
      db = await config.initDb({ debug, dsn });
    });

    // Disconnect Mongoose
    after(async () => {
      await db.disconnect();
    });
  }
};
