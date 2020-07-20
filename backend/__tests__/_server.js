const app = require('../src/app');
const debug = require('debug')('backend:server');
const http = require('http');
const port = process.env.PORT || '3000';

app.set('port', port);

const server = http.createServer(app);

server.listen(port);

module.exports = server;
