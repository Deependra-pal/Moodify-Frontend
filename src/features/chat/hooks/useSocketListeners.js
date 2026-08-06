import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import useAuth from '../../auth/hooks/useAuth';
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  joinRoom,
  leaveRoom
} from '../services/socketService';
import {
  setOnlineUsers,
  addMessage,
  setUserTyping,
  setUserStopTyping
} from '../slice/chatSlice';
import { chatApi } from '../api/chatApi';

/**
 * Top-level hook to manage Socket.IO connection and real-time listeners.
 * Mounted at AppLayout level so real-time messaging works continuously.
 */
export const useSocketListeners = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const activeConv = useAppSelector((state) => state.chat.activeConversation);
  const activeConvRef = useRef(activeConv?._id);

  useEffect(() => {
    activeConvRef.current = activeConv?._id;
  }, [activeConv?._id]);

  const userId = user?._id || user?.id;

  useEffect(() => {
    if (!userId) return;

    // 1. Initialize / reconnect socket with authenticated user ID
    const socket = connectSocket(userId.toString());
    if (!socket) return;

    // 2. Online users list update listener
    const handleOnlineUsers = (users) => {
      if (Array.isArray(users)) {
        dispatch(setOnlineUsers(users));
      }
    };

    // 3. New incoming message listener
    const handleNewMessage = (msg) => {
      if (!msg) return;

      // Dispatch to Redux store (deduplicated in reducer)
      dispatch(addMessage(msg));

      // Invalidate RTK Query cache so conversation snippets update
      dispatch(
        chatApi.util.invalidateTags([
          { type: 'Messages', id: msg.conversation },
          'Conversations'
        ])
      );
    };

    // 4. Conversation snippet update listener
    const handleConversationUpdated = () => {
      dispatch(chatApi.util.invalidateTags(['Conversations']));
    };

    // 5. Real-time typing listeners
    const handleTyping = ({ conversationId, username }) => {
      if (conversationId && username) {
        dispatch(setUserTyping({ conversationId: conversationId.toString(), username }));
      }
    };

    const handleStopTyping = ({ conversationId }) => {
      if (conversationId) {
        dispatch(setUserStopTyping({ conversationId: conversationId.toString() }));
      }
    };

    // 6. Friend Request events
    const handleFriendRequestReceived = () => {
      dispatch(chatApi.util.invalidateTags(['Requests', 'Notifications']));
    };

    const handleFriendRequestAccepted = () => {
      dispatch(chatApi.util.invalidateTags(['Friends', 'Conversations', 'Requests', 'Notifications']));
    };

    // 7. Generic notifications
    const handleNewNotification = () => {
      dispatch(chatApi.util.invalidateTags(['Notifications']));
    };

    // Register event listeners
    socket.on('getOnlineUsers', handleOnlineUsers);
    socket.on('newMessage', handleNewMessage);
    socket.on('conversationUpdated', handleConversationUpdated);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);
    socket.on('friendRequestReceived', handleFriendRequestReceived);
    socket.on('friendRequestAccepted', handleFriendRequestAccepted);
    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('getOnlineUsers', handleOnlineUsers);
      socket.off('newMessage', handleNewMessage);
      socket.off('conversationUpdated', handleConversationUpdated);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
      socket.off('friendRequestReceived', handleFriendRequestReceived);
      socket.off('friendRequestAccepted', handleFriendRequestAccepted);
      socket.off('newNotification', handleNewNotification);
    };
  }, [userId, dispatch]);

  // Handle joining and leaving conversation rooms
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !socket.connected) return;

    if (activeConv?._id) {
      joinRoom(activeConv._id);
    }

    return () => {
      if (activeConv?._id) {
        leaveRoom(activeConv._id);
      }
    };
  }, [activeConv?._id]);
};

export default useSocketListeners;
