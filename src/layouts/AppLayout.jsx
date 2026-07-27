import React from 'react';
import Sidebar from '../features/home/components/Sidebar';
import MusicPlayer from '../features/home/components/MusicPlayer';

/**
 * Shared layout component wrapping all authenticated dashboard screens.
 * Places the Sidebar component on the left, sets up scroll margins,
 * and handles main viewport panels.
 */
const AppLayout = ({ children }) => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#121212] text-white flex flex-col md:flex-row">
      {/* Fixed Sidebar panel */}
      <Sidebar />

      {/* Main viewport panels */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto pb-[144px] md:pb-[96px]">
        {children}
      </div>

      {/* Music Player Footer Deck */}
      <MusicPlayer />
    </div>
  );
};

export default AppLayout;

