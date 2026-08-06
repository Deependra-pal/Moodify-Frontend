import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import CameraPlaceholder from '../../FaceExpression/components/CameraPlaceholder';
import SongCard from '../components/SongCard';
import useRecommendations from '../hooks/useRecommendations';
import useFavorites from '../../favorites/hooks/useFavorites';
import usePlayer from '../hooks/usePlayer';
import { exchangeCodeForToken } from '../../../utils/spotifyAuth';
import { Music, AlertCircle, RefreshCw, Search } from 'lucide-react';
import api from '../../../services/api';
import { GridSkeleton } from '../../../components/common/Skeletons';

import PageContainer from '../../../components/common/PageContainer';

/**
 * HomePage container component.
 * Mobile-first responsive flow: Welcome -> Face Scan -> Music Curations.
 */
const HomePage = () => {
  const navigate = useNavigate();
  const { songs, loading, error, fetchRecommendations, currentEmotion, searchTracks } = useRecommendations();
  const [searchQuery, setSearchQuery] = useState('');
  const { favorites, addFavorite, removeFavorite } = useFavorites();
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
    <PageContainer header={<Navbar />} maxWidthClass="max-w-6xl">
        {/* STEP 1: Welcome Tagline & Header */}
        <HeroSection />

        {/* STEP 2, 3, 4: Emotion Scan and Live Detection Dashboard */}
        <div className="w-full">
          <CameraPlaceholder
            currentEmotion={currentEmotion}
            onRecommend={handleRecommend}
            isLoadingSongs={loading}
          />
        </div>

        {/* STEP 5: Search & Recommendations Section */}
        <div className="bg-[#121214] border border-white/10 rounded-2xl p-4 sm:p-7 shadow-xl space-y-5 sm:space-y-6 w-full animate-in slide-in-from-bottom-6 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="space-y-1">
              <h2 className="text-base sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                <Music className="h-5 w-5 sm:h-6 sm:w-6 text-[#1db954]" />
                {songs.length > 0 ? 'Recommended for your mood' : 'Search Tracks'}
              </h2>
              <p className="text-xs text-neutral-400 font-semibold leading-normal">
                {songs.length > 0
                  ? 'A curated collection of tracks matching your facial expression and emotional vibe.'
                  : 'Search for your favorite songs, artists, or singers manually without a face scan.'
                }
              </p>
            </div>
            {songs.length > 0 && (
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                {currentEmotion && (
                  <button
                    type="button"
                    onClick={() => handleRecommend(currentEmotion)}
                    disabled={loading}
                    className="flex items-center gap-1.5 bg-[#1f1f24] hover:bg-neutral-800 border border-white/10 active:scale-95 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold text-[#1db954] transition-all cursor-pointer disabled:opacity-50 min-h-[36px] touch-target"
                    title={`Get fresh songs for ${currentEmotion}`}
                  >
                    <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Vibes
                  </button>
                )}
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider bg-black/40 border border-white/5 px-3 py-1.5 rounded-full">
                  {songs.length} tracks
                </span>
              </div>
            )}
          </div>

          {/* Custom Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-lg">
            <div className="relative w-full flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by artist or track name..."
                className="w-full bg-[#18181c] border border-white/10 rounded-full pl-11 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#1db954] transition-colors h-11 sm:h-12"
              />
              <Search className="absolute left-4 top-3.5 sm:top-4 h-4 w-4 text-neutral-500 pointer-events-none" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-[#1db954] hover:bg-[#1ed760] text-black active:scale-95 px-6 py-3 rounded-full text-xs sm:text-sm font-black transition-all duration-150 cursor-pointer disabled:opacity-50 shrink-0 shadow-md min-h-[44px] touch-target"
            >
              Search
            </button>
          </form>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-500/10 p-3.5 text-xs text-red-400 border border-red-500/20 w-full">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-0.5">
                <p className="font-semibold">Failed to retrieve Spotify recommendations</p>
                <p className="text-[11px] text-neutral-400">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="pt-2">
              <GridSkeleton count={6} />
            </div>
          ) : songs.length > 0 ? (
            <div className="pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
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
            <div className="text-center py-6 text-neutral-500 text-xs font-semibold select-none border-t border-white/5 pt-6">
              💡 Tip: Start the face scanner above to detect your current mood automatically, or type keywords in the search bar to find songs manually!
            </div>
          )}
        </div>
    </PageContainer>
  );
};

export default HomePage;
