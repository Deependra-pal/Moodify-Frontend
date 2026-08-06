import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
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
} from '../slice/chatSlice';
import {
  useGetConversationsQuery,
  useGetOrCreateConversationMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useGetFriendsQuery,
  useGetPendingRequestsQuery,
  useGetSentRequestsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useCancelSentRequestMutation,
  useRemoveFriendMutation
} from '../api/chatApi';
import { emitTyping, emitStopTyping } from '../services/socketService';

/**
 * Custom hook to consume Redux Toolkit chatSlice and RTK Query chatApi endpoints.
 */
const useChat = () => {
  const dispatch = useAppDispatch();
  const chatState = useAppSelector((state) => state.chat);
  const authUser = useAppSelector((state) => state.auth.user);

  const { data: convsData, isLoading: isLoadingConversations } = useGetConversationsQuery();
  const { data: friendsData, isLoading: isLoadingFriends } = useGetFriendsQuery();
  const { data: pendingData } = useGetPendingRequestsQuery();
  const { data: sentData } = useGetSentRequestsQuery();

  const [getOrCreateConv] = useGetOrCreateConversationMutation();
  const [sendMessageMutation, { isLoading: isSendingMessage }] = useSendMessageMutation();
  const [sendFriendRequestMutation] = useSendFriendRequestMutation();
  const [acceptFriendRequestMutation] = useAcceptFriendRequestMutation();
  const [rejectFriendRequestMutation] = useRejectFriendRequestMutation();
  const [cancelSentRequestMutation] = useCancelSentRequestMutation();
  const [removeFriendMutation] = useRemoveFriendMutation();

  const activeConvId = chatState.activeConversation?._id;
  const { data: msgData, isLoading: isLoadingMessages, error: messagesError } = useGetMessagesQuery(activeConvId, {
    skip: !activeConvId
  });

  const conversations = useMemo(() => convsData?.data?.conversations || [], [convsData]);
  const friends = useMemo(() => friendsData?.data?.friends || [], [friendsData]);
  const pendingRequests = useMemo(() => pendingData?.data?.requests || [], [pendingData]);
  const sentRequests = useMemo(() => sentData?.data?.requests || [], [sentData]);

  const messages = useMemo(() => {
    const fetchedMsgs = msgData?.data?.messages || [];
    if (chatState.messages.length > 0) {
      const optimisticMsgs = chatState.messages.filter(
        (m) => m.status === 'uploading' || m.status === 'failed'
      );
      return [...fetchedMsgs, ...optimisticMsgs];
    }
    return fetchedMsgs;
  }, [msgData, chatState.messages]);

  const isUserOnline = useCallback(
    (userId) => {
      if (!userId) return false;
      const rawId = (userId._id || userId.id || userId).toString();
      return chatState.onlineUsers.some((id) => id.toString() === rawId);
    },
    [chatState.onlineUsers]
  );

  const selectConversation = useCallback(
    (conv) => {
      dispatch(setActiveConversation(conv));
      dispatch(setMessages([]));
      dispatch(setActiveTab('chats'));
    },
    [dispatch]
  );

  const openChatWithFriend = useCallback(
    async (friendInput) => {
      if (!friendInput) return;
      const friendId =
        typeof friendInput === 'string'
          ? friendInput
          : friendInput._id || friendInput.id || friendInput.user?._id || friendInput.user?.id;

      if (!friendId) return;
      try {
        const res = await getOrCreateConv(friendId).unwrap();
        if (res.success && res.data?.conversation) {
          dispatch(setActiveConversation(res.data.conversation));
          dispatch(setMessages([]));
          dispatch(setActiveTab('chats'));
        }
      } catch (err) {
        console.error('Error opening chat with friend:', err);
      }
    },
    [getOrCreateConv, dispatch]
  );

  const handleSendMessage = useCallback(
    async (text) => {
      if (!chatState.activeConversation || !text?.trim()) return;
      try {
        const res = await sendMessageMutation({
          conversationId: chatState.activeConversation._id,
          text: text.trim()
        }).unwrap();
        if (res.success && res.data?.message) {
          dispatch(addMessage(res.data.message));
        }
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    },
    [chatState.activeConversation, sendMessageMutation, dispatch]
  );

  const handleSendImageMessage = useCallback(
    async (imageDataUrl, text = '') => {
      if (!chatState.activeConversation || !imageDataUrl) return;
      const tempId = `temp_img_${Date.now()}`;
      const optimisticMsg = {
        _id: tempId,
        conversation: chatState.activeConversation._id,
        text: text || '',
        image: imageDataUrl,
        status: 'uploading',
        createdAt: new Date().toISOString()
      };
      dispatch(addMessage(optimisticMsg));

      try {
        const res = await sendMessageMutation({
          conversationId: chatState.activeConversation._id,
          text,
          image: imageDataUrl
        }).unwrap();
        if (res.success && res.data?.message) {
          dispatch(updateOptimisticMessage({ tempId, updatedMsg: { ...res.data.message, status: 'sent' } }));
        }
      } catch (err) {
        dispatch(updateOptimisticMessage({ tempId, updatedMsg: { ...optimisticMsg, status: 'failed' } }));
      }
    },
    [chatState.activeConversation, sendMessageMutation, dispatch]
  );

  const sendTypingNotification = useCallback(() => {
    if (chatState.activeConversation?._id) {
      emitTyping(chatState.activeConversation._id, authUser?._id || authUser?.id, authUser?.username);
    }
  }, [chatState.activeConversation, authUser]);

  const sendStopTypingNotification = useCallback(() => {
    if (chatState.activeConversation?._id) {
      emitStopTyping(chatState.activeConversation._id, authUser?._id || authUser?.id);
    }
  }, [chatState.activeConversation, authUser]);

  const handleSendFriendRequest = useCallback(
    async (receiverId) => {
      try {
        const res = await sendFriendRequestMutation(receiverId).unwrap();
        return { success: true, message: res.message || 'Friend request sent' };
      } catch (err) {
        return { success: false, message: err.data?.message || 'Request failed' };
      }
    },
    [sendFriendRequestMutation]
  );

  const handleAcceptFriendRequest = useCallback(
    async (requestId) => {
      try {
        const res = await acceptFriendRequestMutation(requestId).unwrap();
        return { success: true, message: res.message || 'Friend request accepted' };
      } catch (err) {
        return { success: false, message: err.data?.message || 'Accept failed' };
      }
    },
    [acceptFriendRequestMutation]
  );

  const handleRejectFriendRequest = useCallback(
    async (requestId) => {
      try {
        const res = await rejectFriendRequestMutation(requestId).unwrap();
        return { success: true, message: res.message || 'Friend request rejected' };
      } catch (err) {
        return { success: false, message: err.data?.message || 'Reject failed' };
      }
    },
    [rejectFriendRequestMutation]
  );

  const handleCancelSentRequest = useCallback(
    async (requestId) => {
      try {
        const res = await cancelSentRequestMutation(requestId).unwrap();
        return { success: true, message: res.message || 'Request canceled' };
      } catch (err) {
        return { success: false, message: err.data?.message || 'Cancel failed' };
      }
    },
    [cancelSentRequestMutation]
  );

  const handleRemoveFriend = useCallback(
    async (friendshipId) => {
      try {
        await removeFriendMutation(friendshipId).unwrap();
      } catch (err) {
        console.error('Error unfriending user:', err);
      }
    },
    [removeFriendMutation]
  );

  return {
    ...chatState,
    conversations,
    friends,
    pendingRequests,
    sentRequests,
    messages,
    isLoadingConversations,
    isLoadingFriends,
    isLoadingMessages,
    isSendingMessage,
    error: messagesError?.data?.message || null,
    isUserOnline,
    selectConversation,
    openChatWithFriend,
    sendMessage: handleSendMessage,
    handleSendMessage,
    handleSendImageMessage,
    sendTypingNotification,
    sendStopTypingNotification,
    handleSendFriendRequest,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    handleCancelSentRequest,
    handleRemoveFriend,
    setActiveTab: (tab) => dispatch(setActiveTab(tab)),
    setFilterText: (text) => dispatch(setFilterText(text))
  };
};

export default useChat;
