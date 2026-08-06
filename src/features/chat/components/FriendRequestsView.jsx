import React, { useState } from 'react';
import { UserCheck, UserX, UserPlus, Inbox, Send, Search, Sparkles, Check, X, Clock, ShieldCheck } from 'lucide-react';
import useChat from '../hooks/useChat';

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

const FriendRequestsView = ({ onOpenSearch }) => {
  const [requestTab, setRequestTab] = useState('incoming'); // 'incoming' | 'sent'
  const [filterText, setFilterText] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const {
    pendingRequests,
    handleAcceptRequest,
    handleRejectRequest,
    isUserOnline
  } = useChat();

  const filteredIncoming = pendingRequests.filter((req) => {
    const sender = req.sender;
    if (!sender) return false;
    const q = filterText.toLowerCase().trim();
    if (!q) return true;
    return (
      sender.username?.toLowerCase().includes(q) ||
      sender.fullName?.toLowerCase().includes(q) ||
      sender.email?.toLowerCase().includes(q)
    );
  });

  const onAccept = async (reqId) => {
    setProcessingId(reqId);
    await handleAcceptRequest(reqId);
    setProcessingId(null);
  };

  const onReject = async (reqId) => {
    setProcessingId(reqId);
    await handleRejectRequest(reqId);
    setProcessingId(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#09090b] overflow-hidden select-none">
      {/* 📌 Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-white/5 space-y-4 bg-[#09090b]">
        {/* Header Title & Add Friend CTA */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/5 shrink-0">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white leading-none">Friend Requests</h2>
              <p className="text-xs font-medium text-zinc-400 mt-1">
                Manage your incoming and sent connection requests
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

        {/* Search Input & Sub-Tab Toggles */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Sub-Tab Toggle Pills */}
          <div className="flex bg-[#121214] p-1 rounded-xl border border-white/5 text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => setRequestTab('incoming')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${requestTab === 'incoming'
                  ? 'bg-[#18181b] text-white shadow-sm border border-white/10'
                  : 'text-zinc-400 hover:text-white'
                }`}
            >
              <Inbox className="h-4 w-4 text-amber-400" />
              Incoming
              {pendingRequests.length > 0 && (
                <span className="bg-[#1db954] text-black text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter by username or email..."
              className="w-full bg-[#121214] text-white text-xs sm:text-sm placeholder-zinc-500 rounded-xl pl-9 pr-3 py-2 border border-white/5 focus:outline-none focus:border-[#1db954]/60 transition-all h-10"
            />
          </div>
        </div>
      </div>

      {/* 📜 Content Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
        {requestTab === 'incoming' && (
          <>
            {filteredIncoming.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredIncoming.map((req) => {
                  const sender = req.sender;
                  if (!sender) return null;

                  const isOnline = isUserOnline(sender._id || sender.id);
                  const isProcessing = processingId === req._id;

                  return (
                    <div
                      key={req._id}
                      className="bg-[#121214] border border-white/10 hover:border-amber-500/40 p-4 sm:p-5 rounded-2xl shadow-xl transition-all flex flex-col justify-between gap-4 glass-panel"
                    >
                      {/* Top Row: User Avatar & Details */}
                      <div className="flex items-start justify-between gap-3 min-w-0">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative shrink-0">
                            <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border text-white font-black flex items-center justify-center text-sm shadow-md ${isOnline ? 'border-[#1db954]/60' : 'border-white/10'
                              }`}>
                              {sender.username ? sender.username.substring(0, 2).toUpperCase() : 'U'}
                            </div>
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#121214] ${isOnline ? 'bg-[#1db954]' : 'bg-zinc-600'
                                }`}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm sm:text-base font-black text-white truncate">{sender.username}</h4>
                              <span className="bg-emerald-500/10 text-[#1db954] text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 shrink-0">
                                <ShieldCheck className="h-3 w-3" />
                                Verified
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 truncate mt-0.5">{sender.fullName || sender.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-zinc-500 font-semibold flex items-center gap-1">
                                <Clock className="h-3 w-3 text-zinc-400" />
                                {formatTime(req.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Actions: Accept & Reject Buttons */}
                      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => onReject(req._id)}
                          disabled={isProcessing}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-red-500/20 cursor-pointer touch-target active:scale-95 disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                          Decline
                        </button>

                        <button
                          type="button"
                          onClick={() => onAccept(req._id)}
                          disabled={isProcessing}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-[#1db954] hover:bg-[#1ed760] text-black text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#1db954]/20 cursor-pointer touch-target active:scale-95 disabled:opacity-50"
                        >
                          <Check className="h-4 w-4 stroke-[3]" />
                          Accept Friend
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="h-96 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="h-20 w-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-2xl shadow-amber-500/10">
                  <Inbox className="h-9 w-9 stroke-[1.75]" />
                </div>
                <div className="max-w-sm space-y-1">
                  <h3 className="text-lg font-black text-white">No Friend Requests</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    You're all caught up! Incoming requests from other Moodify music lovers will appear here.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenSearch}
                  className="bg-[#1db954] text-black hover:bg-[#1ed760] font-black text-xs px-5 py-2.5 rounded-full transition-all shadow-md shadow-[#1db954]/20 flex items-center gap-2 cursor-pointer active:scale-95 touch-target"
                >
                  <UserPlus className="h-4 w-4 stroke-[2.5]" />
                  Find People to Add
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FriendRequestsView;
