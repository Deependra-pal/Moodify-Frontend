import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../features/home/components/Sidebar';
import MusicPlayer from '../features/home/components/MusicPlayer';

/**
 * Shared layout component wrapping all authenticated dashboard screens.
 * Places the Sidebar component on the left, sets up scroll margins,
 * and handles main viewport panels.
 */
const AppLayout = ({ children }) => {
  const location = useLocation();
  const scrollContainerRef = useRef(null);

  // Reset scroll position to top on every page navigation
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#121212] text-white flex flex-col md:flex-row">
      {/* Fixed Sidebar panel */}
      <Sidebar />

      {/* Main viewport panels */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 flex flex-col h-full overflow-y-auto pb-[144px] md:pb-[96px]"
      >
        {children}
      </div>

      {/* Music Player Footer Deck */}
      <MusicPlayer />
    </div>
  );
};

export default AppLayout;

