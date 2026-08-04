const { Server } = require('socket.io');
const logger = require('./logger');

let io = null;

/**
 * Initialize Socket.io Server instance
 */
function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: '*', // Allow connections from Vite frontend & mobile web apps
            methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
        }
    });

    io.on('connection', (socket) => {
        logger.info(`[Socket.io] Client connected: ${socket.id}`);

        // Handle joining custom channel rooms
        socket.on('join_user_room', (userId) => {
            if (userId) {
                socket.join(`user:${userId}`);
                logger.info(`[Socket.io] Socket ${socket.id} joined user:${userId}`);
            }
        });

        socket.on('join_block_room', (blockId) => {
            if (blockId) {
                socket.join(`block:${blockId}`);
                logger.info(`[Socket.io] Socket ${socket.id} joined block:${blockId}`);
            }
        });

        socket.on('join_complaint_room', (complaintId) => {
            if (complaintId) {
                socket.join(`complaint:${complaintId}`);
                logger.info(`[Socket.io] Socket ${socket.id} joined complaint:${complaintId}`);
            }
        });

        socket.on('disconnect', () => {
            logger.info(`[Socket.io] Client disconnected: ${socket.id}`);
        });
    });

    return io;
}

/**
 * Get Socket.io instance
 */
function getIO() {
    if (!io) {
        logger.warn('[Socket.io] Socket.io not initialized yet.');
    }
    return io;
}

/**
 * Event Emitters for Real-Time UI Updates
 */
function emitComplaintCreated(complaint) {
    if (!io) return;
    logger.info(`[Socket.io] Broadcasting complaint:created -> #${complaint.id}`);
    io.emit('complaint:created', complaint);
    if (complaint.residentId) io.to(`user:${complaint.residentId}`).emit('complaint:created', complaint);
    if (complaint.blockId) io.to(`block:${complaint.blockId}`).emit('complaint:created', complaint);
}

function emitComplaintUpdated(complaint) {
    if (!io) return;
    logger.info(`[Socket.io] Broadcasting complaint:updated -> #${complaint.id} [${complaint.status}]`);
    io.emit('complaint:updated', complaint);
    io.to(`complaint:${complaint.id}`).emit('complaint:updated', complaint);
    if (complaint.residentId) io.to(`user:${complaint.residentId}`).emit('complaint:updated', complaint);
    if (complaint.blockId) io.to(`block:${complaint.blockId}`).emit('complaint:updated', complaint);
}

function emitComplaintEscalated(complaint) {
    if (!io) return;
    logger.info(`[Socket.io] Broadcasting complaint:escalated -> #${complaint.id}`);
    io.emit('complaint:escalated', complaint);
    io.to(`complaint:${complaint.id}`).emit('complaint:escalated', complaint);
}

module.exports = {
    initSocket,
    getIO,
    emitComplaintCreated,
    emitComplaintUpdated,
    emitComplaintEscalated
};
