import React, { useEffect } from 'react';
import ChatSidebar from '../components/ChatSidebar';
import ChatWindow from '../components/ChatWindow';
import useChat from '../hooks/useChat';

/**
 * Main Chat Dashboard Page.
 * Responsive dual-panel design with sidebar on left and active conversation window on right.
 * On mobile screen widths, defaults to the conversation list view first.
 */
const ChatPage = () => {
  const { selectConversation } = useChat();

  useEffect(() => {
    // On mobile viewports, start on the conversation list screen by default
    if (window.innerWidth < 768) {
      selectConversation(null);
    }
  }, [selectConversation]);

  return (
    <div className="h-full w-full flex flex-col md:flex-row overflow-hidden bg-[#09090b] select-none flex-1 min-h-0">
      <ChatSidebar />
      <ChatWindow />
    </div>
  );
};

export default ChatPage;
