import React, { useState } from 'react';
import { Search, UserPlus, X, Loader2, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useLazySearchUsersQuery } from '../api/chatApi';
import useChat from '../hooks/useChat';
import { mockSearchUsers } from '../data/mockChatData';

const UserSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(mockSearchUsers);
  const [triggerSearch, { isLoading: isSearching }] = useLazySearchUsersQuery();
  const [sendingId, setSendingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState({});
  const { handleSendFriendRequest } = useChat();

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setResults(mockSearchUsers);
      return;
    }

    try {
      const res = await triggerSearch(query.trim()).unwrap();
      if (res.success && res.data?.users && res.data.users.length > 0) {
        setResults(res.data.users);
      } else {
        const q = query.toLowerCase().trim();
        const filtered = mockSearchUsers.filter(u =>
          u.username.toLowerCase().includes(q) ||
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
        );
        setResults(filtered);
      }
    } catch (err) {
      const q = query.toLowerCase().trim();
      const filtered = mockSearchUsers.filter(u =>
        u.username.toLowerCase().includes(q) ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
      setResults(filtered);
    }
  };

  const onSendRequest = async (targetId) => {
    setSendingId(targetId);
    const res = await handleSendFriendRequest(targetId);
    setStatusMessage((prev) => ({
      ...prev,
      [targetId]: { success: res.success, text: res.message }
    }));
    setSendingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#121214] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] glass-panel">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#1db954]/20 text-[#1db954] flex items-center justify-center">
              <UserPlus className="h-4 w-4" />
            </div>
            Find & Add Friends ({results.length} users)
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer touch-target"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="p-4 border-b border-white/5 flex gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!e.target.value.trim()) {
                  setResults(mockSearchUsers);
                }
              }}
              placeholder="Search 20+ users by username or email..."
              className="w-full bg-[#18181b] text-white text-xs sm:text-sm placeholder-zinc-500 rounded-2xl pl-10 pr-3 py-2 border border-white/10 focus:outline-none focus:border-[#1db954]/60 transition-all h-11"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="bg-[#1db954] text-black font-black px-5 py-2 rounded-2xl text-xs sm:text-sm h-11 hover:bg-[#1ed760] disabled:opacity-50 transition-all cursor-pointer shrink-0 shadow-md shadow-[#1db954]/15 active:scale-95 touch-target"
          >
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </button>
        </form>

        {/* Results List Viewport */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400 text-xs gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-[#1db954]" />
              <span className="font-bold">Searching Moodify network...</span>
            </div>
          ) : results.length > 0 ? (
            results.map((u) => {
              const status = statusMessage[u._id];
              return (
                <div
                  key={u._id}
                  className="flex items-center justify-between bg-[#18181b]/80 border border-white/5 p-3.5 sm:p-4 rounded-2xl hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-11 w-11 rounded-2xl bg-zinc-800 text-white font-black flex items-center justify-center text-xs shrink-0 border border-white/10 shadow-md">
                      {u.username ? u.username.substring(0, 2).toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-white truncate">{u.username}</h4>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">{u.fullName || u.email}</p>
                    </div>
                  </div>

                  {status ? (
                    <span
                      className={`text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 ${
                        status.success ? 'bg-emerald-500/10 text-[#1db954] border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {status.success ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                      {status.text}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSendRequest(u._id)}
                      disabled={sendingId === u._id}
                      className="bg-zinc-800 text-white hover:bg-[#1db954] hover:text-black border border-white/10 hover:border-transparent text-xs font-black px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer touch-target active:scale-95 disabled:opacity-50"
                    >
                      {sendingId === u._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Add Friend
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center text-xs text-zinc-400 py-12 space-y-2">
              <p className="font-bold text-sm text-white">No users found</p>
              <p>No Moodify account matched "{query}". Try a different search query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;
