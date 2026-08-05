import { io } from 'socket.io-client';

let socket = null;

const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return apiUrl.replace(/\/api\/?$/, '');
};

/**
 * Initialize and connect Socket.IO client instance.
 * @param {string} userId - Authenticated user ID for setup registration
 * @returns {Socket}
 */
export const connectSocket = (userId) => {
  if (socket && socket.connected) {
    if (userId) socket.emit('setupUser', userId);
    return socket;
  }

  const socketUrl = getSocketUrl();
  socket = io(socketUrl, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000
  });

  socket.on('connect', () => {
    console.log('⚡ Socket connected to server:', socket.id);
    if (userId) {
      socket.emit('setupUser', userId);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.warn('⚠️ Socket connection error:', err.message);
  });

  return socket;
};

/**
 * Disconnect socket client.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Join 1-on-1 conversation room.
 * @param {string} conversationId 
 */
export const joinRoom = (conversationId) => {
  if (socket && conversationId) {
    socket.emit('joinRoom', conversationId.toString());
  }
};

/**
 * Leave 1-on-1 conversation room.
 * @param {string} conversationId 
 */
export const leaveRoom = (conversationId) => {
  if (socket && conversationId) {
    socket.emit('leaveRoom', conversationId.toString());
  }
};

/**
 * Emit typing start event to room.
 * @param {string} conversationId 
 * @param {string} userId 
 * @param {string} username 
 */
export const emitTyping = (conversationId, userId, username) => {
  if (socket && conversationId) {
    socket.emit('typing', { conversationId: conversationId.toString(), userId, username });
  }
};

/**
 * Emit typing stop event to room.
 * @param {string} conversationId 
 * @param {string} userId 
 */
export const emitStopTyping = (conversationId, userId) => {
  if (socket && conversationId) {
    socket.emit('stopTyping', { conversationId: conversationId.toString(), userId });
  }
};

/**
 * Get active socket instance.
 */
export const getSocket = () => socket;
