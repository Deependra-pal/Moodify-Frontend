import { NavLink } from 'react-router-dom';
import { Music, Heart, History, User, LogOut, Home } from 'lucide-react';
import useAuth from '../../auth/hooks/useAuth';

/**
 * Spotify-inspired Sidebar Navigation component.
 * Displays vertical sidebar on desktop, and transitions into a bottom tab bar on mobile.
 */
const Sidebar = () => {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/favorites', label: 'Favorites', icon: Heart },
    { to: '/history', label: 'History', icon: History },
    { to: '/profile', label: 'Profile', icon: User }
  ];

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-60 h-screen bg-black border-r border-neutral-900 shrink-0 sticky top-0 text-neutral-400 p-6 select-none justify-between">
        
        <div className="space-y-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1db954] shadow-md shadow-[#1db954]/15">
              <Music className="h-5 w-5 text-black fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">Moodify</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-bold tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'bg-[#282828] text-white'
                        : 'hover:text-white hover:bg-[#181818]/60'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer: User Profile & Logout */}
        <div className="space-y-4 pt-4 border-t border-neutral-900">
          {/* User Capsule */}
          <div className="flex items-center gap-3 bg-[#121212] border border-neutral-800/80 rounded-full p-2 hover:bg-[#181818] transition-all duration-200">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#282828] text-xs font-bold text-white border border-neutral-700/50">
              {user ? getInitials(user.username) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider select-none">Logged In</p>
              <p className="text-sm font-bold text-neutral-200 truncate select-none">{user?.username}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 bg-[#181818] border border-neutral-850 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 active:scale-95 px-4 py-3 rounded-full text-xs font-black transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* --- MOBILE BOTTOM TAB BAR --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[calc(4rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] bg-[#090909]/95 backdrop-blur-md border-t border-neutral-900 flex items-center justify-around z-50 px-2 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 gap-1 text-[10px] font-bold tracking-wide transition-all ${
                  isActive ? 'text-[#1db954]' : 'text-neutral-500 hover:text-neutral-300'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
