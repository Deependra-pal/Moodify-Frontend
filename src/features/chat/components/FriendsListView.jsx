import React, { useState } from 'react';
import { Users, Search, MessageSquare, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import useChat from '../hooks/useChat';
import { FriendCardSkeleton } from '../../../components/common/Skeletons';

const FriendsListView = ({ onOpenSearch, onSelectFriend }) => {
  const [filterText, setFilterText] = useState('');
  const [removedIds, setRemovedIds] = useState([]);
  const { friends, isLoadingFriends, isUserOnline, openChatWithFriend, handleRemoveFriend } = useChat();

  const filteredFriends = friends.filter((f) => {
    const friendUser = f.user;
    if (!friendUser) return false;
    if (removedIds.includes(friendUser._id) || removedIds.includes(f.friendshipId)) return false;
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

  const onUnfriendClick = async (friendUser, friendshipId) => {
    const targetId = friendUser?._id || friendshipId;
    if (!targetId) return;

    // Instant optimistic disappearance on click!
    setRemovedIds((prev) => [...prev, friendUser._id, friendshipId].filter(Boolean));

    try {
      await handleRemoveFriend(targetId);
      if (friendshipId && friendshipId !== targetId) {
        await handleRemoveFriend(friendshipId);
      }
    } catch (err) {
      console.error('Failed to unfriend:', err);
    }
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
            className="flex items-center gap-2 bg-[#1db954] text-black hover:bg-[#1ed760] px-4 py-2.5 rounded-full text-xs font-black transition-all shadow-md shadow-[#1db954]/20 cursor-pointer active:scale-95 shrink-0 touch-target min-h-[44px]"
          >
            <UserPlus className="h-4 w-4 stroke-[2.5]" />
            <span>Find Friends</span>
          </button>
        </div>

        {/* Filter Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search connections by username or name..."
            className="w-full bg-[#121214] text-white text-xs sm:text-sm placeholder-zinc-500 rounded-xl pl-9 pr-3 py-2.5 border border-white/10 focus:outline-none focus:border-[#1db954]/60 transition-all h-11"
          />
        </div>
      </div>

      {/* 📜 Friends Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar pb-24 md:pb-6">
        {isLoadingFriends ? (
          <div className="space-y-3">
            <FriendCardSkeleton />
            <FriendCardSkeleton />
            <FriendCardSkeleton />
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="text-center py-16 space-y-3 text-zinc-400">
            <div className="h-16 w-16 rounded-3xl bg-[#121214] border border-white/10 flex items-center justify-center text-zinc-500 mx-auto shadow-xl">
              <Users className="h-8 w-8 text-zinc-600" />
            </div>
            <h3 className="text-base font-black text-white">No Friends Found</h3>
            <p className="text-xs max-w-xs mx-auto text-zinc-500">
              {filterText ? `No connection matching "${filterText}"` : 'Your friends list is currently empty. Click "Find Friends" above to connect!'}
            </p>
          </div>
        ) : (
          <>
            {/* ONLINE FRIENDS SECTION */}
            {onlineFriends.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="h-2 w-2 rounded-full bg-[#1db954] animate-pulse" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#1db954]">
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
                        className="bg-[#121214] border border-white/10 hover:border-[#1db954]/40 p-4 rounded-2xl transition-all flex items-center justify-between gap-3 shadow-md glass-panel group animate-in fade-in duration-200"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative shrink-0">
                            <div className="h-11 w-11 rounded-2xl bg-zinc-800 border border-[#1db954]/60 text-white font-black flex items-center justify-center text-xs shadow-md">
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
                            <span className="text-[10px] font-medium text-emerald-400/80 block mt-0.5">
                              Active now
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMessage(friendUser)}
                            className="bg-[#1db954] text-black hover:bg-[#1ed760] text-xs sm:text-sm font-extrabold px-3.5 py-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md shadow-[#1db954]/15 active:scale-95 touch-target min-h-[44px]"
                          >
                            <MessageSquare className="h-4 w-4 fill-current" />
                            Chat
                          </button>

                          <button
                            type="button"
                            onClick={() => onUnfriendClick(friendUser, f.friendshipId)}
                            className="p-3 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer touch-target min-h-[44px] border border-transparent hover:border-rose-500/20 active:scale-95"
                            title="Unfriend"
                          >
                            <UserMinus className="h-4 w-4 text-rose-400" />
                          </button>
                        </div>
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
                        className="bg-[#121214] border border-white/5 hover:border-white/20 p-4 rounded-2xl transition-all flex items-center justify-between gap-3 shadow-md glass-panel group animate-in fade-in duration-200"
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
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMessage(friendUser)}
                            className="bg-zinc-800 text-white hover:bg-[#1db954] hover:text-black border border-white/10 hover:border-transparent text-xs sm:text-sm font-extrabold px-3.5 py-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 touch-target min-h-[44px]"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Message
                          </button>

                          <button
                            type="button"
                            onClick={() => onUnfriendClick(friendUser, f.friendshipId)}
                            className="p-3 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer touch-target min-h-[44px] border border-transparent hover:border-rose-500/20 active:scale-95"
                            title="Unfriend"
                          >
                            <UserMinus className="h-4 w-4 text-rose-400" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FriendsListView;
