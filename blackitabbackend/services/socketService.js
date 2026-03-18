const jwt = require('jsonwebtoken');

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

    io.on('connection', (socket) => {
        const userId = socket.user.userId;
        const roomName = `user_${userId}`;

        console.log(`Socket: Connected ${socket.id} (user: ${userId})`);

        // Join personal tracking room
        socket.join(roomName);
        onlineUsers.add(userId);

        // Broadcast to everyone that this user is online (or just broadcast full list)
        io.emit("getOnlineUsers", Array.from(onlineUsers));

        socket.on('disconnect', () => {
             console.log(`Socket: Disconnected ${socket.id} (user: ${userId})`);
             
             // Check if user has other active sockets in this room
             const room = io.sockets.adapter.rooms.get(roomName);
             if (!room || room.size === 0) {
                 onlineUsers.delete(userId);
             }
             
             io.emit("getOnlineUsers", Array.from(onlineUsers));
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
 * Returns array of currently online user IDs
 */
exports.getOnlineUserIds = () => {
    return Array.from(onlineUsers);
};
