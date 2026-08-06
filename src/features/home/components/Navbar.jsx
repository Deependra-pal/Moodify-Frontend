import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, LogOut, User } from 'lucide-react';
import useAuth from '../../auth/hooks/useAuth';
import { usePlayer } from '../../../context/PlayerContext';
import { loginWithSpotify } from '../../../utils/spotifyAuth';
import Logo from '../../../components/Logo';
import NotificationDropdown from '../../notifications/components/NotificationDropdown';

/**
 * Spotify-inspired Top Navbar component.
 * Displays application logo, current user details, Spotify connection status, and log out functionality.
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  const { spotifyToken, disconnectSpotify } = usePlayer();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Get initials for the user avatar display
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="bg-[#0b0b0b] border-b border-neutral-900 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-50 select-none">
      {/* Brand Logo */}
      <Link to="/" className="hover:opacity-90 transition-opacity">
        <Logo size="sm" />
      </Link>

      {/* User Actions Panel */}
      <div className="flex items-center gap-3 sm:gap-4 relative">
        {/* Persistent Notification Dropdown */}
        <NotificationDropdown />
        {/* Spotify OAuth Status Button */}
        {spotifyToken ? (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-[#1db954] bg-[#1db954]/10 border border-[#1db954]/20 px-2 sm:px-2.5 py-1 rounded-full select-none">
              <span className="hidden sm:inline">Spotify </span>Connected
            </span>
            <button
              onClick={disconnectSpotify}
              className="text-[9px] sm:text-[10px] text-neutral-400 hover:text-red-400 hover:underline cursor-pointer"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={loginWithSpotify}
            className="flex items-center gap-2 bg-[#1db954] hover:bg-[#1ed760] text-black active:scale-95 px-3 sm:px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer shadow-md"
          >
            Connect Spotify
          </button>
        )}

        {/* User Info Capsule Trigger */}
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 bg-[#181818] border border-neutral-800 rounded-full py-1 pl-1.5 pr-2.5 sm:pl-2 sm:pr-3 hover:bg-[#282828] active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-700 text-xs font-bold text-neutral-200">
            {user ? getInitials(user.username) : <User className="h-4 w-4" />}
          </div>
          <span className="text-sm font-semibold text-neutral-200 hidden sm:inline select-none">
            {user?.username || 'User'}
          </span>
        </button>

        {/* Dropdown Menu Overlay */}
        {dropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-transparent" 
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 top-11 w-64 bg-[#181818]/95 backdrop-blur-md border border-neutral-800 rounded-xl shadow-2xl p-4 z-50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="border-b border-neutral-900 pb-3">
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Account</p>
                <p className="text-sm font-bold text-neutral-200 truncate">{user?.username}</p>
                <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 text-xs font-bold text-neutral-350 hover:text-white px-3 py-2 rounded-lg hover:bg-neutral-800/80 transition-colors"
                >
                  <User className="h-4 w-4" />
                  View Settings Profile
                </Link>

                {spotifyToken ? (
                  <button
                    onClick={() => {
                      disconnectSpotify();
                      setDropdownOpen(false);
                    }}
                    className="flex items-center gap-2.5 text-xs font-bold text-red-405 hover:text-red-300 px-3 py-2 rounded-lg hover:bg-red-500/5 transition-colors text-left w-full cursor-pointer"
                  >
                    <Music className="h-4 w-4" />
                    Disconnect Spotify
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      loginWithSpotify();
                      setDropdownOpen(false);
                    }}
                    className="flex items-center gap-2.5 text-xs font-bold text-[#1db954] hover:text-[#1ed760] px-3 py-2 rounded-lg hover:bg-[#1db954]/5 transition-colors text-left w-full cursor-pointer"
                  >
                    <Music className="h-4 w-4" />
                    Connect Spotify
                  </button>
                )}
              </div>

              <div className="border-t border-neutral-900 pt-3">
                <button
                  onClick={() => {
                    logout();
                    setDropdownOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 bg-[#282828] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 border border-neutral-850 px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Log Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
