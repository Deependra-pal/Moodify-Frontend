import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import useChat from '../hooks/useChat';

const MessageInput = () => {
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef(null);

  const {
    handleSendMessage,
    isSendingMessage,
    activeConversation,
    sendTypingNotification,
    sendStopTypingNotification
  } = useChat();

  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);

    if (val.trim()) {
      // Emit start typing
      sendTypingNotification();

      // Reset 2-second debounce timer for stop typing
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        sendStopTypingNotification();
      }, 2000);
    } else {
      sendStopTypingNotification();
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || isSendingMessage || !activeConversation) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    sendStopTypingNotification();

    const messageText = text;
    setText('');
    await handleSendMessage(messageText);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [activeConversation]);

  if (!activeConversation) return null;

  return (
    <form onSubmit={onSubmit} className="p-3.5 bg-[#121214] border-t border-white/5 flex items-center gap-3">
      <div className="flex-1 bg-[#18181b] rounded-full border border-white/10 focus-within:border-[#1db954]/60 focus-within:ring-1 focus-within:ring-[#1db954]/30 transition-all flex items-center px-4 py-1">
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          disabled={isSendingMessage}
          className="w-full bg-transparent text-white placeholder-zinc-500 text-sm py-2.5 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={!text.trim() || isSendingMessage}
        className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-r from-[#1db954] to-[#1ed760] text-black hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#1db954]/20 shrink-0 cursor-pointer"
        title="Send Message"
      >
        {isSendingMessage ? (
          <Loader2 className="h-4.5 w-4.5 animate-spin text-black" />
        ) : (
          <Send className="h-4.5 w-4.5 fill-current ml-0.5" />
        )}
      </button>
    </form>
  );
};

export default MessageInput;
