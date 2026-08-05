import React from 'react';
import ChatSidebar from '../components/ChatSidebar';
import ChatWindow from '../components/ChatWindow';

/**
 * Main Chat Dashboard Page.
 * Responsive dual-panel design with sidebar on left and active conversation window on right.
 * Uses dynamic viewport height (100dvh) for mobile browser keyboard & bar compliance.
 */
const ChatPage = () => {
  return (
    <div className="h-[calc(100vh-4rem)] h-[100dvh] w-full flex flex-col md:flex-row overflow-hidden bg-[#09090b] select-none">
      <ChatSidebar />
      <ChatWindow />
    </div>
  );
};

export default ChatPage;
