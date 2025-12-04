const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const userSockets = new Map(); // Map<userId, socketId>

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*", // Allow all origins for now, restrict in production
      methods: ["GET", "POST"]
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    userSockets.set(socket.userId, socket.id);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      userSockets.delete(socket.userId);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

const sendNotificationToUser = (userId, notification) => {
  const socketId = userSockets.get(userId);
  if (socketId && io) {
    io.to(socketId).emit('new_notification', notification);
    return true;
  }
  return false;
};

module.exports = {
  initSocket,
  getIo,
  sendNotificationToUser
};
