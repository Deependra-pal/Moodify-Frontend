import React, { useEffect, useRef } from 'react';
import { MessageSquare, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';
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
    typingUsers,
    isUserOnline,
    selectConversation,
    setError
  } = useChat();

  const messagesEndRef = useRef(null);

  // Get recipient profile
  const friend = activeConversation?.participants?.find(
    (p) => (p._id || p.id).toString() !== (user?.id || user?._id)?.toString()
  ) || activeConversation?.participants?.[0];

  const friendId = friend?._id || friend?.id;
  const isOnline = isUserOnline(friendId);
  const activeTyping = activeConversation && typingUsers ? typingUsers[activeConversation._id] : null;

  // Auto-scroll to bottom when messages update, active conversation changes, or typing status changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversation, activeTyping]);

  // Empty state when no conversation selected (Desktop view)
  if (!activeConversation) {
    return (
      <div className="hidden md:flex flex-1 h-full bg-[#09090b] flex-col items-center justify-center p-8 text-center select-none border-l border-white/5">
        <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-[#121214] to-[#18181b] border border-white/5 flex items-center justify-center text-[#1db954] mb-5 shadow-2xl shadow-[#1db954]/10">
          <MessageSquare className="h-9 w-9 stroke-[2]" />
        </div>
        <h3 className="text-2xl font-black text-white tracking-tight mb-2">Your Direct Messages</h3>
        <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
          Select a conversation from the sidebar or click "Message" on any friend to start chatting in real-time.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative flex-1 h-full max-h-full bg-[#09090b] flex-col min-w-0 overflow-hidden ${
      activeConversation ? 'flex' : 'hidden md:flex'
    }`}>
      {/* 📌 PINNED TOP HEADER */}
      <div className="sticky top-0 z-30 p-3.5 pt-[calc(0.875rem+env(safe-area-inset-top,0px))] px-4 sm:px-6 bg-[#121214]/95 backdrop-blur-xl border-b border-white/5 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Back Button Arrow (<) */}
          <button
            onClick={() => selectConversation(null)}
            className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-zinc-800/60 active:scale-95 rounded-full transition-all cursor-pointer shrink-0"
            title="Back to conversations"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>

          {/* Avatar with Status Ring */}
          <div className="relative shrink-0">
            <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-zinc-800 border text-white font-bold flex items-center justify-center text-xs ${
              isOnline ? 'border-[#1db954]/60 shadow-md shadow-[#1db954]/15' : 'border-white/10'
            }`}>
              {friend?.username ? friend.username.substring(0, 2).toUpperCase() : 'U'}
            </div>
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border-2 border-[#121214] ${
                isOnline ? 'bg-[#1db954] shadow-sm shadow-[#1db954]' : 'bg-zinc-600'
              }`}
            />
          </div>

          {/* Recipient Details & Live Status */}
          <div className="min-w-0 space-y-0.5">
            <h3 className="text-sm sm:text-base font-bold text-white truncate leading-tight">{friend?.username || 'Chat'}</h3>
            <p className="text-[11px] font-semibold flex items-center gap-1.5 truncate">
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-[#1db954] animate-pulse' : 'bg-zinc-600'}`} />
              <span className={isOnline ? 'text-[#1db954]' : 'text-zinc-500'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center justify-between text-xs text-red-400 shrink-0">
          <span className="flex items-center gap-1.5 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </span>
          <button onClick={() => setError(null)} className="hover:underline font-bold cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* 📜 MESSAGES SCROLL VIEWPORT */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 custom-scrollbar min-h-0">
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
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] md:max-w-[60%] px-4 py-2.5 sm:py-3 rounded-2xl text-sm leading-relaxed break-words shadow-md ${
                    isMe
                      ? 'bg-gradient-to-r from-[#1db954] to-[#1ed760] text-black font-semibold rounded-br-xs shadow-md shadow-[#1db954]/10'
                      : 'bg-[#1e1e22]/90 text-zinc-100 border border-white/5 rounded-bl-xs'
                  }`}
                >
                  <p className="select-text">{msg.text}</p>
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 px-1 font-medium select-none">
                  {formatMessageTime(msg.createdAt)}
                </span>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 select-none">
            <div className="h-12 w-12 rounded-full bg-[#121214] border border-white/5 flex items-center justify-center text-zinc-600 mb-2">
              <Sparkles className="h-6 w-6 text-[#1db954]" />
            </div>
            <p className="text-sm text-zinc-300 font-bold">No messages in this chat yet.</p>
            <p className="text-xs text-zinc-500 max-w-xs">Type a message below to start the conversation!</p>
          </div>
        )}

        {/* Live Typing Indicator */}
        {activeTyping && (
          <div className="flex flex-col items-start space-y-1 pt-1 animate-in fade-in duration-200">
            <div className="bg-[#1e1e22]/90 text-zinc-300 border border-white/5 px-4 py-2.5 rounded-2xl rounded-bl-xs flex items-center gap-2 shadow-sm">
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

      {/* 📌 PINNED BOTTOM MESSAGE INPUT BAR */}
      <MessageInput />
    </div>
  );
};

export default ChatWindow;
