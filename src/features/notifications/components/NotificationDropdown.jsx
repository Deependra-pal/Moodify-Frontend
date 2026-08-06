import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Inbox, UserPlus, MessageSquare, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as notificationService from '../services/notificationService';
import { getSocket } from '../../chat/services/socketService';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const diffMinutes = Math.floor((new Date() - date) / (1000 * 60));
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Error fetching notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const socket = getSocket();
    if (socket) {
      const handleNewNotification = (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      };

      socket.on('newNotification', handleNewNotification);
      return () => {
        socket.off('newNotification', handleNewNotification);
      };
    }
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking notifications as read:', err.message);
    }
  };

  const handleNotificationClick = (n) => {
    setIsOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-[#121214] border border-white/10 hover:border-[#1db954]/50 hover:bg-[#18181b] text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer touch-target shrink-0"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-[#1db954] text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#09090b] shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Menu Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#121214] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 glass-panel">
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-white/5 flex items-center justify-between bg-[#09090b]">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#1db954]" />
              <h3 className="text-sm font-black text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-[#1db954]/20 text-[#1db954] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#1db954]/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-zinc-400 hover:text-[#1db954] font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark read
              </button>
            )}
          </div>

          {/* List Viewport */}
          <div className="max-h-96 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {loading ? (
              <div className="p-6 text-center text-xs text-zinc-500 font-medium">
                Loading notifications...
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-white/5 cursor-pointer transition-all ${
                    !n.isRead ? 'bg-[#18181b]/70 border-l-2 border-[#1db954]' : ''
                  }`}
                >
                  <div className="h-9 w-9 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                    {n.sender?.username ? n.sender.username.substring(0, 2).toUpperCase() : 'M'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-200 leading-snug">
                      <span className="font-bold text-white">{n.sender?.username || 'User'}</span>{' '}
                      {n.message}
                    </p>
                    <span className="text-[10px] font-medium text-zinc-500 mt-1 block">
                      {formatTimeAgo(n.createdAt)}
                    </span>
                  </div>

                  <ExternalLink className="h-3.5 w-3.5 text-zinc-600 shrink-0 mt-1" />
                </div>
              ))
            ) : (
              <div className="p-8 flex flex-col items-center justify-center text-center space-y-2">
                <Inbox className="h-8 w-8 text-zinc-600" />
                <p className="text-xs font-bold text-zinc-400">No Notifications</p>
                <p className="text-[11px] text-zinc-500">You're all caught up!</p>
              </div>
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
