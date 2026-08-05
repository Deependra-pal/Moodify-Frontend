import React from 'react';
import ChatSidebar from '../components/ChatSidebar';
import ChatWindow from '../components/ChatWindow';

/**
 * Main Chat Dashboard Page.
 * Responsive dual-panel design with sidebar on left and active conversation window on right.
 */
const ChatPage = () => {
  return (
    <div className="h-full w-full flex flex-col md:flex-row overflow-hidden bg-[#121212]">
      <ChatSidebar />
      <ChatWindow />
    </div>
  );
};

export default ChatPage;
