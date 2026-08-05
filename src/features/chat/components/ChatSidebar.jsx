import React, { useState } from 'react';
import { MessageSquare, Users, UserPlus, Check, X, Search, Clock, RefreshCw, UserCheck } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'friends'
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filterText, setFilterText] = useState('');

  const { user } = useAuth();
  const {
    conversations,
    friends,
    pendingRequests,
    activeConversation,
    onlineUsers,
    selectConversation,
    openChatWithFriend,
    handleAcceptRequest,
    handleRejectRequest,
    loadConversations,
    loadFriends,
    loadPendingRequests,
    isLoadingConversations,
    isLoadingFriends
  } = useChat();

  const getOtherParticipant = (conv) => {
    if (!conv || !conv.participants || !user) return null;
    const currentUserId = user.id || user._id;
    return conv.participants.find(p => (p._id || p.id).toString() !== currentUserId.toString()) || conv.participants[0];
  };

  const isUserOnline = (userId) => {
    if (!userId || !onlineUsers) return false;
    return onlineUsers.includes(userId.toString());
  };

  const filteredConversations = conversations.filter(c => {
    const friend = getOtherParticipant(c);
    if (!friend) return true;
    return friend.username?.toLowerCase().includes(filterText.toLowerCase()) ||
           friend.fullName?.toLowerCase().includes(filterText.toLowerCase());
  });

  const filteredFriends = friends.filter(f => {
    const friendUser = f.user;
    if (!friendUser) return false;
    return friendUser.username?.toLowerCase().includes(filterText.toLowerCase()) ||
           friendUser.fullName?.toLowerCase().includes(filterText.toLowerCase());
  });

  return (
    <aside className="w-full md:w-80 h-full bg-[#09090b] border-r border-white/5 flex flex-col shrink-0 select-none">
      {/* Sidebar Top Header & Controls */}
      <div className="p-4 border-b border-white/5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#1db954]/10 border border-[#1db954]/20 flex items-center justify-center text-[#1db954]">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white leading-none">Messages</h2>
              <span className="text-[10px] font-bold text-zinc-500">{friends.length} Friends Active</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                loadConversations();
                loadFriends();
                loadPendingRequests();
              }}
              title="Refresh"
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-full transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1 bg-[#1db954] text-black hover:bg-[#1ed760] px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md shadow-[#1db954]/15 cursor-pointer active:scale-95"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Add Friend
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder={activeTab === 'chats' ? 'Filter chats...' : 'Filter friends...'}
            className="w-full bg-[#121214] text-white text-xs placeholder-zinc-500 rounded-full pl-9 pr-4 py-2 border border-white/5 focus:outline-none focus:border-[#1db954]/60 transition-all"
          />
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-[#121214] p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'chats'
                ? 'bg-[#18181b] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 text-[#1db954]" />
            Chats ({conversations.length})
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 relative cursor-pointer ${
              activeTab === 'friends'
                ? 'bg-[#18181b] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5 text-sky-400" />
            Friends ({friends.length})
            {pendingRequests.length > 0 && (
              <span className="bg-[#1db954] text-black font-extrabold text-[10px] px-1.5 py-0.5 rounded-full shadow-md animate-pulse shrink-0">
                +{pendingRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
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
                      <div className="h-10 w-10 rounded-full bg-zinc-800 border border-white/10 text-white font-bold flex items-center justify-center text-xs">
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
                        <span className="text-[10px] text-zinc-500 font-semibold shrink-0 ml-1">
                          {formatTime(conv.lastMessageAt || conv.updatedAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate leading-snug">
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
                <p className="text-xs text-zinc-500 font-medium">No active conversations found.</p>
                <button
                  onClick={() => setActiveTab('friends')}
                  className="text-xs font-bold text-[#1db954] hover:underline"
                >
                  Message a friend to start chatting
                </button>
              </div>
            )}
          </>
        )}

        {/* --- FRIENDS TAB --- */}
        {activeTab === 'friends' && (
          <div className="space-y-3 p-1">
            {/* Real-Time Pending Requests Section */}
            {pendingRequests.length > 0 && (
              <div className="bg-[#121214] border border-amber-500/30 p-3 rounded-2xl space-y-2.5 shadow-xl animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 animate-pulse" />
                    Incoming Friend Requests
                  </p>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30">
                    {pendingRequests.length} Pending
                  </span>
                </div>

                {pendingRequests.map((req) => (
                  <div
                    key={req._id}
                    className="flex flex-col gap-2 bg-[#18181b] p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-zinc-800 border border-white/10 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {req.sender?.username ? req.sender.username.substring(0, 2).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{req.sender?.username}</p>
                          <p className="text-[10px] text-zinc-400 truncate">{req.sender?.fullName || 'Sent a friend request'}</p>
                        </div>
                      </div>
                      <span className="text-[9px] text-zinc-500 font-semibold shrink-0">
                        {formatTime(req.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
                      <button
                        onClick={() => handleRejectRequest(req._id)}
                        className="px-3 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-red-500/20"
                      >
                        <X className="h-3 w-3" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleAcceptRequest(req._id)}
                        className="px-3.5 py-1 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-[#1db954]/20 active:scale-95"
                      >
                        <Check className="h-3 w-3 stroke-[3]" />
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Friends List */}
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
                        <div className="h-9 w-9 rounded-full bg-zinc-800 border border-white/10 text-white font-bold flex items-center justify-center text-xs">
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
                        setActiveTab('chats');
                      }}
                      className="bg-[#1db954] text-black hover:bg-[#1ed760] text-[11px] font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-sm shadow-[#1db954]/10 active:scale-95"
                    >
                      <MessageSquare className="h-3 w-3" />
                      Message
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-2">
                <p className="text-xs text-zinc-500">No friends added yet.</p>
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="text-xs font-bold text-[#1db954] hover:underline"
                >
                  Find users & add friends
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
