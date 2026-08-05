import React, { useState } from 'react';
import { Search, UserPlus, X, Loader2, Check, AlertCircle } from 'lucide-react';
import { searchUsers } from '../services/chatService';
import useChat from '../hooks/useChat';

const UserSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState({});
  const { handleSendFriendRequest } = useChat();

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const res = await searchUsers(query.trim());
      if (res.success) {
        setResults(res.data.users || []);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const onSendRequest = async (targetId) => {
    setSendingId(targetId);
    const res = await handleSendFriendRequest(targetId);
    setStatusMessage(prev => ({
      ...prev,
      [targetId]: { success: res.success, text: res.message }
    }));
    setSendingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
      <div className="bg-[#121214] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-3.5 px-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-[#1db954]" />
            Find & Add Friends
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Compact Search Bar */}
        <form onSubmit={handleSearch} className="p-3 border-b border-white/5 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username, name, or email..."
              className="w-full bg-[#18181b] text-white text-[11px] placeholder-zinc-500 rounded-full pl-8.5 pr-3 py-1.5 h-8 border border-white/10 focus:outline-none focus:border-[#1db954]/60 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim() || isSearching}
            className="bg-[#1db954] text-black font-extrabold px-3.5 py-1.5 rounded-full text-xs h-8 hover:bg-[#1ed760] disabled:opacity-50 transition-colors cursor-pointer shrink-0"
          >
            {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Search'}
          </button>
        </form>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {isSearching ? (
            <div className="flex items-center justify-center py-6 text-zinc-400 text-xs gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#1db954]" />
              <span>Searching users...</span>
            </div>
          ) : results.length > 0 ? (
            results.map((u) => {
              const status = statusMessage[u._id];
              return (
                <div
                  key={u._id}
                  className="flex items-center justify-between bg-[#18181b]/60 border border-white/5 p-2.5 rounded-xl hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8.5 w-8.5 rounded-full bg-zinc-800 text-white font-bold flex items-center justify-center text-xs shrink-0 border border-white/10">
                      {u.username ? u.username.substring(0, 2).toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{u.username}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{u.fullName || u.email}</p>
                    </div>
                  </div>

                  {status ? (
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                      status.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {status.success ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      {status.text}
                    </span>
                  ) : (
                    <button
                      onClick={() => onSendRequest(u._id)}
                      disabled={sendingId === u._id}
                      className="bg-zinc-800 text-white hover:bg-[#1db954] hover:text-black border border-white/10 hover:border-transparent text-[10px] font-extrabold px-3 py-1.5 rounded-full transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      {sendingId === u._id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="h-3 w-3" />
                          Add Friend
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })
          ) : query && !isSearching ? (
            <p className="text-center text-xs text-zinc-500 py-6">No users found matching "{query}"</p>
          ) : (
            <p className="text-center text-xs text-zinc-500 py-6">Type a username or email to search for users.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;
