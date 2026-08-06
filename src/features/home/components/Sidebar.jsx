import { NavLink } from 'react-router-dom';
import { Music, Heart, History, User, LogOut, Home, MessageSquare } from 'lucide-react';
import useAuth from '../../auth/hooks/useAuth';
import useChat from '../../chat/hooks/useChat';
import Logo from '../../../components/Logo';

/**
 * Spotify & Linear inspired Sidebar Navigation component.
 * Displays vertical sidebar on desktop with subtle glass borders,
 * and transitions into a bottom tab bar on mobile.
 */
const Sidebar = () => {
  const { user, logout } = useAuth();
  const { totalUnreadCount } = useChat();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/chat', label: 'Messages', icon: MessageSquare, badge: totalUnreadCount },
    { to: '/favorites', label: 'Favorites', icon: Heart },
    { to: '/history', label: 'History', icon: History },
    { to: '/profile', label: 'Profile', icon: User }
  ];

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-64 h-full bg-[#09090b] border-r border-white/5 shrink-0 text-zinc-400 p-5 select-none justify-between">
        
        <div className="space-y-8">
          {/* Brand Logo */}
          <div className="px-2">
            <Logo size="md" showSubtitle />
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3 rounded-xl text-base font-bold tracking-wide transition-all duration-200 relative ${
                      isActive
                        ? 'bg-[#18181b] text-white border-l-2 border-[#1db954] shadow-md shadow-[#1db954]/5'
                        : 'hover:text-white hover:bg-[#18181b]/60'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>

                  {/* Unread Messages Badge */}
                  {item.badge > 0 && (
                    <span className="ml-auto bg-[#1db954] text-black text-xs font-black px-2 py-0.5 rounded-full shadow-md shadow-[#1db954]/20 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer: User Profile Capsule & Logout */}
        <div className="space-y-3 pt-4 border-t border-white/5">
          {/* User Capsule */}
          <div className="flex items-center gap-3 bg-[#121214] border border-white/5 rounded-2xl p-2.5 hover:bg-[#18181b] transition-all duration-200">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-xs font-bold text-white border border-white/10 shrink-0">
              {user ? getInitials(user.username) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider select-none">Logged In</p>
              <p className="text-xs sm:text-sm font-bold text-zinc-200 truncate select-none">{user?.username}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 bg-[#18181b] border border-white/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 active:scale-95 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* --- MOBILE BOTTOM TAB BAR --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[calc(4rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] bg-[#09090b]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-between z-50 px-2 shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full min-h-[44px] py-1 gap-1 text-[11px] font-extrabold tracking-wide transition-all relative touch-target select-none ${
                  isActive ? 'text-[#1db954] scale-105' : 'text-zinc-400 hover:text-zinc-200'
                }`
              }
            >
              <div className="relative flex items-center justify-center">
                <Icon className="h-5 w-5 stroke-[2.2]" />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#1db954] text-black text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-md animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="leading-none text-center truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
