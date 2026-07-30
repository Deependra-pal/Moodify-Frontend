import React, { useEffect, useCallback, useMemo } from 'react';
import useFavorites from '../hooks/useFavorites';
import SongCard from '../../home/components/SongCard';
import { Heart, Music, RefreshCw } from 'lucide-react';
import { usePlayer } from '../../../context/PlayerContext';

/**
 * Favorites page displaying the collection of user's favorited songs.
 * Integrates queue loading and listing features.
 */
const FavoritesPage = () => {
  const { favorites, loading, error, fetchFavorites, removeFavorite, clearAllFavorites } = useFavorites();
  const { playTrack, currentSong, isPlaying } = usePlayer();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleClearAll = useCallback(async () => {
    if (window.confirm('Are you sure you want to clear all your favorites?')) {
      try {
        await clearAllFavorites();
      } catch (err) {
        console.error('Clear all favorites error:', err);
      }
    }
  }, [clearAllFavorites]);

  const playlistObjs = useMemo(() => {
    return favorites.map((f) => ({
      name: f.songName,
      artist: f.artist,
      album: f.album,
      image: f.image,
      uri: f.spotifyUri,
      spotifyUrl: f.spotifyUrl
    }));
  }, [favorites]);

  return (
    <div className="flex-1 min-h-screen bg-[#121212] text-white flex flex-col font-sans">
      {/* Header Banner */}
      <header className="bg-gradient-to-b from-red-900/40 to-[#121212] px-4 sm:px-6 py-12 border-b border-neutral-900/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="h-32 w-32 md:h-40 md:w-40 bg-gradient-to-br from-red-600 to-red-950 rounded-2xl flex items-center justify-center shadow-2xl shrink-0">
            <Heart className="h-16 w-16 md:h-20 md:w-20 text-white fill-current animate-pulse" />
          </div>
          <div className="flex-1 flex flex-col md:flex-row md:items-end justify-between gap-6 w-full min-w-0">
            <div className="space-y-2 text-center md:text-left min-w-0">
              <span className="text-xs uppercase font-black tracking-widest text-red-500">
                Collection
              </span>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                My Favorite Tracks
              </h1>
              <p className="text-sm font-semibold text-neutral-400">
                {favorites.length} songs favorited • Your personal emotional soundtrack
              </p>
            </div>
            {favorites.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700 bg-neutral-950/40 hover:bg-neutral-900 rounded-lg cursor-pointer transition-all active:scale-95 shrink-0 self-center md:self-end mb-1"
                title="Clear all favorites"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-6 pb-3 sm:py-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
            <p className="font-semibold">Failed to fetch favorites</p>
            <p className="text-xs text-neutral-450">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="h-10 w-10 text-red-500 animate-spin" />
            <p className="text-sm font-semibold tracking-wider text-neutral-400">
              Loading your collection...
            </p>
          </div>
        ) : favorites.length > 0 ? (
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favorites.map((fav, index) => {
                const isCurrentPlaying =
                  isPlaying &&
                  currentSong &&
                  ((currentSong.uri && currentSong.uri === (fav.spotifyUri || fav.uri)) ||
                    (currentSong.spotifyUrl && currentSong.spotifyUrl === fav.spotifyUrl) ||
                    (currentSong.name === fav.songName && currentSong.artist === fav.artist));

                const playObj = playlistObjs[index];

                return (
                  <SongCard
                    key={fav._id || index}
                    title={fav.songName}
                    artist={fav.artist}
                    album={fav.album}
                    imageUrl={fav.image}
                    spotifyUrl={fav.spotifyUrl}
                    isPlaying={isCurrentPlaying}
                    isFavorite={true}
                    onPlayClick={() => playTrack(playObj, playlistObjs)}
                    onFavoriteClick={() => removeFavorite(fav._id)}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-20 space-y-4 border border-dashed border-neutral-800 rounded-2xl max-w-xl mx-auto p-6 bg-neutral-900/20">
            <div className="h-16 w-16 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-neutral-500">
              <Heart className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-neutral-350">No favorite tracks yet</h3>
              <p className="text-xs text-neutral-550 max-w-xs mx-auto">
                Any songs you favorite while scanning your expressions on the Home screen will appear here.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FavoritesPage;
