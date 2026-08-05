import React from 'react';

/**
 * Premium Moodify Brand Logo Component.
 * Renders the vibrant gradient logo mark with dynamic soundwave lines and sleek brand typography.
 */
const Logo = ({ size = 'md', showSubtitle = false, className = '' }) => {
  const sizeClasses = {
    sm: {
      box: 'h-8 w-8 rounded-lg',
      icon: 'h-4 w-4',
      title: 'text-lg',
      sub: 'text-[9px]'
    },
    md: {
      box: 'h-10 w-10 rounded-xl',
      icon: 'h-5 w-5',
      title: 'text-xl',
      sub: 'text-[10px]'
    },
    lg: {
      box: 'h-14 w-14 rounded-2xl',
      icon: 'h-7 w-7',
      title: 'text-2xl sm:text-3xl',
      sub: 'text-xs'
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Icon Badge */}
      <div className={`flex ${currentSize.box} items-center justify-center bg-gradient-to-tr from-[#1db954] via-[#1ed760] to-[#00f2fe] shadow-lg shadow-[#1db954]/25 relative overflow-hidden group shrink-0`}>
        {/* Subtle interior glow */}
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        {/* Soundwave bars icon */}
        <svg
          className={`${currentSize.icon} text-black fill-current transform group-hover:scale-110 transition-transform duration-200`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18V6l10-2v12" />
          <circle cx="6" cy="18" r="3" fill="currentColor" />
          <circle cx="16" cy="16" r="3" fill="currentColor" />
          <path d="M2 10s2-2 4-2 4 2 4 2" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className={`${currentSize.title} font-black tracking-tight text-white leading-none font-sans`}>
            Moodify
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#1db954] animate-pulse" />
        </div>
        {showSubtitle && (
          <span className={`${currentSize.sub} font-bold text-zinc-400 uppercase tracking-widest mt-0.5`}>
            SaaS Music & Chat
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;
