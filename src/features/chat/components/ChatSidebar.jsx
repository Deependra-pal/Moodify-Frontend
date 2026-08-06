import React, { useState } from 'react';
import { MessageSquare, Users, Inbox, UserPlus, Search } from 'lucide-react';
import useChat from '../hooks/useChat';
import useAuth from '../../auth/hooks/useAuth';
import UserSearchModal from './UserSearchModal';
import FriendsListView from './FriendsListView';
import FriendRequestsView from './FriendRequestsView';
import { ConversationItemSkeleton } from '../../../components/common/Skeletons';

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filterText, setFilterText] = useState('');

  const { user } = useAuth();
  const {
    conversations,
    friends = [],
    pendingRequests,
    activeConversation,
    unreadCounts,
    totalUnreadCount,
    selectConversation,
    isLoadingConversations,
    typingUsers,
    isUserOnline,
    activeTab,
    setActiveTab
  } = useChat();

  const onlineFriendsCount = friends.filter((f) => isUserOnline(f.user?._id || f.user?.id)).length;

  const getOtherParticipant = (conv) => {
    if (!conv || !conv.participants || !Array.isArray(conv.participants)) return null;
    const currentUserId = user ? (user._id || user.id || '').toString() : '';
    const found = conv.participants.find((p) => {
      if (!p) return false;
      const pId = typeof p === 'object' ? (p._id || p.id || '').toString() : p.toString();
      return pId && pId !== currentUserId;
    });
    const result = found || conv.participants[0] || null;
    return typeof result === 'object' ? result : { _id: result, username: 'User', email: '' };
  };

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
      <div className="px-5 sm:px-6 py-5 border-b border-white/5 space-y-4.5 bg-[#0c0c0e]">
        {/* LOGO TITLE */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#1db954]/20 via-[#1db954]/10 to-transparent border border-[#1db954]/30 flex items-center justify-center text-[#1db954] shadow-lg shadow-[#1db954]/10 shrink-0">
            <MessageSquare className="h-5.5 w-5.5" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white leading-none">Chat Hub</h2>
            <p className={`text-xs font-semibold mt-1 flex items-center gap-1.5 ${
              onlineFriendsCount > 0 ? 'text-[#1db954]' : 'text-zinc-400'
            }`}>
              {onlineFriendsCount > 0 && (
                <span className="h-2 w-2 rounded-full bg-[#1db954] animate-pulse" />
              )}
              {onlineFriendsCount} friend{onlineFriendsCount !== 1 ? 's' : ''} online
            </p>
          </div>
        </div>

        {/* 3-TAB NAVIGATION MODE BAR */}
        <div className="flex bg-[#141416] p-1.5 rounded-2xl border border-white/10 text-xs font-bold gap-1.5 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setActiveTab('chats');
              setFilterText('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer touch-target select-none min-h-[44px] text-xs font-extrabold ${
              activeTab === 'chats'
                ? 'bg-[#222226] text-white shadow-md border border-white/10'
                : 'text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <MessageSquare className="h-4 w-4 text-[#1db954]" />
            <span>Chats</span>
            {totalUnreadCount > 0 && (
              <span className="bg-[#1db954] text-black font-black text-[10px] px-2 py-0.5 rounded-full shadow-sm">
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
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer touch-target select-none min-h-[44px] text-xs font-extrabold ${
              activeTab === 'friends'
                ? 'bg-[#222226] text-white shadow-md border border-white/10'
                : 'text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <Users className="h-4 w-4 text-sky-400" />
            <span>Friends</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('requests');
              setFilterText('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer touch-target select-none min-h-[44px] text-xs font-extrabold ${
              activeTab === 'requests'
                ? 'bg-[#222226] text-white shadow-md border border-white/10'
                : 'text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <Inbox className="h-4 w-4 text-amber-400" />
            <span>Requests</span>
            {pendingRequests.length > 0 && (
              <span className="bg-amber-400 text-black font-black text-[10px] px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* SEARCH BAR (Only visible on Chats tab) */}
        {activeTab === 'chats' && (
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search chats by name or message..."
              className="w-full bg-[#141416] text-white text-xs sm:text-sm placeholder-zinc-500 rounded-2xl pl-10 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-[#1db954]/60 transition-all h-11"
            />
          </div>
        )}
      </div>

      {/* 📜 MAIN TAB VIEWPORT CONTENT */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pb-24 md:pb-4">
        {/* --- CHATS TAB VIEW --- */}
        {activeTab === 'chats' && (
          <div className="p-4 space-y-3">
            {isLoadingConversations ? (
              <div className="space-y-3 p-1">
                <ConversationItemSkeleton />
                <ConversationItemSkeleton />
                <ConversationItemSkeleton />
                <ConversationItemSkeleton />
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
                    className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between gap-4 cursor-pointer select-none touch-target shadow-md ${
                      isActive
                        ? 'bg-[#122216] text-white border border-[#1db954]/60 shadow-lg shadow-[#1db954]/15'
                        : 'bg-[#141416] hover:bg-[#18181c] text-zinc-300 border border-white/10 hover:border-white/20'
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
                          className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#141416] ${
                            online ? 'bg-[#1db954]' : 'bg-zinc-600'
                          }`}
                        />
                      </div>

                      {/* Content details */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm sm:text-base font-black truncate text-white leading-tight">
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
          <FriendRequestsView />
        )}
      </div>

      {/* User Search Modal */}
      <UserSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </aside>
  );
};

export default ChatSidebar;
