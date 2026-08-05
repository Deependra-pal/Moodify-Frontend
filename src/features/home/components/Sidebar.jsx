import { NavLink } from 'react-router-dom';
import { Music, Heart, History, User, LogOut, Home, MessageSquare } from 'lucide-react';
import useAuth from '../../auth/hooks/useAuth';
import useChat from '../../chat/hooks/useChat';

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
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1db954] to-[#1ed760] shadow-lg shadow-[#1db954]/20">
              <Music className="h-5 w-5 text-black fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white leading-none">Moodify</span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">SaaS Music</span>
            </div>
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
                    `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 relative ${
                      isActive
                        ? 'bg-[#18181b] text-white border-l-2 border-[#1db954] shadow-md shadow-[#1db954]/5 font-bold'
                        : 'hover:text-white hover:bg-[#18181b]/60'
                    }`
                  }
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.label}</span>

                  {/* Unread Messages Badge */}
                  {item.badge > 0 && (
                    <span className="ml-auto bg-[#1db954] text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-md shadow-[#1db954]/20 animate-pulse">
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
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider select-none">Logged In</p>
              <p className="text-xs font-bold text-zinc-200 truncate select-none">{user?.username}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 bg-[#18181b] border border-white/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 active:scale-95 px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* --- MOBILE BOTTOM TAB BAR --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[calc(4rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] bg-[#09090b]/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around z-50 px-2 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 gap-1 text-[10px] font-bold tracking-wide transition-all relative ${
                  isActive ? 'text-[#1db954]' : 'text-zinc-500 hover:text-zinc-300'
                }`
              }
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#1db954] text-black text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-md animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
