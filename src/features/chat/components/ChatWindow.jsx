import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import {
  MessageSquare,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Phone,
  Video,
  Info,
  CheckCheck,
  ArrowDown,
  Loader2,
  RefreshCw
} from 'lucide-react';
import useChat from '../hooks/useChat';
import useAuth from '../../auth/hooks/useAuth';
import MessageInput from './MessageInput';

const formatMessageTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getDateKey = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toDateString();
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

const MessageSkeleton = () => (
  <div className="space-y-4 p-4 animate-pulse">
    <div className="flex flex-col items-start space-y-1.5">
      <div className="h-12 w-56 bg-zinc-800/60 rounded-2xl rounded-bl-xs" />
      <div className="h-3 w-16 bg-zinc-800/40 rounded" />
    </div>
    <div className="flex flex-col items-end space-y-1.5">
      <div className="h-14 w-72 bg-zinc-800/80 rounded-2xl rounded-br-xs" />
      <div className="h-3 w-16 bg-zinc-800/40 rounded" />
    </div>
    <div className="flex flex-col items-start space-y-1.5">
      <div className="h-10 w-40 bg-zinc-800/60 rounded-2xl rounded-bl-xs" />
      <div className="h-3 w-16 bg-zinc-800/40 rounded" />
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
    retryImageUpload,
    setError
  } = useChat();

  const scrollContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [showScrollDownBtn, setShowScrollDownBtn] = useState(false);

  // 100% Robust, Null-Safe Participant Extractor
  const friend = useMemo(() => {
    if (!activeConversation || !activeConversation.participants || !Array.isArray(activeConversation.participants)) {
      return { username: 'Chat User', email: '' };
    }

    const currentUserId = user ? (user._id || user.id || '').toString() : '';

    const found = activeConversation.participants.find((p) => {
      if (!p) return false;
      const pId = typeof p === 'object' ? (p._id || p.id || '').toString() : p.toString();
      return pId && pId !== currentUserId;
    });

    const result = found || activeConversation.participants[0] || { username: 'Chat User', email: '' };
    return typeof result === 'object' ? result : { _id: result, username: 'Chat User', email: '' };
  }, [activeConversation, user]);

  const friendId = friend?._id || friend?.id;
  const isOnline = isUserOnline(friendId);
  const activeTyping = activeConversation && typingUsers ? typingUsers[activeConversation._id] : null;

  // Helper to check if user is scrolled near the bottom (within 150px threshold)
  const isNearBottom = useCallback(() => {
    if (!scrollContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 150;
  }, []);

  // Fast & lightweight scroll helper
  const scrollToBottom = useCallback((instant = false) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    if (instant) {
      container.scrollTop = container.scrollHeight;
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
      }
    } else {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } else {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, []);

  // Detect manual scroll position for floating jump-to-bottom button
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setShowScrollDownBtn(scrollHeight - scrollTop - clientHeight > 200);
  }, []);

  // Instant scroll on active conversation change or when message loading finishes
  useLayoutEffect(() => {
    if (!activeConversation) return;
    scrollToBottom(true);
    const frame = requestAnimationFrame(() => scrollToBottom(true));
    const timer = setTimeout(() => scrollToBottom(true), 60);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [activeConversation?._id, isLoadingMessages, scrollToBottom]);

  // Smooth scroll on incoming/outgoing messages if user is near bottom
  useEffect(() => {
    if (messages.length > 0 && isNearBottom()) {
      scrollToBottom(false);
    }
  }, [messages.length, activeTyping, isNearBottom, scrollToBottom]);

  const groupedMessages = [];
  let currentDateKey = null;

  messages.forEach((msg) => {
    const key = getDateKey(msg.createdAt);
    if (key !== currentDateKey) {
      currentDateKey = key;
      groupedMessages.push({
        type: 'date_separator',
        id: `date-${key}`,
        dateStr: msg.createdAt
      });
    }
    groupedMessages.push({
      type: 'message',
      ...msg
    });
  });

  if (!activeConversation) {
    return (
      <div className="hidden md:flex flex-1 h-full bg-[#09090b] flex-col items-center justify-center p-8 text-center select-none border-l border-white/5">
        <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-[#121214] to-[#18181b] border border-white/10 flex items-center justify-center text-[#1db954] mb-6 shadow-2xl shadow-[#1db954]/10">
          <MessageSquare className="h-10 w-10 stroke-[1.75]" />
        </div>
        <h3 className="text-2xl font-black text-white tracking-tight mb-2">Moodify Direct Messaging</h3>
        <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
          Select a chat from the sidebar or click <span className="text-[#1db954] font-bold">Message</span> on any friend to start messaging in real-time.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 h-full bg-[#09090b] flex-col min-w-0 overflow-hidden relative ${
        activeConversation ? 'flex fixed inset-0 z-50 md:relative md:inset-auto md:z-auto' : 'hidden md:flex'
      }`}
    >
      {/* 📌 STICKY WHATSAPP-STYLE HEADER */}
      <div className="sticky top-0 z-30 px-4 sm:px-6 py-3.5 sm:py-4 bg-[#121214] border-b border-white/5 flex items-center justify-between shrink-0 shadow-lg glass-panel">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Mobile Back Arrow Button */}
          <button
            type="button"
            onClick={() => selectConversation(null)}
            className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 active:scale-95 rounded-2xl transition-all cursor-pointer shrink-0 touch-target"
            title="Back to conversations"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>

          {/* Avatar with Status Ring */}
          <div className="relative shrink-0">
            <div
              className={`h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-zinc-800 border text-white font-black flex items-center justify-center text-sm shadow-md ${
                isOnline ? 'border-[#1db954]/60 shadow-md shadow-[#1db954]/20' : 'border-white/10'
              }`}
            >
              {friend?.username ? friend.username.substring(0, 2).toUpperCase() : 'U'}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full border-2 border-[#121214] ${
                isOnline ? 'bg-[#1db954]' : 'bg-zinc-600'
              }`}
            />
          </div>

          {/* User Name & Live Online Status */}
          <div className="min-w-0 space-y-0.5">
            <h3 className="text-base sm:text-lg font-black text-white truncate leading-tight">
              {friend?.username || 'Chat'}
            </h3>
            <p className="text-xs font-semibold flex items-center gap-1.5 truncate">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  isOnline ? 'bg-[#1db954] animate-pulse' : 'bg-zinc-600'
                }`}
              />
              <span className={isOnline ? 'text-[#1db954] font-bold' : 'text-zinc-400 font-medium'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => alert('Audio call coming soon!')}
            className="p-2.5 text-zinc-400 hover:text-[#1db954] hover:bg-white/5 rounded-xl transition-all cursor-pointer touch-target"
            title="Start Voice Call"
          >
            <Phone className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => alert('Video call coming soon!')}
            className="p-2.5 text-zinc-400 hover:text-[#1db954] hover:bg-white/5 rounded-xl transition-all cursor-pointer touch-target"
            title="Start Video Call"
          >
            <Video className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => alert(`Username: ${friend?.username}\nEmail: ${friend?.email || 'N/A'}`)}
            className="p-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer touch-target"
            title="User Info"
          >
            <Info className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-red-400 shrink-0">
          <span className="flex items-center gap-2 font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="hover:underline font-extrabold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 📜 MESSAGES SCROLL VIEWPORT */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3.5 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-5 space-y-3 custom-scrollbar min-h-0 relative max-w-full overflow-x-hidden"
      >
        {isLoadingMessages ? (
          <MessageSkeleton />
        ) : messages.length > 0 ? (
          groupedMessages.map((item) => {
            if (item.type === 'date_separator') {
              return (
                <div key={item.id} className="flex items-center justify-center my-4 select-none">
                  <span className="bg-[#18181b] border border-white/10 text-zinc-400 text-[11px] font-extrabold px-3.5 py-1 rounded-full shadow-sm uppercase tracking-wider">
                    {formatDateLabel(item.dateStr)}
                  </span>
                </div>
              );
            }

            const senderId = item.sender?._id || item.sender?.id || item.sender;
            const currentUserId = user?.id || user?._id;
            const isMe = senderId?.toString() === currentUserId?.toString();

            return (
              <div
                key={item._id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] md:max-w-[60%] p-3 text-sm sm:text-base leading-relaxed break-words shadow-lg ${
                    isMe
                      ? 'chat-bubble-out text-black font-semibold'
                      : 'chat-bubble-in text-zinc-100 font-normal'
                  }`}
                >
                  {/* Image Attachment Rendering */}
                  {item.image && (
                    <div className="relative rounded-xl overflow-hidden mb-2 max-w-full border border-black/10 shadow-sm bg-black/20 group">
                      <img
                        src={item.image}
                        alt="Attached media"
                        className="w-full max-h-72 object-cover rounded-lg select-none pointer-events-auto"
                      />

                      {/* Optimistic Uploading Overlay Indicator */}
                      {item.status === 'uploading' && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 p-3 text-white text-xs font-bold animate-in fade-in duration-200">
                          <Loader2 className="h-6 w-6 animate-spin text-[#1db954]" />
                          <span className="tracking-wide">Uploading...</span>
                        </div>
                      )}

                      {/* Upload Failure Overlay & Retry Button */}
                      {item.status === 'failed' && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 p-3 text-center text-white text-xs font-bold animate-in fade-in duration-200">
                          <AlertCircle className="h-6 w-6 text-rose-500 animate-pulse" />
                          <span className="text-rose-300 font-black">Failed to send image</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (retryImageUpload) retryImageUpload(item._id);
                            }}
                            className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-md active:scale-95 touch-target min-h-[36px]"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Retry
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {item.text && <p className="select-text whitespace-pre-wrap px-1">{item.text}</p>}

                  {/* Timestamp & Read Receipt Checkmarks */}
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10.5px] font-bold select-none ${
                      isMe ? 'text-black/70' : 'text-zinc-400'
                    }`}
                  >
                    <span>{formatMessageTime(item.createdAt)}</span>
                    {isMe && (
                      <CheckCheck className="h-4 w-4 text-black stroke-[2.5]" title="Delivered / Read" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          /* Empty Chat Conversation State */
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 select-none">
            <div className="h-16 w-16 rounded-3xl bg-[#121214] border border-white/10 flex items-center justify-center text-[#1db954] mb-2 shadow-xl">
              <Sparkles className="h-8 w-8 text-[#1db954]" />
            </div>
            <h4 className="text-base font-black text-white">No Messages Yet</h4>
            <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
              Break the ice! Send a message below to start chatting with <span className="text-white font-bold">{friend?.username}</span>.
            </p>
          </div>
        )}

        {/* Live Typing Indicator */}
        {activeTyping && (
          <div className="flex flex-col items-start space-y-1 pt-1 animate-in fade-in duration-200">
            <div className="bg-[#18181c] text-zinc-300 border border-white/10 px-4 py-2.5 rounded-2xl rounded-bl-xs flex items-center gap-2.5 shadow-md">
              <span className="text-xs font-bold text-[#1db954]">{activeTyping.username} is typing</span>
              <div className="flex items-center gap-1 shrink-0">
                <span className="h-2 w-2 rounded-full bg-[#1db954] animate-bounce [animation-delay:-0.3s]" />
                <span className="h-2 w-2 rounded-full bg-[#1db954] animate-bounce [animation-delay:-0.15s]" />
                <span className="h-2 w-2 rounded-full bg-[#1db954] animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll-To-Latest-Message Button (WhatsApp style) */}
      {showScrollDownBtn && (
        <button
          type="button"
          onClick={() => scrollToBottom(false)}
          className="absolute bottom-20 right-6 z-40 bg-[#18181b] hover:bg-[#1db954] text-zinc-300 hover:text-black border border-white/10 p-3 rounded-full shadow-2xl transition-all cursor-pointer animate-in fade-in zoom-in-95 duration-200"
          title="Jump to latest messages"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      )}

      {/* 📌 PINNED BOTTOM MESSAGE INPUT BAR */}
      <MessageInput />
    </div>
  );
};

export default ChatWindow;
