import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import CameraPlaceholder from '../../FaceExpression/components/CameraPlaceholder';
import RecommendationEmptyState from '../components/RecommendationEmptyState';
import SongCard from '../components/SongCard';
import useRecommendations from '../hooks/useRecommendations';
import useFavorites from '../../favorites/hooks/useFavorites';
import { usePlayer } from '../../../context/PlayerContext';
import { exchangeCodeForToken } from '../../../utils/spotifyAuth';
import { Music, AlertCircle, RefreshCw, Search } from 'lucide-react';
import api from '../../../services/api';

/**
 * HomePage container component.
 * Integrates scanning triggers, custom recommendations hook, loading views,
 * and actual API-returned track cards from the Spotify backend service.
 */
const HomePage = () => {
  const navigate = useNavigate();
  const { songs, loading, error, fetchRecommendations, currentEmotion, searchTracks } = useRecommendations();
  const [searchQuery, setSearchQuery] = useState('');
  const { favorites, fetchFavorites, addFavorite, removeFavorite } = useFavorites();
  const { playTrack, currentSong, isPlaying, setSpotifyToken, playbackSource } = usePlayer();

  const handleSearchSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      await searchTracks(searchQuery);
    } catch (err) {
      console.error('Failed to search custom tracks:', err);
    }
  }, [searchQuery, searchTracks]);

  // Listen to Spotify authorization callback redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      const exchangeToken = async () => {
        try {
          const token = await exchangeCodeForToken(code);
          setSpotifyToken(token);

          // Inform backend that Spotify account has been connected
          try {
            await api.put('/spotify/connect');
          } catch (connectErr) {
            console.error('Failed to sync Spotify connection to backend database:', connectErr);
          }

          // Redirect browser back to original page or path '/'
          const redirectPath = window.localStorage.getItem('spotify_redirect_back_path') || '/';
          window.localStorage.removeItem('spotify_redirect_back_path');
          navigate(redirectPath, { replace: true });
        } catch (err) {
          console.error('Failed to exchange Spotify auth code:', err);
        }
      };
      exchangeToken();
    }
  }, [setSpotifyToken, navigate]);

  // Load user favorites on mount to track favorite status of recommendations
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRecommend = useCallback(async (emotion) => {
    try {
      await fetchRecommendations(emotion);
    } catch (err) {
      console.error('Failed to load recommended tracks:', err);
    }
  }, [fetchRecommendations]);

  const getFavoriteItem = useCallback((song) => {
    return favorites.find(
      (fav) =>
        (song.uri && fav.spotifyUri === song.uri) ||
        (fav.songName === song.name && fav.artist === song.artist)
    );
  }, [favorites]);

  const handleFavoriteToggle = useCallback(async (song) => {
    const favItem = getFavoriteItem(song);
    try {
      if (favItem) {
        await removeFavorite(favItem._id);
      } else {
        const songDetails = {
          songName: song.name,
          artist: song.artist,
          album: song.album || 'Unknown Album',
          image: song.image || '',
          spotifyUri: song.uri || '',
          spotifyUrl: song.spotifyUrl || ''
        };
        await addFavorite(songDetails);
      }
    } catch (err) {
      console.error('Failed to toggle favorite on homepage card:', err);
    }
  }, [getFavoriteItem, addFavorite, removeFavorite]);

  return (
    <div className="min-h-screen w-full bg-[#121212] text-white flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">

        {/* Hero Welcome Message */}
        <HeroSection />

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Panel: Camera/Emotion Detection */}
          <div className="lg:col-span-5 space-y-6">
            <CameraPlaceholder
              currentEmotion={currentEmotion}
              onRecommend={handleRecommend}
              isLoadingSongs={loading}
            />
          </div>

          {/* Right Panel: Recommended Song Listings */}
          <div className="lg:col-span-7 h-full flex flex-col min-h-0 bg-[#181818] border border-neutral-900 rounded-2xl p-4 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-lg font-bold tracking-tight text-neutral-200 flex items-center gap-2">
                <Music className="h-5 w-5 text-[#1db954]" />
                Recommended Tracks
              </h2>
              <span className="text-xs text-neutral-500 font-semibold tracking-wider bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-full">
                {songs.length} Tracks
              </span>
            </div>

            {/* Custom Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="mb-4 flex items-center gap-2 shrink-0">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by artist, singer, or track name..."
                  className="w-full bg-[#242424] border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1db954] transition-colors"
                />
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-500" />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#1db954] hover:bg-[#1ed760] text-black active:scale-95 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer shadow-md shrink-0 flex items-center gap-1.5 disabled:opacity-50"
              >
                Search
              </button>
            </form>

            {/* Error Message Display */}
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20 shrink-0">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <p className="font-semibold">Failed to retrieve Spotify recommendations</p>
                  <p className="text-xs text-neutral-400">{error}</p>
                </div>
              </div>
            )}

            {/* Content Area */}
            <div className="flex-1 min-h-0 overflow-hidden relative">
              {loading ? (
                // Spotify-inspired Loading Spinner
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <RefreshCw className="h-10 w-10 text-[#1db954] animate-spin" />
                  <p className="text-sm font-semibold tracking-wider text-neutral-400">
                    Retrieving tracks matching vibes...
                  </p>
                </div>
              ) : songs.length > 0 ? (
                // Real Song Cards from Backend
                <div className="max-h-[360px] sm:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {songs.map((song, index) => {
                      const isFav = !!getFavoriteItem(song);
                      const isCurrentPlaying =
                        isPlaying &&
                        currentSong &&
                        ((currentSong.uri && currentSong.uri === (song.uri || song.spotifyUri)) ||
                          (currentSong.spotifyUrl && currentSong.spotifyUrl === song.spotifyUrl) ||
                          (currentSong.name === song.name && currentSong.artist === song.artist));

                      const isPlayingFromHome = isCurrentPlaying && playbackSource === 'home';

                      return (
                        <SongCard
                          key={`${song.uri || index}-${index}`}
                          title={song.name}
                          artist={song.artist}
                          album={song.album}
                          imageUrl={song.image}
                          spotifyUrl={song.spotifyUrl}
                          isPlaying={isPlayingFromHome}
                          isNowPlaying={isCurrentPlaying}
                          isFavorite={isFav}
                          onPlayClick={() => playTrack(song, songs, 'home')}
                          onFavoriteClick={() => handleFavoriteToggle(song)}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Empty State
                <div className="max-h-[360px] sm:max-h-[500px] flex flex-col justify-start gap-6 overflow-y-auto pr-2 custom-scrollbar">
                  <RecommendationEmptyState />

                  {/* Mock previews to guide layout */}
                  <div className="space-y-4 pt-4 border-t border-neutral-900/60 shrink-0">
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider select-none">
                      Preview Placeholders (Offline Demo)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 opacity-45">
                      <SongCard title="Song Name Placeholder" artist="Artist Placeholder" album="Album Placeholder" />
                      <SongCard title="Song Name Placeholder" artist="Artist Placeholder" album="Album Placeholder" />
                      <SongCard title="Song Name Placeholder" artist="Artist Placeholder" album="Album Placeholder" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>


    </div>
  );
};

export default HomePage;

