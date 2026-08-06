import React, { useRef, useEffect } from 'react';
import { Smile, X } from 'lucide-react';

const EMOJI_CATEGORIES = [
  {
    name: 'Popular',
    emojis: ['👍', '❤️', '🔥', '😂', '😍', '😊', '🎉', '🙌', '✨', '💯', '🙏', '🎶']
  },
  {
    name: 'Mood & Expressions',
    emojis: ['😎', '🥳', '🤔', '😴', '🙄', '🥺', '🤩', '😇', '💩', '🤯', '💀', '🤡']
  },
  {
    name: 'Music & Vibes',
    emojis: ['🎧', '🎤', '🎸', '🎹', '🥁', '🎵', '🎶', '📻', '💃', '🕺', '🔊', '⚡']
  },
  {
    name: 'Hands & Gestures',
    emojis: ['👋', '🖐️', '👌', '✌️', '🤞', '🤝', '👏', '💪', '👈', '👉', '👇', '👆']
  }
];

const EmojiPicker = ({ onSelectEmoji, onClose }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      className="absolute bottom-16 left-3 sm:left-4 z-50 w-72 sm:w-80 bg-[#121214] border border-white/10 rounded-2xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150 glass-panel"
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 px-1">
        <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
          <Smile className="h-4 w-4 text-[#1db954]" />
          Pick an Emoji
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="max-h-60 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
        {EMOJI_CATEGORIES.map((cat) => (
          <div key={cat.name}>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 mb-1 px-1">
              {cat.name}
            </p>
            <div className="grid grid-cols-6 gap-1">
              {cat.emojis.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectEmoji(emoji)}
                  className="h-9 w-9 text-lg flex items-center justify-center rounded-xl hover:bg-white/10 active:scale-110 transition-all cursor-pointer select-none"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
