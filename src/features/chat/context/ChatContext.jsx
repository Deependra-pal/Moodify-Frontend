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
  const [sentRequests, setSentRequests] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  // Real-Time States
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});

  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState(null);

  const totalUnreadCount = useMemo(() => {
    return Object.values(unreadCounts).reduce((sum, count) => sum + (count || 0), 0);
  }, [unreadCounts]);

  const isUserOnline = useCallback((userId) => {
    if (!userId) return false;
    const rawId = (userId._id || userId.id || userId).toString();
    return onlineUsers.some(id => id.toString() === rawId);
  }, [onlineUsers]);

  // Load Conversations from backend API
  const loadConversations = useCallback(async () => {
    if (!user) return;
    setIsLoadingConversations(true);
    setError(null);
    try {
      const res = await chatService.getUserConversations();
      if (res.success && res.data?.conversations) {
        const convs = res.data.conversations;
        setConversations(convs);

        const initialUnread = {};
        convs.forEach(c => {
          if (c._id) {
            initialUnread[c._id] = c.unreadCount || 0;
          }
        });
        setUnreadCounts(initialUnread);
      } else {
        setConversations([]);
      }
    } catch (err) {
      console.warn('Backend conversations load notice:', err.message);
      setConversations([]);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [user]);

  // Load Friends from backend API
  const loadFriends = useCallback(async () => {
    if (!user) return;
    setIsLoadingFriends(true);
    try {
      const res = await chatService.getFriends();
      if (res.success && res.data?.friends) {
        setFriends(res.data.friends);
      } else {
        setFriends([]);
      }
    } catch (err) {
      console.warn('Backend friends load notice:', err.message);
      setFriends([]);
    } finally {
      setIsLoadingFriends(false);
    }
  }, [user]);

  // Load Pending Incoming Requests from backend API
  const loadPendingRequests = useCallback(async () => {
    if (!user) return;
    try {
      const res = await chatService.getPendingRequests();
      if (res.success && res.data?.requests) {
        setPendingRequests(res.data.requests);
      } else {
        setPendingRequests([]);
      }
    } catch (err) {
      console.warn('Backend pending requests load notice:', err.message);
      setPendingRequests([]);
    }
  }, [user]);

  // Load Sent Requests from backend API
  const loadSentRequests = useCallback(async () => {
    if (!user) return;
    try {
      const res = await chatService.getSentRequests();
      if (res.success && res.data?.requests) {
        setSentRequests(res.data.requests);
      } else {
        setSentRequests([]);
      }
    } catch (err) {
      console.warn('Backend sent requests load notice:', err.message);
      setSentRequests([]);
    }
  }, [user]);

  // Mark Conversation Messages as Read
  const markAsSeen = useCallback(async (conversationId) => {
    if (!conversationId) return;
    setUnreadCounts(prev => ({
      ...prev,
      [conversationId]: 0
    }));

    try {
      await chatService.markAsRead(conversationId);
    } catch (err) {
      // Handled silently
    }
  }, []);

  // Load Messages for active conversation from backend API
  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    setIsLoadingMessages(true);
    setError(null);
    try {
      const res = await chatService.getConversationMessages(conversationId);
      if (res.success && res.data?.messages) {
        setMessages(res.data.messages);
      } else {
        setMessages([]);
      }
      await markAsSeen(conversationId);
    } catch (err) {
      console.warn('Backend messages load notice:', err.message);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [markAsSeen]);

  // Open Chat with a Friend (Get or Create Conversation)
  const openChatWithFriend = useCallback(async (friendUser) => {
    const friendId = friendUser._id || friendUser.id;
    if (!friendId) return;

    setError(null);
    try {
      const res = await chatService.getOrCreateConversation(friendId);
      if (res.success && res.data?.conversation) {
        const conv = res.data.conversation;
        setActiveConversation(conv);

        setConversations(prev => {
          const exists = prev.some(c => c._id === conv._id);
          if (!exists) return [conv, ...prev];
          return prev;
        });

        await loadMessages(conv._id);
      }
    } catch (err) {
      console.error('Error opening chat with friend:', err.message);
    }
  }, [loadMessages]);

  // Select active conversation
  const selectConversation = useCallback(async (conv) => {
    setActiveConversation(conv);
    if (conv && conv._id) {
      await loadMessages(conv._id);
    } else {
      setMessages([]);
    }
  }, [loadMessages]);

  // Send Message API call & Socket broadcast
  const handleSendMessage = useCallback(async (text) => {
    if (!activeConversation || !text || !text.trim()) return;

    setIsSendingMessage(true);
    setError(null);

    const currentUserId = user?.id || user?._id;
    emitStopTyping(activeConversation._id, currentUserId);

    try {
      const res = await chatService.sendMessage(activeConversation._id, text.trim());
      if (res.success && res.data?.message) {
        const sentMsg = res.data.message;
        setMessages(prev => [...prev, sentMsg]);

        setConversations(prev => {
          const existing = prev.find(c => c._id === activeConversation._id);
          const updatedConv = {
            ...(existing || activeConversation),
            lastMessage: sentMsg.text,
            lastMessageAt: sentMsg.createdAt
          };

          const filtered = prev.filter(c => c._id !== activeConversation._id);
          return [updatedConv, ...filtered];
        });
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSendingMessage(false);
    }
  }, [activeConversation, user]);

  // Send Friend Request API call
  const handleSendFriendRequest = useCallback(async (receiverId) => {
    try {
      const res = await chatService.sendFriendRequest(receiverId);
      if (res.success) {
        await loadSentRequests();
        return { success: true, message: 'Friend request sent!' };
      }
      return { success: false, message: res.message || 'Unable to send request.' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Unable to send friend request.' };
    }
  }, [loadSentRequests]);

  // Accept Friend Request API call
  const handleAcceptRequest = useCallback(async (requestId) => {
    try {
      const res = await chatService.acceptFriendRequest(requestId);
      if (res.success) {
        await loadPendingRequests();
        await loadFriends();
        await loadConversations();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false };
    }
  }, [loadPendingRequests, loadFriends, loadConversations]);

  // Reject Friend Request API call
  const handleRejectRequest = useCallback(async (requestId) => {
    try {
      const res = await chatService.rejectFriendRequest(requestId);
      if (res.success) {
        await loadPendingRequests();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false };
    }
  }, [loadPendingRequests]);

  // Cancel Sent Request API call
  const handleCancelSentRequest = useCallback(async (requestId) => {
    try {
      const res = await chatService.cancelSentRequest(requestId);
      if (res.success) {
        await loadSentRequests();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false };
    }
  }, [loadSentRequests]);

  // Socket Connection & Real-Time Listeners
  useEffect(() => {
    if (user) {
      const userId = user.id || user._id;
      const socket = connectSocket(userId);

      const handleGetOnlineUsers = (usersList) => {
        if (usersList) {
          setOnlineUsers(usersList);
        }
      };

      const handleFriendRequestReceived = (reqData) => {
        if (reqData && reqData._id) {
          setPendingRequests(prev => [reqData, ...prev]);
        }
      };

      const handleNewMessage = (newMsg) => {
        if (newMsg && newMsg.conversationId) {
          if (activeConversation && activeConversation._id === newMsg.conversationId) {
            setMessages(prev => {
              const exists = prev.some(m => m._id === newMsg._id);
              if (!exists) return [...prev, newMsg];
              return prev;
            });
            markAsSeen(newMsg.conversationId);
          } else {
            setUnreadCounts(prev => ({
              ...prev,
              [newMsg.conversationId]: (prev[newMsg.conversationId] || 0) + 1
            }));
          }

          loadConversations();
        }
      };

      socket.on('getOnlineUsers', handleGetOnlineUsers);
      socket.on('friendRequestReceived', handleFriendRequestReceived);
      socket.on('newMessage', handleNewMessage);

      loadConversations();
      loadFriends();
      loadPendingRequests();
      loadSentRequests();

      return () => {
        socket.off('getOnlineUsers', handleGetOnlineUsers);
        socket.off('friendRequestReceived', handleFriendRequestReceived);
        socket.off('newMessage', handleNewMessage);
      };
    }
  }, [user, activeConversation, loadConversations, loadFriends, loadPendingRequests, loadSentRequests, markAsSeen]);

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
    sentRequests,
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
    loadSentRequests,
    loadMessages,
    openChatWithFriend,
    selectConversation,
    handleSendMessage,
    handleSendFriendRequest,
    handleAcceptRequest,
    handleRejectRequest,
    handleCancelSentRequest,
    sendTypingNotification,
    sendStopTypingNotification,
    markAsSeen,
    setError
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
