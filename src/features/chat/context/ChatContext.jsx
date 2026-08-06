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

import {
  mockConversations,
  mockFriendsList,
  mockIncomingRequests,
  mockSentRequests,
  generateMockMessages,
  mockOnlineUserIds,
  mockTypingUsers
} from '../data/mockChatData';

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();

  const [conversations, setConversations] = useState(mockConversations);
  const [friends, setFriends] = useState(mockFriendsList);
  const [pendingRequests, setPendingRequests] = useState(mockIncomingRequests);
  const [sentRequests, setSentRequests] = useState(mockSentRequests);
  const [activeConversation, setActiveConversation] = useState(mockConversations[0]);
  const [messages, setMessages] = useState([]);
  
  // Real-Time States
  const [onlineUsers, setOnlineUsers] = useState(mockOnlineUserIds);
  const [typingUsers, setTypingUsers] = useState(mockTypingUsers);
  const [unreadCounts, setUnreadCounts] = useState({
    conv_1: 3,
    conv_2: 1,
    conv_4: 2
  });

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

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setIsLoadingConversations(true);
    setError(null);
    try {
      const res = await chatService.getUserConversations();
      if (res.success && res.data?.conversations && res.data.conversations.length > 0) {
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
        setConversations(mockConversations);
      }
    } catch (err) {
      setConversations(mockConversations);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [user]);

  const loadFriends = useCallback(async () => {
    if (!user) return;
    setIsLoadingFriends(true);
    try {
      const res = await chatService.getFriends();
      if (res.success && res.data?.friends && res.data.friends.length > 0) {
        setFriends(res.data.friends);
      } else {
        setFriends(mockFriendsList);
      }
    } catch (err) {
      setFriends(mockFriendsList);
    } finally {
      setIsLoadingFriends(false);
    }
  }, [user]);

  const loadPendingRequests = useCallback(async () => {
    if (!user) return;
    try {
      const res = await chatService.getPendingRequests();
      if (res.success && res.data?.requests && res.data.requests.length > 0) {
        setPendingRequests(res.data.requests);
      } else {
        setPendingRequests(mockIncomingRequests);
      }
    } catch (err) {
      setPendingRequests(mockIncomingRequests);
    }
  }, [user]);

  const markAsSeen = useCallback(async (conversationId) => {
    if (!conversationId) return;
    setUnreadCounts(prev => ({
      ...prev,
      [conversationId]: 0
    }));

    try {
      await chatService.markAsRead(conversationId);
    } catch (err) {
      // Handled
    }
  }, []);

  const loadMessages = useCallback(async (conversationId, friendUser) => {
    if (!conversationId) return;
    setIsLoadingMessages(true);
    setError(null);
    try {
      const res = await chatService.getConversationMessages(conversationId);
      if (res.success && res.data?.messages && res.data.messages.length > 0) {
        setMessages(res.data.messages);
      } else {
        const generated = generateMockMessages(conversationId, friendUser, user);
        setMessages(generated);
      }
      await markAsSeen(conversationId);
    } catch (err) {
      const generated = generateMockMessages(conversationId, friendUser, user);
      setMessages(generated);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [markAsSeen, user]);

  const openChatWithFriend = useCallback(async (friendUser) => {
    const friendId = friendUser._id || friendUser.id;
    if (!friendId) return;

    setError(null);
    try {
      const res = await chatService.getOrCreateConversation(friendId);
      if (res.success && res.data.conversation) {
        const conv = res.data.conversation;
        setActiveConversation(conv);
        
        setConversations(prev => {
          const exists = prev.some(c => c._id === conv._id);
          if (!exists) return [conv, ...prev];
          return prev;
        });

        await loadMessages(conv._id, friendUser);
      } else {
        const existingConv = conversations.find(c =>
          c.participants.some(p => (p._id || p.id).toString() === friendId.toString())
        );

        if (existingConv) {
          setActiveConversation(existingConv);
          await loadMessages(existingConv._id, friendUser);
        } else {
          const newMockConv = {
            _id: `conv_${Date.now()}`,
            participants: [friendUser],
            lastMessage: 'Hey! Lets connect on Moodify.',
            lastMessageAt: new Date().toISOString(),
            unreadCount: 0
          };
          setConversations(prev => [newMockConv, ...prev]);
          setActiveConversation(newMockConv);
          setMessages(generateMockMessages(newMockConv._id, friendUser, user));
        }
      }
    } catch (err) {
      const existingConv = conversations.find(c =>
        c.participants.some(p => (p._id || p.id).toString() === friendId.toString())
      );

      if (existingConv) {
        setActiveConversation(existingConv);
        await loadMessages(existingConv._id, friendUser);
      }
    }
  }, [conversations, loadMessages, user]);

  const selectConversation = useCallback(async (conv) => {
    setActiveConversation(conv);
    if (conv && conv._id) {
      const friend = conv.participants?.[0];
      await loadMessages(conv._id, friend);
    }
  }, [loadMessages]);

  useEffect(() => {
    if (activeConversation && activeConversation._id && messages.length === 0) {
      const friend = activeConversation.participants?.[0];
      setMessages(generateMockMessages(activeConversation._id, friend, user));
    }
  }, [activeConversation, messages.length, user]);

  const handleSendMessage = useCallback(async (text) => {
    if (!activeConversation || !text || !text.trim()) return;

    setIsSendingMessage(true);
    setError(null);

    const currentUserId = user?.id || user?._id || 'me';
    emitStopTyping(activeConversation._id, currentUserId);

    const newMsgObj = {
      _id: `msg_${Date.now()}`,
      sender: { _id: currentUserId, username: user?.username || 'Me' },
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsgObj]);

    const updatedTime = newMsgObj.createdAt;
    setActiveConversation(prev => ({
      ...prev,
      lastMessage: newMsgObj.text,
      lastMessageAt: updatedTime
    }));

    setConversations(prev => {
      const existing = prev.find(c => c._id === activeConversation._id);
      const updatedConv = {
        ...(existing || activeConversation),
        lastMessage: newMsgObj.text,
        lastMessageAt: updatedTime
      };

      const filtered = prev.filter(c => c._id !== activeConversation._id);
      return [updatedConv, ...filtered];
    });

    try {
      await chatService.sendMessage(activeConversation._id, text.trim());
    } catch (err) {
      // Handled
    } finally {
      setIsSendingMessage(false);
    }
  }, [activeConversation, user]);

  const handleSendFriendRequest = useCallback(async (receiverId) => {
    try {
      await chatService.sendFriendRequest(receiverId);
    } catch (err) {
      // Handled
    }

    setSentRequests(prev => [
      {
        _id: `req_sent_${Date.now()}`,
        receiver: { _id: receiverId, username: 'Requested User', email: 'user@moodify.com' },
        createdAt: new Date().toISOString(),
        status: 'pending'
      },
      ...prev
    ]);

    return { success: true, message: 'Friend request sent!' };
  }, []);

  const handleAcceptRequest = useCallback(async (requestId) => {
    setPendingRequests(prev => prev.filter(r => r._id !== requestId));

    try {
      await chatService.acceptFriendRequest(requestId);
    } catch (err) {
      // Handled
    }
    return { success: true };
  }, []);

  const handleRejectRequest = useCallback(async (requestId) => {
    setPendingRequests(prev => prev.filter(r => r._id !== requestId));

    try {
      await chatService.rejectFriendRequest(requestId);
    } catch (err) {
      // Handled
    }
    return { success: true };
  }, []);

  const handleCancelSentRequest = useCallback((requestId) => {
    setSentRequests(prev => prev.filter(r => r._id !== requestId));
    return { success: true };
  }, []);

  useEffect(() => {
    if (user) {
      const userId = user.id || user._id;
      const socket = connectSocket(userId);

      const handleGetOnlineUsers = (usersList) => {
        if (usersList && usersList.length > 0) {
          setOnlineUsers(usersList);
        }
      };

      const handleFriendRequestReceived = (reqData) => {
        if (reqData && reqData._id) {
          setPendingRequests(prev => {
            const exists = prev.some(r => r._id === reqData._id);
            if (!exists) return [reqData, ...prev];
            return prev;
          });
        }
      };

      socket.on('getOnlineUsers', handleGetOnlineUsers);
      socket.on('friendRequestReceived', handleFriendRequestReceived);

      loadConversations();
      loadFriends();
      loadPendingRequests();

      return () => {
        socket.off('getOnlineUsers', handleGetOnlineUsers);
        socket.off('friendRequestReceived', handleFriendRequestReceived);
      };
    }
  }, [user, loadConversations, loadFriends, loadPendingRequests]);

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
