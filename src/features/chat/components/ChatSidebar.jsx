import React, { useState } from 'react';
import { MessageSquare, Users, Inbox, UserPlus, Search, Clock, Sparkles } from 'lucide-react';
import useChat from '../hooks/useChat';
import useAuth from '../../auth/hooks/useAuth';
import UserSearchModal from './UserSearchModal';
import FriendsListView from './FriendsListView';
import FriendRequestsView from './FriendRequestsView';

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const SkeletonItem = () => (
  <div className="p-4 rounded-2xl bg-[#121214] border border-white/5 animate-pulse flex items-center gap-3.5">
    <div className="h-12 w-12 rounded-2xl bg-zinc-800/80 shrink-0" />
    <div className="flex-1 space-y-2.5 min-w-0">
      <div className="h-4 bg-zinc-800/80 rounded-md w-2/3" />
      <div className="h-3 bg-zinc-800/60 rounded-md w-full" />
    </div>
  </div>
);

const ChatSidebar = () => {
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'friends' | 'requests'
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filterText, setFilterText] = useState('');

  const { user } = useAuth();
  const {
    conversations,
    pendingRequests,
    activeConversation,
    unreadCounts,
    totalUnreadCount,
    selectConversation,
    isLoadingConversations,
    typingUsers,
    isUserOnline
  } = useChat();

  const getOtherParticipant = (conv) => {
    if (!conv || !conv.participants || !user) return null;
    const currentUserId = user.id || user._id;
    return (
      conv.participants.find((p) => (p._id || p.id).toString() !== currentUserId.toString()) ||
      conv.participants[0]
    );
  };

  // Instant client-side search filtering across existing conversations
  const filteredConversations = conversations.filter((c) => {
    const friend = getOtherParticipant(c);
    if (!friend) return false;
    const q = filterText.toLowerCase().trim();
    if (!q) return true;
    return (
      friend.username?.toLowerCase().includes(q) ||
      friend.fullName?.toLowerCase().includes(q) ||
      friend.email?.toLowerCase().includes(q) ||
      c.lastMessage?.toLowerCase().includes(q)
    );
  });

  return (
    <aside
      className={`w-full md:w-96 lg:w-[26rem] h-full bg-[#09090b] border-r border-white/5 flex-col shrink-0 select-none ${
        activeConversation ? 'hidden md:flex' : 'flex'
      }`}
    >
      {/* 📌 SIDEBAR HEADER & NAVIGATION MODE SELECTOR */}
      <div className="px-4 sm:px-5 py-4 border-b border-white/5 space-y-3.5 bg-[#09090b]">
        {/* SECTION 1: LOGO/TITLE & ADD FRIEND ACTION */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#1db954]/20 via-[#1db954]/10 to-transparent border border-[#1db954]/30 flex items-center justify-center text-[#1db954] shadow-md shadow-[#1db954]/10 shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white leading-none">Chat Hub</h2>
              <p className="text-[11px] font-semibold text-zinc-400 mt-1">
                {conversations.length} conversations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 bg-[#1db954] text-black hover:bg-[#1ed760] px-3.5 py-2 rounded-full text-xs font-black transition-all shadow-md shadow-[#1db954]/20 cursor-pointer active:scale-95 shrink-0 touch-target"
          >
            <UserPlus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Friend</span>
          </button>
        </div>

        {/* SECTION 2: 3-TAB NAVIGATION MODE BAR */}
        <div className="flex bg-[#121214] p-1 rounded-2xl border border-white/5 text-xs font-bold gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('chats');
              setFilterText('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-target select-none ${
              activeTab === 'chats'
                ? 'bg-[#18181b] text-white shadow-sm border border-white/10'
                : 'text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <MessageSquare className="h-4 w-4 text-[#1db954]" />
            Chats
            {totalUnreadCount > 0 && (
              <span className="bg-[#1db954] text-black font-black text-[10px] px-1.5 py-0.2 rounded-full">
                {totalUnreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('friends');
              setFilterText('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-target select-none ${
              activeTab === 'friends'
                ? 'bg-[#18181b] text-white shadow-sm border border-white/10'
                : 'text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <Users className="h-4 w-4 text-sky-400" />
            Friends
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('requests');
              setFilterText('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-target select-none ${
              activeTab === 'requests'
                ? 'bg-[#18181b] text-white shadow-sm border border-white/10'
                : 'text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <Inbox className="h-4 w-4 text-amber-400" />
            Requests
            {pendingRequests.length > 0 && (
              <span className="bg-amber-400 text-black font-black text-[10px] px-1.5 py-0.2 rounded-full animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* SECTION 3: SEARCH BAR (Only visible on Chats tab) */}
        {activeTab === 'chats' && (
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search chats by name or message..."
              className="w-full bg-[#121214] text-white text-xs sm:text-sm placeholder-zinc-500 rounded-xl pl-9 pr-3 py-2 border border-white/5 focus:outline-none focus:border-[#1db954]/60 transition-all h-10"
            />
          </div>
        )}
      </div>

      {/* 📜 MAIN TAB VIEWPORT CONTENT */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        {/* --- CHATS TAB VIEW --- */}
        {activeTab === 'chats' && (
          <div className="p-3 space-y-2">
            {isLoadingConversations ? (
              <div className="space-y-2.5 p-1">
                <SkeletonItem />
                <SkeletonItem />
                <SkeletonItem />
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const friend = getOtherParticipant(conv);
                if (!friend) return null;

                const isActive = activeConversation && activeConversation._id === conv._id;
                const friendId = friend._id || friend.id;
                const online = isUserOnline(friendId);
                const unread =
                  unreadCounts[conv._id] !== undefined
                    ? unreadCounts[conv._id]
                    : conv.unreadCount || 0;
                const isTyping = typingUsers && typingUsers[conv._id];

                return (
                  <button
                    key={conv._id}
                    type="button"
                    onClick={() => selectConversation(conv)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl transition-all flex items-center justify-between gap-3.5 cursor-pointer select-none touch-target ${
                      isActive
                        ? 'bg-[#18181b] text-white border border-[#1db954]/60 shadow-lg shadow-[#1db954]/10'
                        : 'bg-[#121214]/80 hover:bg-[#18181b] text-zinc-300 border border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Avatar with status ring */}
                      <div className="relative shrink-0">
                        <div
                          className={`h-12 w-12 rounded-2xl bg-zinc-800 border text-white font-black flex items-center justify-center text-sm shadow-md ${
                            online ? 'border-[#1db954]/60' : 'border-white/10'
                          }`}
                        >
                          {friend.username ? friend.username.substring(0, 2).toUpperCase() : 'U'}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#121214] ${
                            online ? 'bg-[#1db954]' : 'bg-zinc-600'
                          }`}
                        />
                      </div>

                      {/* Content details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-black truncate text-white leading-tight">
                            {friend.username}
                          </h4>
                          <span className="text-[11px] text-zinc-400 font-semibold shrink-0 ml-2">
                            {formatTime(conv.lastMessageAt || conv.updatedAt)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          {isTyping ? (
                            <p className="text-xs font-bold text-[#1db954] flex items-center gap-1 animate-pulse truncate">
                              <span>typing...</span>
                            </p>
                          ) : (
                            <p
                              className={`text-xs truncate leading-snug ${
                                unread > 0 ? 'text-white font-extrabold' : 'text-zinc-400 font-medium'
                              }`}
                            >
                              {conv.lastMessage || (
                                <span className="italic text-zinc-500">No messages yet</span>
                              )}
                            </p>
                          )}

                          {unread > 0 && (
                            <span className="bg-[#1db954] text-black font-black text-[11px] px-2 py-0.5 rounded-full shadow-md shadow-[#1db954]/20 animate-pulse shrink-0">
                              {unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              /* Empty state */
              <div className="h-80 flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="h-16 w-16 rounded-3xl bg-[#121214] border border-white/5 flex items-center justify-center text-zinc-600">
                  <MessageSquare className="h-8 w-8 stroke-[1.75]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-white">No Conversations Found</h4>
                  <p className="text-xs text-zinc-400">
                    {filterText ? `No chat matches "${filterText}".` : 'Start a chat with one of your friends.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('friends')}
                  className="text-xs font-bold text-[#1db954] hover:underline cursor-pointer pt-1"
                >
                  Go to Friends List →
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- FRIENDS TAB VIEW --- */}
        {activeTab === 'friends' && (
          <FriendsListView
            onOpenSearch={() => setIsSearchOpen(true)}
            onSelectFriend={() => setActiveTab('chats')}
          />
        )}

        {/* --- REQUESTS TAB VIEW --- */}
        {activeTab === 'requests' && (
          <FriendRequestsView onOpenSearch={() => setIsSearchOpen(false)} />
        )}
      </div>

      {/* User Search Modal */}
      <UserSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </aside>
  );
};

export default ChatSidebar;
