const jwt = require('jsonwebtoken');
const Batch = require('../models/Batch');

const JWT_SECRET = process.env.JWT_SECRET;
let ioInstance = null;
const onlineUsers = new Set(); // Track unique online users for the green dot indicator

exports.initSocketService = (io) => {
    ioInstance = io;

    // Authentication Middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) {
            return next(new Error('Authentication error: Token missing'));
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            socket.user = decoded; // Attach user payload to socket
            next();
        } catch (err) {
            return next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', async (socket) => {
        const userId = socket.user.userId;
        const userRoom = `user_${userId}`;

        console.log(`Socket: Connected ${socket.id} (user: ${userId})`);

        // Join personal tracking room (for DMs, notifications)
        socket.join(userRoom);
        onlineUsers.add(userId);

        // Join batch/class rooms for scoped real-time events
        try {
            const batches = await Batch.find({
                $or: [
                    { studentIds: userId },
                    { teacherIds: userId }
                ]
            }).select('_id').lean();

            for (const batch of batches) {
                const batchRoom = `batch_${batch._id}`;
                socket.join(batchRoom);
            }

            if (batches.length > 0) {
                console.log(`Socket: User ${userId} joined ${batches.length} batch room(s)`);
            }
        } catch (err) {
            console.error(`Socket: Failed to join batch rooms for user ${userId}:`, err.message);
        }

        // Broadcast online status ONLY to rooms this user belongs to
        // (instead of globally to all connected sockets)
        const userRooms = Array.from(socket.rooms).filter(r => r !== socket.id);
        for (const room of userRooms) {
            io.to(room).emit("getOnlineUsers", Array.from(onlineUsers));
        }

        socket.on('disconnect', () => {
             console.log(`Socket: Disconnected ${socket.id} (user: ${userId})`);
             
             // Check if user has other active sockets in their personal room
             const room = io.sockets.adapter.rooms.get(userRoom);
             if (!room || room.size === 0) {
                 onlineUsers.delete(userId);
             }
             
             // Broadcast updated online status to the user's rooms only
             const disconnectedRooms = Array.from(socket.rooms || []).filter(r => r !== socket.id);
             for (const room of disconnectedRooms) {
                 io.to(room).emit("getOnlineUsers", Array.from(onlineUsers));
             }
        });
    });
};

/**
 * Emits an event explicitly to a specific user's room (all their devices)
 */
exports.emitToUser = (userId, eventName, payload) => {
    if (ioInstance) {
        const roomName = `user_${userId}`;
        ioInstance.to(roomName).emit(eventName, payload);
    }
};

/**
 * Emits an event to a specific batch/class room
 */
exports.emitToRoom = (roomName, eventName, payload) => {
    if (ioInstance) {
        ioInstance.to(roomName).emit(eventName, payload);
    }
};

/**
 * Emits an event to a specific batch room by batch ID
 */
exports.emitToBatch = (batchId, eventName, payload) => {
    if (ioInstance) {
        ioInstance.to(`batch_${batchId}`).emit(eventName, payload);
    }
};

/**
 * Returns array of currently online user IDs
 */
exports.getOnlineUserIds = () => {
    return Array.from(onlineUsers);
};
