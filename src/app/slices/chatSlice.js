import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeConversation: null,
  messages: [],
  onlineUsers: [],
  typingUsers: {}, // Map<conversationId, username>
  unreadCounts: {}, // Map<conversationId, count>
  activeTab: 'chats', // 'chats' | 'friends' | 'requests'
  filterText: ''
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateOptimisticMessage: (state, action) => {
      const { tempId, updatedMsg } = action.payload;
      state.messages = state.messages.map((m) => (m._id === tempId ? { ...updatedMsg } : m));
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setUserTyping: (state, action) => {
      const { conversationId, username } = action.payload;
      state.typingUsers[conversationId] = username;
    },
    setUserStopTyping: (state, action) => {
      const { conversationId } = action.payload;
      delete state.typingUsers[conversationId];
    },
    setUnreadCount: (state, action) => {
      const { conversationId, count } = action.payload;
      state.unreadCounts[conversationId] = count;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setFilterText: (state, action) => {
      state.filterText = action.payload;
    }
  }
});

export const {
  setActiveConversation,
  setMessages,
  addMessage,
  updateOptimisticMessage,
  setOnlineUsers,
  setUserTyping,
  setUserStopTyping,
  setUnreadCount,
  setActiveTab,
  setFilterText
} = chatSlice.actions;

export default chatSlice.reducer;
