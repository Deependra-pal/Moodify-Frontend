import React, { useEffect, useRef } from 'react';
import { MessageSquare, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import useChat from '../hooks/useChat';
import useAuth from '../../auth/hooks/useAuth';
import MessageInput from './MessageInput';

const formatMessageTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const MessageSkeleton = () => (
  <div className="space-y-4 p-2 animate-pulse">
    <div className="flex flex-col items-start space-y-1">
      <div className="h-10 w-48 bg-zinc-800/60 rounded-2xl rounded-bl-xs" />
      <div className="h-2 w-12 bg-zinc-800/40 rounded" />
    </div>
    <div className="flex flex-col items-end space-y-1">
      <div className="h-12 w-64 bg-zinc-800/80 rounded-2xl rounded-br-xs" />
      <div className="h-2 w-12 bg-zinc-800/40 rounded" />
    </div>
    <div className="flex flex-col items-start space-y-1">
      <div className="h-8 w-36 bg-zinc-800/60 rounded-2xl rounded-bl-xs" />
      <div className="h-2 w-12 bg-zinc-800/40 rounded" />
    </div>
  </div>
);

const ChatWindow = () => {
  const { user } = useAuth();
  const {
    activeConversation,
    messages,
    isLoadingMessages,
    error,
    onlineUsers,
    typingUsers,
    loadMessages,
    setError
  } = useChat();

  const messagesEndRef = useRef(null);

  // Get recipient profile
  const friend = activeConversation?.participants?.find(
    (p) => (p._id || p.id).toString() !== (user?.id || user?._id)?.toString()
  ) || activeConversation?.participants?.[0];

  const friendId = friend?._id || friend?.id;
  const isOnline = friendId && onlineUsers ? onlineUsers.includes(friendId.toString()) : false;
  const activeTyping = activeConversation && typingUsers ? typingUsers[activeConversation._id] : null;

  // Auto-scroll to bottom when messages update, active conversation changes, or typing status changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversation, activeTyping]);

  // Empty state when no conversation selected
  if (!activeConversation) {
    return (
      <div className="flex-1 h-full bg-[#09090b] flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="h-20 w-20 rounded-full bg-[#121214] border border-white/5 flex items-center justify-center text-[#1db954] mb-4 shadow-2xl shadow-[#1db954]/5">
          <MessageSquare className="h-9 w-9" />
        </div>
        <h3 className="text-xl font-black text-white tracking-tight mb-2">Your Direct Messages</h3>
        <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
          Select a conversation from the sidebar or click "Message" on any friend to start chatting.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full bg-[#09090b] flex flex-col min-w-0">
      {/* Active Conversation Glass Header */}
      <div className="p-4 bg-[#121214]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="h-10 w-10 rounded-full bg-zinc-800 border border-white/10 text-white font-bold flex items-center justify-center text-xs">
              {friend?.username ? friend.username.substring(0, 2).toUpperCase() : 'U'}
            </div>
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#121214] ${
                isOnline ? 'bg-[#1db954] shadow-sm shadow-[#1db954]' : 'bg-zinc-600'
              }`}
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{friend?.username || 'Chat'}</h3>
            <p className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5 truncate">
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-[#1db954]' : 'bg-zinc-600'}`} />
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        {/* Manual Refresh Messages Button */}
        <button
          onClick={() => loadMessages(activeConversation._id)}
          disabled={isLoadingMessages}
          title="Refresh Messages"
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-full transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingMessages ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center justify-between text-xs text-red-400">
          <span className="flex items-center gap-1.5 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </span>
          <button onClick={() => setError(null)} className="hover:underline font-bold">Dismiss</button>
        </div>
      )}

      {/* Messages Scroll Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {isLoadingMessages ? (
          <MessageSkeleton />
        ) : messages.length > 0 ? (
          messages.map((msg) => {
            const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
            const currentUserId = user?.id || user?._id;
            const isMe = senderId?.toString() === currentUserId?.toString();

            return (
              <div
                key={msg._id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[75%] md:max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words shadow-md ${
                    isMe
                      ? 'bg-gradient-to-r from-[#1db954] to-[#1ed760] text-black font-semibold rounded-br-xs shadow-md shadow-[#1db954]/10'
                      : 'bg-[#27272a]/80 text-zinc-100 border border-white/5 rounded-bl-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 px-1 font-medium">
                  {formatMessageTime(msg.createdAt)}
                </span>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 select-none">
            <p className="text-xs text-zinc-400 font-bold">No messages in this chat yet.</p>
            <p className="text-xs text-zinc-600">Type a message below to start the conversation!</p>
          </div>
        )}

        {/* Live Typing Indicator */}
        {activeTyping && (
          <div className="flex flex-col items-start space-y-1 pt-1 animate-in fade-in duration-200">
            <div className="bg-[#27272a]/90 text-zinc-300 border border-white/5 px-4 py-2.5 rounded-2xl rounded-bl-xs flex items-center gap-2 shadow-sm">
              <span className="text-xs font-semibold">{activeTyping.username} is typing</span>
              <div className="flex items-center gap-1 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1db954] animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#1db954] animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#1db954] animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <MessageInput />
    </div>
  );
};

export default ChatWindow;
