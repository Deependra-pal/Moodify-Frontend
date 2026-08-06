import React, { useEffect } from 'react';
import ChatSidebar from '../components/ChatSidebar';
import ChatWindow from '../components/ChatWindow';
import useChat from '../hooks/useChat';

/**
 * Main Chat Dashboard Page.
 * Responsive dual-panel design with sidebar on left and active conversation window on right.
 */
const ChatPage = () => {
  const { selectConversation } = useChat();

  useEffect(() => {
    // Only on initial mount, if on mobile viewport, start on conversation list
    if (window.innerWidth < 768) {
      selectConversation(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-full w-full flex flex-col md:flex-row overflow-hidden bg-[#09090b] select-none flex-1 min-h-0">
      <ChatSidebar />
      <ChatWindow />
    </div>
  );
};

export default ChatPage;
