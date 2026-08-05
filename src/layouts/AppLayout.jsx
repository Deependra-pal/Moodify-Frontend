import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../features/home/components/Sidebar';
import MusicPlayer from '../features/home/components/MusicPlayer';
import { usePlayer } from '../context/PlayerContext';

/**
 * Shared layout component wrapping all authenticated dashboard screens.
 * Places the Sidebar component on the left, sets up scroll margins,
 * and maintains ample bottom scroll clearance so song cards never hide behind the player or mobile nav.
 */
const AppLayout = ({ children }) => {
  const location = useLocation();
  const scrollContainerRef = useRef(null);
  const { currentSong, isPlayerVisible } = usePlayer();

  const isPlayerActive = currentSong && isPlayerVisible;
  const isChatPage = location.pathname === '/chat';

  // Reset scroll position to top on every page navigation
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#09090b] text-white flex flex-col fixed inset-0 overscroll-none">
      {/* Top container: Sidebar + Main Scroll Viewport */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Viewport Container */}
        <div
          ref={scrollContainerRef}
          className={`flex-1 flex flex-col min-h-0 custom-scrollbar overscroll-contain ${isChatPage ? 'overflow-hidden' : 'overflow-y-auto'
            }`}
        >
          <div className={`flex flex-col w-full flex-1 min-h-0 ${isChatPage
            ? 'h-full pb-16 md:pb-0'
            : isPlayerActive
              ? 'min-h-full pb-[calc(14rem+env(safe-area-inset-bottom,0px))] md:pb-36'
              : 'min-h-full pb-[calc(7rem+env(safe-area-inset-bottom,0px))] md:pb-20'
            }`}>
            {children}
          </div>
        </div>
      </div>

      {/* Music Player Footer Deck */}
      <MusicPlayer />
    </div>
  );
};

export default AppLayout;
