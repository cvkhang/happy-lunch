import io from 'socket.io-client';
import { API_BASE_URL } from '../config/api';

let socket;

export const initSocket = (token) => {
  if (socket) return socket;

  // Remove /api from base URL if present, as socket connects to root
  const socketUrl = API_BASE_URL.replace('/api', '');

  socket = io(socketUrl, {
    auth: {
      token: token
    },
    transports: ['websocket']
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err);
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
