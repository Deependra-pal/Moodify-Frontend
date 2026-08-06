import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Smile, Paperclip, Image as ImageIcon } from 'lucide-react';
import useChat from '../hooks/useChat';
import EmojiPicker from './EmojiPicker';

const MessageInput = () => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
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
      sendTypingNotification();

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
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);
    await handleSendMessage(messageText);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  const handleSelectEmoji = (emoji) => {
    setText((prev) => prev + emoji);
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
    <div className="relative sticky bottom-0 z-30 bg-[#121214] border-t border-white/5 px-3 py-3 sm:px-5 sm:py-3.5 flex flex-col shrink-0 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-3.5 glass-panel">
      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <EmojiPicker
          onSelectEmoji={handleSelectEmoji}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {/* Attachment Tooltip/Menu Popover */}
      {showAttachmentMenu && (
        <div className="absolute bottom-20 left-12 z-50 bg-[#18181b] border border-white/10 p-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150 text-xs font-bold text-zinc-300">
          <button
            type="button"
            onClick={() => {
              alert('Image attachment coming soon!');
              setShowAttachmentMenu(false);
            }}
            className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-xl transition-all text-white cursor-pointer min-h-[44px]"
          >
            <ImageIcon className="h-4.5 w-4.5 text-[#1db954]" />
            Photo
          </button>
          <button
            type="button"
            onClick={() => {
              alert('File sharing coming soon!');
              setShowAttachmentMenu(false);
            }}
            className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-xl transition-all text-white cursor-pointer min-h-[44px]"
          >
            <Paperclip className="h-4.5 w-4.5 text-sky-400" />
            Document
          </button>
        </div>
      )}

      <form onSubmit={onSubmit} className="flex items-center gap-2 sm:gap-3 w-full">
        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => {
            setShowEmojiPicker((prev) => !prev);
            setShowAttachmentMenu(false);
          }}
          className={`h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center rounded-2xl transition-all cursor-pointer shrink-0 touch-target ${
            showEmojiPicker
              ? 'bg-[#1db954]/20 text-[#1db954] border border-[#1db954]/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
          title="Insert Emoji"
        >
          <Smile className="h-5.5 w-5.5" />
        </button>

        {/* Attachment Placeholder Button */}
        <button
          type="button"
          onClick={() => {
            setShowAttachmentMenu((prev) => !prev);
            setShowEmojiPicker(false);
          }}
          className={`h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center rounded-2xl transition-all cursor-pointer shrink-0 touch-target ${
            showAttachmentMenu
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
          title="Attach media or document"
        >
          <Paperclip className="h-5.5 w-5.5" />
        </button>

        {/* Text Field Input Pill */}
        <div className="flex-1 bg-[#18181b] rounded-2xl border border-white/10 focus-within:border-[#1db954]/60 focus-within:ring-1 focus-within:ring-[#1db954]/30 transition-all flex items-center px-4 h-11 sm:h-12">
          <input
            type="text"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
            disabled={isSendingMessage}
            className="w-full bg-transparent text-white placeholder-zinc-500 text-sm sm:text-base py-2 focus:outline-none"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim() || isSendingMessage}
          className="h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#1db954] to-[#1ed760] text-black hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md shadow-[#1db954]/20 shrink-0 cursor-pointer touch-target"
          title="Send Message"
        >
          {isSendingMessage ? (
            <Loader2 className="h-5 w-5 animate-spin text-black" />
          ) : (
            <Send className="h-5.5 w-5.5 fill-current ml-0.5 text-black" />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
