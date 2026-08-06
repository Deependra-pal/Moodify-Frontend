import React, { useEffect, useState } from 'react';
import useProfile from '../hooks/useProfile';
import useAuth from '../../auth/hooks/useAuth';
import useChat from '../../chat/hooks/useChat';
import { useNavigate } from 'react-router-dom';
import { Mail, Save, Play, RefreshCw, CheckCircle2, AlertTriangle, Users, UserCheck, Heart, Edit3, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { ProfileSkeleton } from '../../../components/common/Skeletons';

/**
 * Spotify-Authentic User Profile page with Tabbed Navigation.
 * Responsive mobile-first design across all phone viewports.
 */
const ProfilePage = () => {
  const {
    profile,
    loading,
    updating,
    error,
    success,
    updateProfile,
    setSuccess,
    setError
  } = useProfile();
  const { friends, openChatWithFriend } = useChat();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'friends' | 'settings'
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
    profilePicture: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        username: profile.username || '',
        bio: profile.bio || '',
        profilePicture: profile.profilePicture || ''
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasChanges =
      formData.fullName !== (profile?.fullName || '') ||
      formData.username !== (profile?.username || '') ||
      formData.bio !== (profile?.bio || '') ||
      formData.profilePicture !== (profile?.profilePicture || '');

    if (!hasChanges) {
      setSuccess('No changes to save.');
      setError(null);
      return;
    }

    try {
      await updateProfile(formData);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const formatJoinedYear = (dateString) => {
    if (!dateString) return '2026';
    const date = new Date(dateString);
    return date.getFullYear();
  };

  if (loading) {
    return (
      <div className="flex-1 w-full bg-[#09090b] text-white flex flex-col p-4 sm:p-8 max-w-7xl mx-auto">
        <ProfileSkeleton />
      </div>
    );
  }

  const followersCount = friends?.length || 0;
  const followingCount = friends?.length || 0;
  const displayName = profile?.fullName || profile?.username || 'User Profile';

  return (
    <div className="flex-1 w-full bg-[#09090b] text-zinc-100 flex flex-col font-sans select-none">
      {/* --- SPOTIFY HERO HEADER BANNER --- */}
      <header className="bg-gradient-to-b from-[#1a3d24] via-[#102417] to-[#09090b] px-4 sm:px-8 md:px-10 pt-6 sm:pt-10 pb-6 sm:pb-8 border-b border-white/5 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#1db954]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-8 relative z-10">
          {/* Circular Spotify Avatar */}
          <div className="h-28 w-28 sm:h-40 sm:w-40 md:h-48 md:w-48 rounded-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black flex items-center justify-center text-white font-black text-4xl sm:text-6xl md:text-7xl shadow-2xl border-4 border-[#09090b] shrink-0 shadow-black/80">
            {getInitials(displayName)}
          </div>

          {/* Profile Header Details */}
          <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#1db954] bg-[#1db954]/10 border border-[#1db954]/20 px-3 py-1 rounded-full inline-block">
              Public Profile
            </span>
            <h1 className="text-2xl sm:text-5xl md:text-6xl font-black tracking-tight text-white truncate leading-tight py-0.5">
              {displayName}
            </h1>

            {/* Spotify Meta Stats Line */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-xs font-semibold text-zinc-300 pt-1">
              <span className="text-white font-bold">{profile?.username}</span>
              <span className="text-zinc-500">•</span>
              <span className="text-white font-bold">{followersCount}</span>
              <span className="text-zinc-400">Followers</span>
              <span className="text-zinc-500">•</span>
              <span className="text-white font-bold">{followingCount}</span>
              <span className="text-zinc-400">Following</span>
              <span className="text-zinc-500">•</span>
              <span className="text-white font-bold">{profile?.totalPlayedSongs || 0}</span>
              <span className="text-zinc-400">Played</span>
            </div>

            {profile?.bio && (
              <p className="text-xs text-zinc-400 max-w-xl line-clamp-2 pt-1 font-normal italic">
                "{profile.bio}"
              </p>
            )}
          </div>
        </div>
      </header>

      {/* --- SPOTIFY TAB NAVIGATION BAR --- */}
      <section className="bg-[#09090b] px-4 sm:px-8 md:px-10 py-2.5 sm:py-3 border-b border-white/5 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Tabs Group */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer min-h-[44px] touch-target shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('friends')}
              className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-1.5 min-h-[44px] touch-target shrink-0 ${
                activeTab === 'friends'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Users className="h-4 w-4" />
              Friends ({friends.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-1.5 min-h-[44px] touch-target shrink-0 ${
                activeTab === 'settings'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </button>
          </div>

          <span className="text-xs font-bold text-zinc-500 hidden md:inline">
            Member since {formatJoinedYear(profile?.joinedDate)}
          </span>
        </div>
      </section>

      {/* --- TAB CONTENT AREA --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-8 md:px-10 py-5 sm:py-8 space-y-6 sm:space-y-8 pb-4 md:pb-6">
        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Spotify Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
              <div className="bg-[#121214] border border-white/5 rounded-2xl p-4 sm:p-5 shadow-lg flex items-center gap-3 sm:gap-4 hover:border-zinc-800 transition-all">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-[#1db954] shrink-0">
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] uppercase font-bold text-zinc-400 tracking-wider truncate">Total Played</p>
                  <h3 className="text-xl sm:text-2xl font-black text-white">{profile?.totalPlayedSongs || 0}</h3>
                </div>
              </div>

              <div className="bg-[#121214] border border-white/5 rounded-2xl p-4 sm:p-5 shadow-lg flex items-center gap-3 sm:gap-4 hover:border-zinc-800 transition-all">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-rose-500 shrink-0">
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] uppercase font-bold text-zinc-400 tracking-wider truncate">Favorites</p>
                  <h3 className="text-xl sm:text-2xl font-black text-white">{profile?.totalFavoriteSongs || 0}</h3>
                </div>
              </div>

              <div className="bg-[#121214] border border-white/5 rounded-2xl p-4 sm:p-5 shadow-lg flex items-center gap-3 sm:gap-4 hover:border-zinc-800 transition-all">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-indigo-400 shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] uppercase font-bold text-zinc-400 tracking-wider truncate">Followers</p>
                  <h3 className="text-xl sm:text-2xl font-black text-white">{followersCount}</h3>
                </div>
              </div>

              <div className="bg-[#121214] border border-white/5 rounded-2xl p-4 sm:p-5 shadow-lg flex items-center gap-3 sm:gap-4 hover:border-zinc-800 transition-all">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-sky-400 shrink-0">
                  <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] uppercase font-bold text-zinc-400 tracking-wider truncate">Following</p>
                  <h3 className="text-xl sm:text-2xl font-black text-white">{followingCount}</h3>
                </div>
              </div>
            </div>

            {/* Account Information Summary Card */}
            <div className="bg-[#121214] border border-white/5 rounded-2xl p-5 sm:p-8 space-y-4 shadow-xl">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2 border-b border-white/5 pb-3">
                <ShieldCheck className="h-5 w-5 text-[#1db954]" />
                Account & Profile Summary
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-2">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Username</p>
                  <p className="text-sm font-bold text-white">{profile?.username}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-bold text-white truncate">{profile?.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Account Status</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <Sparkles className="h-3.5 w-3.5" /> Premium Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- FRIENDS & COMMUNITY TAB --- */}
        {activeTab === 'friends' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Users className="h-5 w-5 text-[#1db954]" />
                Your Friends & Network ({friends.length})
              </h2>
            </div>

            {friends.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {friends.map((f) => {
                  const friendUser = f.user;
                  if (!friendUser) return null;

                  return (
                    <div
                      key={f.friendshipId || friendUser._id}
                      className="bg-[#121214] border border-white/5 p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-zinc-800 border border-white/10 text-white font-bold flex items-center justify-center text-xs sm:text-sm shrink-0">
                          {friendUser.username ? friendUser.username.substring(0, 2).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-white truncate">{friendUser.username}</p>
                          <p className="text-[11px] sm:text-xs text-zinc-400 truncate">{friendUser.fullName || friendUser.email}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          openChatWithFriend(friendUser);
                          navigate('/chat');
                        }}
                        className="bg-[#1db954] text-black hover:bg-[#1ed760] text-xs font-extrabold px-3.5 py-2.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md shadow-[#1db954]/15 active:scale-95 touch-target min-h-[44px]"
                      >
                        <MessageSquare className="h-3.5 w-3.5 fill-current" />
                        Chat
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 space-y-3 text-zinc-500 border border-white/5 rounded-2xl bg-[#121214]">
                <Users className="h-10 w-10 mx-auto text-zinc-600" />
                <p className="text-sm font-bold text-zinc-400">No friends added yet</p>
                <button
                  type="button"
                  onClick={() => navigate('/chat')}
                  className="text-xs font-extrabold text-[#1db954] hover:underline cursor-pointer"
                >
                  Go to Messages & Find Friends
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- EDIT PROFILE SETTINGS TAB --- */}
        {activeTab === 'settings' && (
          <div className="bg-[#121214] border border-white/5 rounded-2xl p-5 sm:p-8 shadow-xl space-y-5 sm:space-y-6 max-w-3xl mx-auto">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white border-b border-white/5 pb-3 flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-[#1db954]" />
              Profile Metadata Settings
            </h2>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 p-3.5 text-xs text-red-400 border border-red-500/20">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="font-semibold">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2.5 rounded-xl bg-emerald-500/10 p-3.5 text-xs text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="font-semibold">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#1db954] focus:ring-1 focus:ring-[#1db954] transition-all h-11"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="username" className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#1db954] focus:ring-1 focus:ring-[#1db954] transition-all h-11"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full bg-[#18181b]/50 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-500 cursor-not-allowed select-none h-11"
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-600 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="bio" className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                  Biography & Summary
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#1db954] focus:ring-1 focus:ring-[#1db954] transition-all resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1db954] hover:bg-[#1ed760] text-black font-extrabold text-xs sm:text-sm px-8 py-3 rounded-full active:scale-95 transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-55 shadow-md shadow-[#1db954]/20 min-h-[44px] touch-target"
              >
                {updating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-black" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 text-black" />
                    Save Profile Changes
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
