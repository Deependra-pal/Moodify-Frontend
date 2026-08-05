import React, { useState } from 'react';
import { MessageSquare, Users, UserPlus, Check, X, Search, Clock, Inbox, Sparkles } from 'lucide-react';
import useChat from '../hooks/useChat';
import useAuth from '../../auth/hooks/useAuth';
import UserSearchModal from './UserSearchModal';

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
  <div className="p-3 rounded-xl bg-[#121214] border border-white/5 animate-pulse flex items-center gap-3">
    <div className="h-10 w-10 rounded-full bg-zinc-800/80 shrink-0" />
    <div className="flex-1 space-y-2 min-w-0">
      <div className="h-3.5 bg-zinc-800/80 rounded w-2/3" />
      <div className="h-2.5 bg-zinc-800/60 rounded w-full" />
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
    friends,
    pendingRequests,
    activeConversation,
    unreadCounts,
    selectConversation,
    openChatWithFriend,
    handleAcceptRequest,
    handleRejectRequest,
    isLoadingConversations,
    isLoadingFriends,
    isUserOnline
  } = useChat();

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setFilterText('');
  };

  const getOtherParticipant = (conv) => {
    if (!conv || !conv.participants || !user) return null;
    const currentUserId = user.id || user._id;
    return conv.participants.find(p => (p._id || p.id).toString() !== currentUserId.toString()) || conv.participants[0];
  };

  // Instant client-side search filtering across existing conversations ONLY
  const filteredConversations = conversations.filter(c => {
    const friend = getOtherParticipant(c);
    if (!friend) return false;
    const searchLower = filterText.toLowerCase().trim();
    if (!searchLower) return true;
    return (
      friend.username?.toLowerCase().includes(searchLower) ||
      friend.fullName?.toLowerCase().includes(searchLower) ||
      friend.email?.toLowerCase().includes(searchLower) ||
      c.lastMessage?.toLowerCase().includes(searchLower)
    );
  });

  // Instant client-side search filtering across friends list ONLY
  const filteredFriends = friends.filter(f => {
    const friendUser = f.user;
    if (!friendUser) return false;
    const searchLower = filterText.toLowerCase().trim();
    if (!searchLower) return true;
    return (
      friendUser.username?.toLowerCase().includes(searchLower) ||
      friendUser.fullName?.toLowerCase().includes(searchLower) ||
      friendUser.email?.toLowerCase().includes(searchLower)
    );
  });

  // Instant client-side search filtering across pending friend requests ONLY
  const filteredRequests = pendingRequests.filter(req => {
    const sender = req.sender;
    if (!sender) return false;
    const searchLower = filterText.toLowerCase().trim();
    if (!searchLower) return true;
    return (
      sender.username?.toLowerCase().includes(searchLower) ||
      sender.fullName?.toLowerCase().includes(searchLower) ||
      sender.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <aside className={`w-full md:w-80 h-full bg-[#09090b] border-r border-white/5 flex-col shrink-0 select-none ${
      activeConversation ? 'hidden md:flex' : 'flex'
    }`}>
      {/* Sidebar Top Header & Controls - Aligned with HomePage Top Padding */}
      <div className="px-4 sm:px-5 py-4 sm:py-5 border-b border-white/5 space-y-3 bg-[#09090b]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-br from-[#1db954]/20 to-[#1ed760]/10 border border-[#1db954]/20 flex items-center justify-center text-[#1db954] shadow-sm">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white leading-none">Messages</h2>
              <span className="text-[10px] font-bold text-zinc-500 mt-0.5 block">{friends.length} Total Friends</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 bg-[#1db954] text-black hover:bg-[#1ed760] px-3.5 py-1.5 rounded-full text-xs font-black transition-all shadow-md shadow-[#1db954]/20 cursor-pointer active:scale-95"
            >
              <UserPlus className="h-3.5 w-3.5 stroke-[2.5]" />
              Add Friend
            </button>
          </div>
        </div>

        {/* Dynamic Context-Aware Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder={
              activeTab === 'chats'
                ? 'Search conversations...'
                : activeTab === 'friends'
                ? 'Search friends...'
                : 'Search friend requests...'
            }
            className="w-full bg-[#121214] text-white text-[11px] placeholder-zinc-500 rounded-full pl-8.5 pr-3 py-1.5 border border-white/5 focus:outline-none focus:border-[#1db954]/60 focus:ring-1 focus:ring-[#1db954]/30 transition-all h-8"
          />
        </div>

        {/* 3 Tab Navigation Buttons - Clean Outline-Free Switching */}
        <div className="flex bg-[#121214] p-1 rounded-xl border border-white/5 text-[11px]">
          <button
            type="button"
            onClick={() => handleTabChange('chats')}
            className={`flex-1 py-1.5 font-extrabold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer outline-none focus:outline-none focus:ring-0 focus-visible:outline-none select-none ${
              activeTab === 'chats'
                ? 'bg-[#18181b] text-white shadow-sm border border-white/10'
                : 'text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <MessageSquare className="h-3 w-3 text-[#1db954]" />
            Chats
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('friends')}
            className={`flex-1 py-1.5 font-extrabold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer outline-none focus:outline-none focus:ring-0 focus-visible:outline-none select-none ${
              activeTab === 'friends'
                ? 'bg-[#18181b] text-white shadow-sm border border-white/10'
                : 'text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <Users className="h-3 w-3 text-sky-400" />
            Friends
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('requests')}
            className={`flex-1 py-1.5 font-extrabold rounded-lg transition-all flex items-center justify-center gap-1 relative cursor-pointer outline-none focus:outline-none focus:ring-0 focus-visible:outline-none select-none ${
              activeTab === 'requests'
                ? 'bg-[#18181b] text-white shadow-sm border border-white/10'
                : 'text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <Inbox className="h-3 w-3 text-amber-400" />
            Requests
            {pendingRequests.length > 0 && (
              <span className="bg-[#1db954] text-black font-black text-[9px] px-1.5 py-0.2 rounded-full shadow-md animate-pulse shrink-0">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Tab Content Viewport */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
        {/* --- CHATS TAB --- */}
        {activeTab === 'chats' && (
          <>
            {isLoadingConversations ? (
              <div className="space-y-2 p-1">
                <SkeletonItem />
                <SkeletonItem />
                <SkeletonItem />
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const friend = getOtherParticipant(conv);
                const isActive = activeConversation && activeConversation._id === conv._id;
                if (!friend) return null;

                const friendId = friend._id || friend.id;
                const online = isUserOnline(friendId);
                const unread = unreadCounts[conv._id] !== undefined ? unreadCounts[conv._id] : (conv.unreadCount || 0);

                return (
                  <button
                    key={conv._id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 cursor-pointer ${
                      isActive
                        ? 'bg-[#18181b] text-white border-l-2 border-[#1db954] shadow-md shadow-[#1db954]/5'
                        : 'hover:bg-[#121214] text-zinc-300 border border-transparent'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className={`h-10 w-10 rounded-full bg-zinc-800 border text-white font-bold flex items-center justify-center text-xs ${
                        online ? 'border-[#1db954]/50' : 'border-white/10'
                      }`}>
                        {friend.username ? friend.username.substring(0, 2).toUpperCase() : 'U'}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#09090b] ${
                          online ? 'bg-[#1db954] shadow-sm shadow-[#1db954]' : 'bg-zinc-600'
                        }`}
                        title={online ? 'Online' : 'Offline'}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-bold truncate text-white">{friend.username}</p>
                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          <span className="text-[10px] text-zinc-500 font-semibold">
                            {formatTime(conv.lastMessageAt || conv.updatedAt)}
                          </span>
                          {/* Unread Messages Badge */}
                          {unread > 0 && (
                            <span className="bg-[#1db954] text-black font-black text-[10px] px-1.5 py-0.2 rounded-full shadow-md shadow-[#1db954]/20 animate-pulse">
                              {unread}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className={`text-[11px] truncate leading-snug ${unread > 0 ? 'text-white font-extrabold' : 'text-zinc-400'}`}>
                        {conv.lastMessage || <span className="italic text-zinc-600">No messages yet</span>}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-[#121214] border border-white/5 flex items-center justify-center mx-auto text-zinc-600">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <p className="text-xs text-zinc-400 font-bold">No conversations found.</p>
                <button
                  onClick={() => handleTabChange('friends')}
                  className="text-xs font-bold text-[#1db954] hover:underline cursor-pointer"
                >
                  Message a friend to start chatting
                </button>
              </div>
            )}
          </>
        )}

        {/* --- FRIENDS TAB --- */}
        {activeTab === 'friends' && (
          <div className="space-y-2 p-1">
            {isLoadingFriends ? (
              <div className="space-y-2">
                <SkeletonItem />
                <SkeletonItem />
              </div>
            ) : filteredFriends.length > 0 ? (
              filteredFriends.map((f) => {
                const friendUser = f.user;
                if (!friendUser) return null;

                const friendId = friendUser._id || friendUser.id;
                const online = isUserOnline(friendId);

                return (
                  <div
                    key={f.friendshipId || friendUser._id}
                    className="flex items-center justify-between p-2.5 bg-[#121214] border border-white/5 rounded-xl hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <div className={`h-9 w-9 rounded-full bg-zinc-800 border text-white font-bold flex items-center justify-center text-xs ${
                          online ? 'border-[#1db954]/50' : 'border-white/10'
                        }`}>
                          {friendUser.username ? friendUser.username.substring(0, 2).toUpperCase() : 'U'}
                        </div>
                        <span
                          className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-[#09090b] ${
                            online ? 'bg-[#1db954]' : 'bg-zinc-600'
                          }`}
                          title={online ? 'Online' : 'Offline'}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{friendUser.username}</p>
                        <p className="text-[10px] text-zinc-500 truncate">{friendUser.fullName || friendUser.email}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        openChatWithFriend(friendUser);
                        handleTabChange('chats');
                      }}
                      className="bg-[#1db954] text-black hover:bg-[#1ed760] text-[11px] font-extrabold px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-sm shadow-[#1db954]/10 active:scale-95"
                    >
                      <MessageSquare className="h-3 w-3 fill-current" />
                      Message
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-2">
                <p className="text-xs text-zinc-400 font-bold">No friends found.</p>
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="text-xs font-bold text-[#1db954] hover:underline cursor-pointer"
                >
                  Find users & add friends
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- DEDICATED INCOMING REQUESTS TAB --- */}
        {activeTab === 'requests' && (
          <div className="space-y-3 p-1">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req) => (
                <div
                  key={req._id}
                  className="flex flex-col gap-3 bg-[#121214] border border-amber-500/30 p-3.5 rounded-2xl shadow-xl hover:border-amber-500/50 transition-all animate-in fade-in duration-200"
                >
                  <div className="flex items-center justify-between gap-3 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-zinc-800 border border-white/10 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-md">
                        {req.sender?.username ? req.sender.username.substring(0, 2).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-white truncate">{req.sender?.username}</p>
                        <p className="text-[11px] text-zinc-400 truncate">{req.sender?.fullName || req.sender?.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-amber-400/80 font-bold shrink-0 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {formatTime(req.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => handleRejectRequest(req._id)}
                      className="px-3.5 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-red-500/20"
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleAcceptRequest(req._id)}
                      className="px-4 py-1.5 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-[#1db954]/25 active:scale-95"
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                      Accept Friend
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-[#121214] border border-white/5 flex items-center justify-center mx-auto text-amber-400">
                  <Inbox className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-white">No matching requests found.</h4>
                <p className="text-xs text-zinc-500">Incoming friend requests will appear here in real-time.</p>
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="text-xs font-bold text-[#1db954] hover:underline cursor-pointer"
                >
                  Send friend requests to users
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <UserSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </aside>
  );
};

export default ChatSidebar;
