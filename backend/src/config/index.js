const config = require('./config');
const log = require('debug')(config.applicationName);

config.logger = { log };

module.exports = config;
