import api from '../../../services/api';

/**
 * Service handling all HTTP REST API calls for Chat & Friend System features.
 */

// --- USER SEARCH ---
export const searchUsers = async (query) => {
  const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

// --- FRIEND SYSTEM ---
export const sendFriendRequest = async (receiverId) => {
  const response = await api.post('/friends/request', { receiverId });
  return response.data;
};

export const getPendingRequests = async () => {
  const response = await api.get('/friends/requests');
  return response.data;
};

export const acceptFriendRequest = async (requestId) => {
  const response = await api.post('/friends/accept', { requestId });
  return response.data;
};

export const rejectFriendRequest = async (requestId) => {
  const response = await api.post('/friends/reject', { requestId });
  return response.data;
};

export const getFriends = async () => {
  const response = await api.get('/friends');
  return response.data;
};

// --- CONVERSATIONS ---
export const getOrCreateConversation = async (receiverId) => {
  const response = await api.post('/conversations', { receiverId });
  return response.data;
};

export const getUserConversations = async () => {
  const response = await api.get('/conversations');
  return response.data;
};

// --- MESSAGES ---
export const sendMessage = async (conversationId, text) => {
  const response = await api.post('/messages', { conversationId, text });
  return response.data;
};

export const getConversationMessages = async (conversationId) => {
  const response = await api.get(`/messages/${conversationId}`);
  return response.data;
};

export const markAsRead = async (conversationId) => {
  const response = await api.put(`/messages/read/${conversationId}`);
  return response.data;
};
