import React from 'react';
import useAuth from '../hooks/useAuth';
import { LogOut, CheckCircle, Music, User as UserIcon, Calendar, Mail } from 'lucide-react';

/**
 * Temporary dashboard page displaying user details and active session confirmation.
 * This verifies the Phase 1 Authentication integration and allows testing the logout flow.
 */
const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen w-full bg-[#121212] text-white flex flex-col">
      {/* Navbar */}
      <nav className="bg-[#0b0b0b] border-b border-neutral-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1db954]">
            <Music className="h-5 w-5 text-black fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight">Moodify</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 bg-[#242424] hover:bg-[#2e2e2e] active:scale-95 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto">
        <div className="bg-[#181818] border border-neutral-900 rounded-2xl p-8 w-full shadow-2xl space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-[#1db954]/10 rounded-full flex items-center justify-center text-[#1db954] border border-[#1db954]/25">
              <CheckCircle className="h-8 w-8" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Authentication Successful!</h1>
            <p className="text-neutral-400 text-sm">
              Phase 1 of Moodify frontend architecture is completely implemented.
            </p>
          </div>

          {/* User Info Card */}
          <div className="bg-[#242424] rounded-xl p-6 text-left space-y-4 border border-neutral-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-800 pb-2">
              Authenticated Session Data
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3 bg-[#181818] p-3 rounded-lg border border-neutral-900/50">
                <UserIcon className="h-5 w-5 text-[#1db954]" />
                <div>
                  <p className="text-xs text-neutral-500 font-medium">Username</p>
                  <p className="font-semibold text-neutral-200">{user?.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#181818] p-3 rounded-lg border border-neutral-900/50">
                <Mail className="h-5 w-5 text-[#1db954]" />
                <div>
                  <p className="text-xs text-neutral-500 font-medium">Email</p>
                  <p className="font-semibold text-neutral-200 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#181818] p-3 rounded-lg border border-neutral-900/50 sm:col-span-2">
                <Calendar className="h-5 w-5 text-[#1db954]" />
                <div>
                  <p className="text-xs text-neutral-500 font-medium">Member Since</p>
                  <p className="font-semibold text-neutral-200">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-900 text-xs text-neutral-500">
            Moodify App Context Session Active • Ready for Phase 2 (Home Layout)
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
