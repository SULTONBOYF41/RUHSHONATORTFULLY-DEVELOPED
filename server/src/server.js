const http = require('http');
const app = require('./app');
const { initRealtime } = require('./realtime');
const { port } = require('./config/env');

// HTTP server
const server = http.createServer(app);

// Real-time (Socket.io) ulash
initRealtime(server);

server.listen(port, () => {
    console.log(`Ruxshona Tort backend running on port ${port}`);
});
