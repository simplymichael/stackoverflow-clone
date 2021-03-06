const debug = require('../src/config').debug;
const app = require('../src/app');
const http = require('http');
const port = process.env.PORT || '3001';
const { setupDB } = require('./_test-setup');
setupDB();

app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => debug(`Test server listening on port ${port}`));

module.exports = server;
