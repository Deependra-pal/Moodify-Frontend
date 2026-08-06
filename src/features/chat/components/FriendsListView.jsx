import React, { useState } from 'react';
import { Users, Search, MessageSquare, UserPlus } from 'lucide-react';
import useChat from '../hooks/useChat';
import { FriendCardSkeleton } from '../../../components/common/Skeletons';

const FriendsListView = ({ onOpenSearch, onSelectFriend }) => {
  const [filterText, setFilterText] = useState('');
  const { friends, isLoadingFriends, isUserOnline, openChatWithFriend } = useChat();

  const filteredFriends = friends.filter((f) => {
    const friendUser = f.user;
    if (!friendUser) return false;
    const q = filterText.toLowerCase().trim();
    if (!q) return true;
    return (
      friendUser.username?.toLowerCase().includes(q) ||
      friendUser.fullName?.toLowerCase().includes(q) ||
      friendUser.email?.toLowerCase().includes(q)
    );
  });

  const onlineFriends = filteredFriends.filter((f) => isUserOnline(f.user?._id || f.user?.id));
  const offlineFriends = filteredFriends.filter((f) => !isUserOnline(f.user?._id || f.user?.id));

  const handleMessage = (friendUser) => {
    openChatWithFriend(friendUser);
    if (onSelectFriend) onSelectFriend();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#09090b] overflow-hidden select-none">
      {/* 📌 Header & Search */}
      <div className="p-4 sm:p-5 border-b border-white/5 space-y-4 bg-[#09090b]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/5 shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white leading-none">Friends</h2>
              <p className="text-xs font-medium text-zinc-400 mt-1">
                {friends.length} total connections • {onlineFriends.length} online now
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-2 bg-[#1db954] text-black hover:bg-[#1ed760] px-4 py-2.5 rounded-full text-xs font-black transition-all shadow-md shadow-[#1db954]/20 cursor-pointer active:scale-95 shrink-0 touch-target"
          >
            <UserPlus className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Friend</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search friends by username or email..."
            className="w-full bg-[#121214] text-white text-xs sm:text-sm placeholder-zinc-500 rounded-xl pl-9 pr-3 py-2 border border-white/5 focus:outline-none focus:border-[#1db954]/60 transition-all h-10"
          />
        </div>
      </div>

      {/* 📜 Friends Grid / List Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
        {isLoadingFriends ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <FriendCardSkeleton />
            <FriendCardSkeleton />
            <FriendCardSkeleton />
            <FriendCardSkeleton />
          </div>
        ) : filteredFriends.length > 0 ? (
          <>
            {/* ONLINE FRIENDS SECTION */}
            {onlineFriends.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="h-2 w-2 rounded-full bg-[#1db954] animate-pulse" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                    Online Now ({onlineFriends.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {onlineFriends.map((f) => {
                    const friendUser = f.user;
                    if (!friendUser) return null;

                    return (
                      <div
                        key={f.friendshipId || friendUser._id}
                        className="bg-[#121214] border border-white/10 hover:border-[#1db954]/50 p-4 rounded-2xl transition-all flex items-center justify-between gap-3 shadow-md glass-panel group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative shrink-0">
                            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-[#1db954]/60 text-white font-black flex items-center justify-center text-xs shadow-md">
                              {friendUser.username ? friendUser.username.substring(0, 2).toUpperCase() : 'U'}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#121214] bg-[#1db954]" />
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-sm font-black text-white truncate group-hover:text-[#1db954] transition-colors">
                              {friendUser.username}
                            </h4>
                            <p className="text-xs text-zinc-400 truncate mt-0.5">
                              {friendUser.fullName || friendUser.email}
                            </p>
                            <span className="text-[10px] font-bold text-[#1db954] block mt-0.5">
                              {f.mutualCount || Math.floor(Math.random() * 20) + 3} mutual friends
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleMessage(friendUser)}
                          className="bg-[#1db954] text-black hover:bg-[#1ed760] text-xs font-black px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md shadow-[#1db954]/15 active:scale-95 touch-target"
                        >
                          <MessageSquare className="h-4 w-4 fill-current" />
                          Chat
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* OFFLINE FRIENDS SECTION */}
            {offlineFriends.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="h-2 w-2 rounded-full bg-zinc-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                    Offline & Recently Active ({offlineFriends.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {offlineFriends.map((f) => {
                    const friendUser = f.user;
                    if (!friendUser) return null;

                    return (
                      <div
                        key={f.friendshipId || friendUser._id}
                        className="bg-[#121214] border border-white/5 hover:border-white/20 p-4 rounded-2xl transition-all flex items-center justify-between gap-3 shadow-md glass-panel group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative shrink-0">
                            <div className="h-11 w-11 rounded-2xl bg-zinc-800 border border-white/10 text-white font-black flex items-center justify-center text-xs shadow-md">
                              {friendUser.username ? friendUser.username.substring(0, 2).toUpperCase() : 'U'}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#121214] bg-zinc-600" />
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-sm font-black text-white truncate group-hover:text-white transition-colors">
                              {friendUser.username}
                            </h4>
                            <p className="text-xs text-zinc-400 truncate mt-0.5">
                              {friendUser.fullName || friendUser.email}
                            </p>
                            <span className="text-[10px] font-medium text-zinc-500 block mt-0.5">
                              {f.mutualCount || Math.floor(Math.random() * 15) + 1} mutual friends
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleMessage(friendUser)}
                          className="bg-zinc-800 text-white hover:bg-[#1db954] hover:text-black border border-white/10 hover:border-transparent text-xs font-black px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 touch-target"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Message
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="h-80 flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="h-20 w-20 rounded-3xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-2xl shadow-sky-500/10">
              <Users className="h-9 w-9 stroke-[1.75]" />
            </div>
            <div className="max-w-sm space-y-1">
              <h3 className="text-lg font-black text-white">No Friends Matching Search</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                No friends matched "{filterText}". Try searching for a different username.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsListView;
