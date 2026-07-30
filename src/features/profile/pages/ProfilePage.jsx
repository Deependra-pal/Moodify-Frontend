import React, { useEffect, useState } from 'react';
import useProfile from '../hooks/useProfile';
import useAuth from '../../auth/hooks/useAuth';
import { User, Mail, Save, Calendar, Play, RefreshCw, BarChart2, CheckCircle2, AlertTriangle } from 'lucide-react';
import defaultAlbum from '../../../assets/default_album.png';

/**
 * User Profile dashboard component.
 * Displays metrics (play count, favorite count, member status),
 * profile info form editor, and the 5 most recently played tracks.
 */
const ProfilePage = () => {
  const {
    profile,
    loading,
    updating,
    error,
    success,
    fetchProfile,
    updateProfile,
    setSuccess,
    setError
  } = useProfile();
  const { logout } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
    profilePicture: ''
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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

    // Check if there are actual changes from the current profile details
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

  const formatJoinedDate = (dateString) => {
    if (!dateString) return 'Member';
    const date = new Date(dateString);
    const formatted = date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
    return `Member since ${formatted}`;
  };

  // Helper relative time format for recently played songs
  const formatPlayedAt = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="h-10 w-10 text-[#1db954] animate-spin" />
        <p className="text-sm font-semibold tracking-wider text-neutral-400">
          Loading profile dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-[#121212] text-white flex flex-col font-sans">
      {/* Header Profile Info Banner */}
      <header className="bg-gradient-to-b from-[#1b2b1b] to-[#121212] px-4 sm:px-6 py-12 border-b border-neutral-900/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
          {/* Avatar Banner */}
          <div className="h-28 w-28 md:h-36 md:w-36 bg-gradient-to-br from-[#282828] to-[#181818] rounded-full flex items-center justify-center shadow-2xl shrink-0 border border-neutral-700/30 text-white font-black text-3xl md:text-4xl">
            {profile ? getInitials(profile.fullName || profile.username) : 'U'}
          </div>

          <div className="space-y-2 text-center md:text-left min-w-0">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#1db954] bg-[#1db954]/10 border border-[#1db954]/20 px-2.5 py-1 rounded-full">
              User Account
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-white truncate">
              {profile?.fullName || profile?.username}
            </h1>
            <p className="text-sm font-semibold text-neutral-400 flex items-center justify-center md:justify-start gap-1.5">
              <Calendar className="h-4 w-4 text-[#1db954]" />
              {formatJoinedDate(profile?.joinedDate)}
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-8 space-y-8">
        
        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#181818] border border-neutral-900 rounded-xl p-5 shadow-md flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#1db954]">
              <Play className="h-6 w-6 fill-current" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-neutral-500 tracking-wider">Total Played</p>
              <h3 className="text-xl sm:text-2xl font-black text-white">{profile?.totalPlayedSongs || 0}</h3>
            </div>
          </div>

          <div className="bg-[#181818] border border-neutral-900 rounded-xl p-5 shadow-md flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-red-500">
              <BarChart2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-neutral-500 tracking-wider">Total Favorites</p>
              <h3 className="text-xl sm:text-2xl font-black text-white">{profile?.totalFavoriteSongs || 0}</h3>
            </div>
          </div>

          <div className="bg-[#181818] border border-neutral-900 rounded-xl p-5 shadow-md flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-blue-400">
              <Mail className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase font-bold text-neutral-500 tracking-wider">Email Address</p>
              <h3 className="text-sm font-bold text-neutral-300 truncate">{profile?.email}</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Block: Edit Profile Details */}
          <div className="lg:col-span-7 bg-[#181818] border border-neutral-900 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
            <h2 className="text-lg font-bold tracking-tight text-neutral-200 border-b border-neutral-900 pb-3">
              Profile Metadata Settings
            </h2>

            {error && (
              <div className="flex items-start gap-2.5 rounded-lg bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2.5 rounded-lg bg-green-500/10 p-4 text-sm text-green-400 border border-green-500/20">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="text-xs font-bold text-neutral-400 uppercase tracking-wide">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-[#242424] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1db954] transition-colors"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="username" className="text-xs font-bold text-neutral-400 uppercase tracking-wide">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-[#242424] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1db954] transition-colors"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-bold text-neutral-400 uppercase tracking-wide">
                  Email Account (Disabled)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-11 pr-4 py-3 text-sm text-neutral-500 cursor-not-allowed select-none"
                  />
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-neutral-600" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="bio" className="text-xs font-bold text-neutral-400 uppercase tracking-wide">
                  Biography Profile Summary
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-[#242424] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1db954] transition-colors resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-sm px-6 py-3 rounded-full active:scale-95 transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-55"
              >
                {updating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-black" />
                    Updating Details...
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

          {/* Right Block: Recently Played */}
          <div className="lg:col-span-5 bg-[#181818] border border-neutral-900 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-neutral-200 border-b border-neutral-900 pb-3">
              5 Most Recently Played
            </h2>

            {profile?.recentlyPlayed && profile.recentlyPlayed.length > 0 ? (
              <div className="space-y-3">
                {profile.recentlyPlayed.map((track, index) => {
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg bg-neutral-900/40 border border-neutral-900 hover:bg-neutral-900 hover:border-neutral-850 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={track.image || defaultAlbum}
                          alt={track.songName}
                          className="h-10 w-10 rounded object-cover border border-neutral-850 shrink-0 select-none"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold truncate text-neutral-200">
                            {track.songName}
                          </h4>
                          <p className="text-[10px] text-neutral-455 truncate">{track.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          disabled
                          className="h-7 w-7 rounded-full flex items-center justify-center bg-neutral-850 text-neutral-500 cursor-not-allowed opacity-60"
                          title="Playback is disabled"
                        >
                          <Play className="h-3 w-3 fill-current ml-0.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 space-y-2 text-neutral-555 border border-neutral-900 rounded-xl bg-neutral-950/20">
                <BarChart2 className="h-7 w-7 mx-auto text-neutral-600" />
                <p className="text-xs font-bold">No tracks played recently</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default ProfilePage;
