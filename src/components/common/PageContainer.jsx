import React from 'react';

/**
 * Standardized Reusable Page Container for Moodify.
 * Enforces unified max-width, horizontal padding (px-4 sm:px-6 md:px-8),
 * consistent vertical rhythm, and smooth scrolling without double padding.
 */
export const PageContainer = ({
  children,
  header,
  className = '',
  maxWidthClass = 'max-w-6xl',
  noScroll = false
}) => {
  return (
    <div className="flex-1 w-full bg-[#09090b] text-white flex flex-col font-sans h-full overflow-hidden select-none">
      {header && <div className="shrink-0">{header}</div>}

      <main
        className={`flex-1 w-full ${maxWidthClass} mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10 pb-28 md:pb-12 space-y-6 sm:space-y-8 md:space-y-10 ${
          noScroll ? 'overflow-hidden flex flex-col' : 'overflow-y-auto custom-scrollbar'
        } ${className}`}
      >
        {children}
      </main>
    </div>
  );
};

/**
 * Compact Standardized Hero Banner for Pages (Favorites, History, Profile, etc.).
 * Reduces wasted vertical height while preserving Spotify-authentic aesthetic.
 */
export const PageHeader = ({
  title,
  subtitle,
  badge,
  icon: Icon,
  actions,
  themeColor = 'green',
  gradient
}) => {
  const isRed = themeColor === 'red';
  const isBlue = themeColor === 'blue';

  const defaultGradient = isRed
    ? 'from-red-950/60 via-[#181014] to-[#09090b]'
    : isBlue
      ? 'from-sky-950/60 via-[#101a24] to-[#09090b]'
      : 'from-[#1a3d24] via-[#102417] to-[#09090b]';

  const iconStyle = isRed
    ? 'bg-red-500/10 border border-red-500/20 text-rose-500'
    : isBlue
      ? 'bg-sky-500/10 border border-sky-500/20 text-sky-400'
      : 'bg-[#1db954]/10 border border-[#1db954]/20 text-[#1db954]';

  const badgeStyle = isRed
    ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
    : isBlue
      ? 'text-sky-400 bg-sky-500/10 border border-sky-500/20'
      : 'text-[#1db954] bg-[#1db954]/10 border border-[#1db954]/20';

  return (
    <header className={`bg-gradient-to-b ${gradient || defaultGradient} px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] border-b border-white/5 relative overflow-hidden shadow-lg`}>
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left min-w-0 w-full sm:w-auto">
          {Icon && (
            <div className={`h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center shadow-xl shrink-0 ${iconStyle}`}>
              <Icon className={`h-7 w-7 sm:h-8 sm:w-8 ${isRed ? 'fill-current' : ''}`} />
            </div>
          )}
          <div className="space-y-1 min-w-0 flex-1">
            {badge && (
              <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full inline-block ${badgeStyle}`}>
                {badge}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white truncate leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm font-semibold text-zinc-400 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && <div className="shrink-0 flex items-center gap-2 self-center sm:self-end">{actions}</div>}
      </div>
    </header>
  );
};

export default PageContainer;
