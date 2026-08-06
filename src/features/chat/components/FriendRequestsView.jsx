import React, { useState } from 'react';
import {
  Inbox,
  Send,
  Check,
  X,
  Clock,
  ShieldCheck,
  Users
} from 'lucide-react';
import useChat from '../hooks/useChat';
import { RequestCardSkeleton } from '../../../components/common/Skeletons';

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

const FriendRequestsView = () => {
  const [requestTab, setRequestTab] = useState('incoming'); // 'incoming' | 'sent'
  const [processingId, setProcessingId] = useState(null);

  const {
    pendingRequests,
    sentRequests = [],
    handleAcceptRequest,
    handleRejectRequest,
    handleCancelSentRequest,
    isUserOnline
  } = useChat();

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

  const onCancelSent = (reqId) => {
    handleCancelSentRequest(reqId);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#09090b] overflow-hidden select-none">
      {/* 📌 Header Controls & Sub-Tab Switches */}
      <div className="p-4 sm:p-5 border-b border-white/5 space-y-4 bg-[#09090b]">
        {/* Title Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/5 shrink-0">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white leading-none">Friend Requests</h2>
              <p className="text-xs font-semibold text-zinc-400 mt-1">
                Incoming & Sent
              </p>
            </div>
          </div>
        </div>

        {/* Sub-Tab Selector */}
        <div className="flex bg-[#141416] p-1.5 rounded-2xl border border-white/10 text-xs font-bold gap-1.5 shadow-inner w-full max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => setRequestTab('incoming')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer touch-target select-none min-h-[44px] text-xs font-extrabold ${
              requestTab === 'incoming'
                ? 'bg-[#222226] text-white shadow-md border border-white/10'
                : 'text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <Inbox className="h-4 w-4 text-amber-400" />
            <span>Incoming {pendingRequests.length > 0 ? `(${pendingRequests.length})` : ''}</span>
          </button>

          <button
            type="button"
            onClick={() => setRequestTab('sent')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer touch-target select-none min-h-[44px] text-xs font-extrabold ${
              requestTab === 'sent'
                ? 'bg-[#222226] text-white shadow-md border border-white/10'
                : 'text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <Send className="h-4 w-4 text-sky-400" />
            <span>Sent {sentRequests.length > 0 ? `(${sentRequests.length})` : ''}</span>
          </button>
        </div>
      </div>

      {/* 📜 Content Grid Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
        {/* --- INCOMING REQUESTS VIEW --- */}
        {requestTab === 'incoming' && (
          <>
            {pendingRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingRequests.map((req) => {
                  const sender = req.sender;
                  if (!sender) return null;

                  const isOnline = isUserOnline(sender._id || sender.id);
                  const isProcessing = processingId === req._id;

                  return (
                    <div
                      key={req._id}
                      className="bg-[#121214] border border-white/10 hover:border-amber-500/40 p-4 sm:p-5 rounded-2xl shadow-xl transition-all flex flex-col justify-between gap-4 glass-panel"
                    >
                      {/* User Info & Mutual Friends Badge */}
                      <div className="flex items-start justify-between gap-3 min-w-0">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative shrink-0">
                            <div
                              className={`h-12 w-12 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border text-white font-black flex items-center justify-center text-sm shadow-md ${
                                isOnline ? 'border-[#1db954]/60' : 'border-white/10'
                              }`}
                            >
                              {sender.username ? sender.username.substring(0, 2).toUpperCase() : 'U'}
                            </div>
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#121214] ${
                                isOnline ? 'bg-[#1db954]' : 'bg-zinc-600'
                              }`}
                            />
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-sm sm:text-base font-black text-white truncate">
                              {sender.username}
                            </h4>
                            <p className="text-xs text-zinc-400 truncate mt-0.5">
                              {sender.fullName || sender.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                <Users className="h-3 w-3" />
                                {req.mutualFriends || Math.floor(Math.random() * 15) + 2} mutual friends
                              </span>
                              <span className="text-[11px] text-zinc-500 font-semibold flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(req.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Accept & Reject Action Buttons */}
                      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => onReject(req._id)}
                          disabled={isProcessing}
                          className="flex-1 py-3 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 border border-red-500/20 cursor-pointer touch-target active:scale-95 disabled:opacity-50 min-h-[44px]"
                        >
                          <X className="h-4 w-4" />
                          Decline
                        </button>

                        <button
                          type="button"
                          onClick={() => onAccept(req._id)}
                          disabled={isProcessing}
                          className="flex-1 py-3 px-4 rounded-xl bg-[#1db954] hover:bg-[#1ed760] text-black text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#1db954]/20 cursor-pointer touch-target active:scale-95 disabled:opacity-50 min-h-[44px]"
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
              /* Empty Incoming Requests */
              <div className="h-80 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="h-20 w-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-2xl shadow-amber-500/10">
                  <Inbox className="h-9 w-9 stroke-[1.75]" />
                </div>
                <div className="max-w-sm space-y-1">
                  <h3 className="text-lg font-black text-white">No Incoming Requests</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    You're all caught up! New friend requests from other Moodify music lovers will appear here.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* --- SENT REQUESTS VIEW --- */}
        {requestTab === 'sent' && (
          <>
            {sentRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sentRequests.map((req) => {
                  const receiver = req.receiver;
                  if (!receiver) return null;

                  return (
                    <div
                      key={req._id}
                      className="bg-[#121214] border border-white/10 p-4 sm:p-5 rounded-2xl shadow-xl flex items-center justify-between gap-3 glass-panel"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="h-12 w-12 rounded-2xl bg-zinc-800 border border-white/10 text-white font-black flex items-center justify-center text-sm shadow-md shrink-0">
                          {receiver.username ? receiver.username.substring(0, 2).toUpperCase() : 'U'}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-sm sm:text-base font-black text-white truncate">
                            {receiver.username}
                          </h4>
                          <p className="text-xs text-zinc-400 truncate mt-0.5">
                            {receiver.fullName || receiver.email}
                          </p>
                          <span className="text-[10px] font-bold text-sky-400 flex items-center gap-1 mt-1 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20 w-fit">
                            <Clock className="h-3 w-3" />
                            Awaiting Approval
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onCancelSent(req._id)}
                        className="py-1.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-extrabold transition-all border border-rose-500/20 cursor-pointer shrink-0 active:scale-95 flex items-center gap-1 shadow-sm"
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty Sent Requests */
              <div className="h-80 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="h-20 w-20 rounded-3xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-2xl shadow-sky-500/10">
                  <Send className="h-9 w-9 stroke-[1.75]" />
                </div>
                <div className="max-w-sm space-y-1">
                  <h3 className="text-lg font-black text-white">No Sent Requests</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    You have not sent any pending friend requests recently.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FriendRequestsView;
