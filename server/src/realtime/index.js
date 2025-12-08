const { Server } = require('socket.io');

let io = null;

function initRealtime(server) {
    io = new Server(server, {
        cors: {
            origin: '*', // keyinchalik aniq domen qo'yamiz
        },
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
}

function getIO() {
    if (!io) {
        throw new Error('Socket.io hali init qilinmagan');
    }
    return io;
}

module.exports = {
    initRealtime,
    getIO,
};
