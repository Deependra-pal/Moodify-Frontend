import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import * as chatService from '../services/chatService';
import {
  connectSocket,
  disconnectSocket,
  joinRoom,
  leaveRoom,
  getSocket,
  emitTyping,
  emitStopTyping
} from '../services/socketService';
import useAuth from '../../auth/hooks/useAuth';

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // Real-Time States
  const [onlineUsers, setOnlineUsers] = useState([]); // List of online User IDs
  const [typingUsers, setTypingUsers] = useState({}); // { [conversationId]: { userId, username } }
  const [unreadCounts, setUnreadCounts] = useState({}); // { [conversationId]: number }

  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState(null);

  // Compute total unread messages count across all conversations
  const totalUnreadCount = useMemo(() => {
    return Object.values(unreadCounts).reduce((sum, count) => sum + (count || 0), 0);
  }, [unreadCounts]);

  // Helper to check if a user is online
  const isUserOnline = useCallback((userId) => {
    if (!userId || !onlineUsers || !Array.isArray(onlineUsers)) return false;
    const rawId = (userId._id || userId.id || userId).toString();
    return onlineUsers.some(id => id.toString() === rawId);
  }, [onlineUsers]);

  // Fetch all user conversations and populate unread counts
  const loadConversations = useCallback(async () => {
    if (!user) return;
    setIsLoadingConversations(true);
    setError(null);
    try {
      const res = await chatService.getUserConversations();
      if (res.success && res.data?.conversations) {
        const convs = res.data.conversations;
        setConversations(convs);

        // Populate unreadCounts map
        const initialUnread = {};
        convs.forEach(c => {
          if (c._id) {
            initialUnread[c._id] = c.unreadCount || 0;
          }
        });
        setUnreadCounts(initialUnread);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      setError(err.response?.data?.message || 'Failed to load conversations.');
    } finally {
      setIsLoadingConversations(false);
    }
  }, [user]);

  // Fetch accepted friends list
  const loadFriends = useCallback(async () => {
    if (!user) return;
    setIsLoadingFriends(true);
    try {
      const res = await chatService.getFriends();
      if (res.success) {
        setFriends(res.data.friends || []);
      }
    } catch (err) {
      console.error('Failed to fetch friends:', err);
    } finally {
      setIsLoadingFriends(false);
    }
  }, [user]);

  // Fetch incoming pending requests
  const loadPendingRequests = useCallback(async () => {
    if (!user) return;
    try {
      const res = await chatService.getPendingRequests();
      if (res.success) {
        setPendingRequests(res.data.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch pending requests:', err);
    }
  }, [user]);

  // Mark conversation as read and clear its unread count
  const markAsSeen = useCallback(async (conversationId) => {
    if (!conversationId) return;
    setUnreadCounts(prev => ({
      ...prev,
      [conversationId]: 0
    }));

    try {
      await chatService.markAsRead(conversationId);
    } catch (err) {
      console.warn('Failed to mark conversation as read:', err.message);
    }
  }, []);

  // Fetch messages for a specific conversation and mark as seen
  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    setIsLoadingMessages(true);
    setError(null);
    try {
      const res = await chatService.getConversationMessages(conversationId);
      if (res.success) {
        setMessages(res.data.messages || []);
        // Automatically mark as seen when loading messages
        await markAsSeen(conversationId);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError(err.response?.data?.message || 'Failed to load chat messages.');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [markAsSeen]);

  // Open or create conversation with a friend
  const openChatWithFriend = useCallback(async (friendUser) => {
    const friendId = friendUser._id || friendUser.id;
    if (!friendId) return;

    setError(null);
    try {
      const res = await chatService.getOrCreateConversation(friendId);
      if (res.success && res.data.conversation) {
        const conv = res.data.conversation;
        setActiveConversation(conv);
        
        // Update conversations list if new
        setConversations(prev => {
          const exists = prev.some(c => c._id === conv._id);
          if (!exists) return [conv, ...prev];
          return prev;
        });

        // Load messages and mark as seen
        await loadMessages(conv._id);
      }
    } catch (err) {
      console.error('Failed to open conversation:', err);
      setError(err.response?.data?.message || 'Unable to open conversation.');
    }
  }, [loadMessages]);

  // Select an existing conversation from list
  const selectConversation = useCallback(async (conv) => {
    setActiveConversation(conv);
    if (conv && conv._id) {
      await loadMessages(conv._id);
    }
  }, [loadMessages]);

  // Send message in current active conversation
  const handleSendMessage = useCallback(async (text) => {
    if (!activeConversation || !text || !text.trim()) return;

    setIsSendingMessage(true);
    setError(null);

    // Stop typing indicator when sending
    const currentUserId = user?.id || user?._id;
    emitStopTyping(activeConversation._id, currentUserId);

    try {
      const res = await chatService.sendMessage(activeConversation._id, text.trim());
      if (res.success && res.data.message) {
        const newMsg = res.data.message;

        // Immediately append to local messages list if not already added by socket
        setMessages(prev => {
          const exists = prev.some(m => (m._id || m.id)?.toString() === (newMsg._id || newMsg.id)?.toString());
          if (!exists) return [...prev, newMsg];
          return prev;
        });

        // Update active conversation's lastMessage in local state
        const updatedTime = newMsg.createdAt || new Date().toISOString();
        setActiveConversation(prev => ({
          ...prev,
          lastMessage: newMsg.text,
          lastMessageAt: updatedTime
        }));

        // Update conversation in conversation list and bump to top
        setConversations(prev => {
          const existing = prev.find(c => c._id === activeConversation._id);
          const updatedConv = {
            ...(existing || activeConversation),
            lastMessage: newMsg.text,
            lastMessageAt: updatedTime
          };

          const filtered = prev.filter(c => c._id !== activeConversation._id);
          return [updatedConv, ...filtered];
        });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setIsSendingMessage(false);
    }
  }, [activeConversation, user]);

  // Send friend request
  const handleSendFriendRequest = useCallback(async (receiverId) => {
    try {
      const res = await chatService.sendFriendRequest(receiverId);
      return { success: true, message: res.message || 'Friend request sent!' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to send friend request.'
      };
    }
  }, []);

  // Accept pending friend request
  const handleAcceptRequest = useCallback(async (requestId) => {
    try {
      const res = await chatService.acceptFriendRequest(requestId);
      if (res.success) {
        await loadFriends();
        await loadPendingRequests();
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to accept request.'
      };
    }
  }, [loadFriends, loadPendingRequests]);

  // Reject pending friend request
  const handleRejectRequest = useCallback(async (requestId) => {
    try {
      const res = await chatService.rejectFriendRequest(requestId);
      if (res.success) {
        await loadPendingRequests();
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to reject request.'
      };
    }
  }, [loadPendingRequests]);

  // Auto load data and manage Socket connection on login/logout
  useEffect(() => {
    if (user) {
      const userId = user.id || user._id;
      const socket = connectSocket(userId);

      // Listen for online users list broadcast
      const handleGetOnlineUsers = (usersList) => {
        setOnlineUsers(usersList || []);
      };

      // Listen for incoming friend request in real-time
      const handleFriendRequestReceived = (reqData) => {
        if (reqData && reqData._id) {
          setPendingRequests(prev => {
            const exists = prev.some(r => r._id === reqData._id);
            if (!exists) return [reqData, ...prev];
            return prev;
          });
        }
        loadPendingRequests();
      };

      // Listen for accepted friend request notification in real-time
      const handleFriendRequestAccepted = () => {
        loadFriends();
        loadConversations();
      };

      socket.on('getOnlineUsers', handleGetOnlineUsers);
      socket.on('friendRequestReceived', handleFriendRequestReceived);
      socket.on('friendRequestAccepted', handleFriendRequestAccepted);

      loadConversations();
      loadFriends();
      loadPendingRequests();

      return () => {
        socket.off('getOnlineUsers', handleGetOnlineUsers);
        socket.off('friendRequestReceived', handleFriendRequestReceived);
        socket.off('friendRequestAccepted', handleFriendRequestAccepted);
      };
    } else {
      disconnectSocket();
      setConversations([]);
      setFriends([]);
      setPendingRequests([]);
      setActiveConversation(null);
      setMessages([]);
      setOnlineUsers([]);
      setTypingUsers({});
      setUnreadCounts({});
    }
  }, [user, loadConversations, loadFriends, loadPendingRequests]);

  // Global socket listener for conversation updates & unread increments
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleGlobalConvUpdate = (data) => {
      if (!data || !data.conversationId) return;

      const currentUserId = user?.id || user?._id;
      const activeId = activeConversation?._id?.toString();

      // If message came from someone else and conversation is not currently active, increment unread count
      if (data.senderId?.toString() !== currentUserId?.toString() && data.conversationId !== activeId) {
        setUnreadCounts(prev => ({
          ...prev,
          [data.conversationId]: (prev[data.conversationId] || 0) + 1
        }));
      }

      // Update conversation in sidebar list
      setConversations(prev => {
        const existing = prev.find(c => c._id === data.conversationId);
        if (!existing) return prev;

        const updatedConv = {
          ...existing,
          lastMessage: data.lastMessage,
          lastMessageAt: data.lastMessageAt
        };

        const filtered = prev.filter(c => c._id !== data.conversationId);
        return [updatedConv, ...filtered];
      });
    };

    socket.on('conversationUpdated', handleGlobalConvUpdate);
    return () => {
      socket.off('conversationUpdated', handleGlobalConvUpdate);
    };
  }, [activeConversation, user]);

  // Manage room joining and Socket Event Listeners for active conversation
  useEffect(() => {
    if (!activeConversation || !activeConversation._id) return;

    const convId = activeConversation._id;
    joinRoom(convId);

    const socket = getSocket();
    if (!socket) return;

    // Automatically mark active conversation as seen
    markAsSeen(convId);

    // Listen for live incoming message
    const handleNewMessage = (msg) => {
      if (!msg) return;

      const msgConvId = (msg.conversation?._id || msg.conversation)?.toString();
      const activeConvId = (convId?._id || convId)?.toString();

      if (msgConvId && activeConvId && msgConvId === activeConvId) {
        setMessages(prev => {
          const exists = prev.some(m => (m._id || m.id)?.toString() === (msg._id || msg.id)?.toString());
          if (!exists) return [...prev, msg];
          return prev;
        });

        // Clear typing indicator for this conversation upon receiving a message
        setTypingUsers(prev => {
          const next = { ...prev };
          delete next[convId];
          return next;
        });

        // Mark incoming message as seen since chat is open
        markAsSeen(convId);
      }
    };

    // Listen for live typing events
    const handleTyping = (data) => {
      if (!data || !data.conversationId) return;
      const currentUserId = user?.id || user?._id;
      if (data.userId?.toString() === currentUserId?.toString()) return;

      setTypingUsers(prev => ({
        ...prev,
        [data.conversationId]: { userId: data.userId, username: data.username }
      }));
    };

    // Listen for stop typing events
    const handleStopTyping = (data) => {
      if (!data || !data.conversationId) return;
      setTypingUsers(prev => {
        const next = { ...prev };
        delete next[data.conversationId];
        return next;
      });
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);

    return () => {
      leaveRoom(convId);
      socket.off('newMessage', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
    };
  }, [activeConversation, user, markAsSeen]);

  // Helper typing triggers for input
  const sendTypingNotification = useCallback(() => {
    if (activeConversation && user) {
      const userId = user.id || user._id;
      emitTyping(activeConversation._id, userId, user.username);
    }
  }, [activeConversation, user]);

  const sendStopTypingNotification = useCallback(() => {
    if (activeConversation && user) {
      const userId = user.id || user._id;
      emitStopTyping(activeConversation._id, userId);
    }
  }, [activeConversation, user]);

  const value = {
    conversations,
    friends,
    pendingRequests,
    activeConversation,
    messages,
    onlineUsers,
    typingUsers,
    unreadCounts,
    totalUnreadCount,
    isUserOnline,
    isLoadingConversations,
    isLoadingFriends,
    isLoadingMessages,
    isSendingMessage,
    error,
    loadConversations,
    loadFriends,
    loadPendingRequests,
    loadMessages,
    openChatWithFriend,
    selectConversation,
    handleSendMessage,
    handleSendFriendRequest,
    handleAcceptRequest,
    handleRejectRequest,
    sendTypingNotification,
    sendStopTypingNotification,
    markAsSeen,
    setError
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
