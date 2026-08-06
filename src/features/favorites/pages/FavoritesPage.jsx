import React, { useState, useEffect, useCallback, useMemo } from 'react';
import useFavorites from '../hooks/useFavorites';
import SongCard from '../../home/components/SongCard';
import { Heart, Music, RefreshCw } from 'lucide-react';
import usePlayer from '../../home/hooks/usePlayer';
import { GridSkeleton } from '../../../components/common/Skeletons';

/**
 * Favorites page displaying the collection of user's favorited songs.
 * Integrates queue loading and listing features.
 */
const FavoritesPage = () => {
  const { favorites, loading, error, fetchFavorites, removeFavorite, clearAllFavorites } = useFavorites();
  const { playTrack, currentSong, isPlaying, playbackSource } = usePlayer();
  const [removingIds, setRemovingIds] = useState([]);



  const handleClearAll = useCallback(async () => {
    if (window.confirm('Are you sure you want to clear all your favorites?')) {
      try {
        await clearAllFavorites();
      } catch (err) {
        console.error('Clear all favorites error:', err);
      }
    }
  }, [clearAllFavorites]);

  const handleRemove = useCallback((favId) => {
    if (removingIds.includes(favId)) return;
    setRemovingIds((prev) => [...prev, favId]);
    setTimeout(async () => {
      try {
        await removeFavorite(favId);
      } catch (err) {
        setRemovingIds((prev) => prev.filter((id) => id !== favId));
        alert('Failed to remove from favorites. Please try again.');
      }
    }, 300);
  }, [removeFavorite, removingIds]);

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
    <div className="flex-1 w-full bg-[#09090b] text-white flex flex-col font-sans">
      {/* Header Banner */}
      <header className="bg-gradient-to-b from-red-900/40 to-[#09090b] px-4 sm:px-6 py-6 sm:py-8 md:py-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
          <div className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 bg-gradient-to-br from-red-600 to-red-950 rounded-2xl flex items-center justify-center shadow-2xl shrink-0">
            <Heart className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 text-white fill-current animate-pulse" />
          </div>
          <div className="flex-1 flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 w-full min-w-0">
            <div className="space-y-1 sm:space-y-2 text-center sm:text-left min-w-0">
              <span className="text-[10px] sm:text-xs uppercase font-black tracking-widest text-red-500">
                Collection
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-white leading-none">
                My Favorite Tracks
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-neutral-400">
                {favorites.length} songs favorited • Your personal emotional soundtrack
              </p>
            </div>
            {favorites.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700 bg-neutral-950/40 hover:bg-neutral-900 rounded-lg cursor-pointer transition-all active:scale-95 shrink-0 self-center sm:self-end sm:mb-1"
                title="Clear all favorites"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-6">
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
            <p className="font-semibold">Failed to fetch favorites</p>
            <p className="text-xs text-neutral-455">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="pt-2">
            <GridSkeleton count={5} />
          </div>
        ) : favorites.length > 0 ? (
          <div className="w-full max-h-[calc(100vh-18rem)] sm:max-h-[calc(100vh-20rem)] overflow-y-auto custom-scrollbar p-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favorites.map((fav, index) => {
                const isCurrentPlaying =
                  isPlaying &&
                  currentSong &&
                  ((currentSong.uri && currentSong.uri === (fav.spotifyUri || fav.uri)) ||
                    (currentSong.spotifyUrl && currentSong.spotifyUrl === fav.spotifyUrl) ||
                    (currentSong.name === fav.songName && currentSong.artist === fav.artist));

                const playObj = playlistObjs[index];
                const isRemoving = removingIds.includes(fav._id);
                const isPlayingFromFavorites = isCurrentPlaying && playbackSource === 'favorites';

                return (
                  <div
                    key={fav._id || index}
                    className={`transition-all duration-300 ease-out overflow-hidden ${isRemoving
                      ? 'max-h-0 opacity-0 scale-95 pointer-events-none'
                      : 'max-h-[300px] opacity-100 scale-100'
                      }`}
                  >
                    <SongCard
                      title={fav.songName}
                      artist={fav.artist}
                      album={fav.album}
                      imageUrl={fav.image}
                      spotifyUrl={fav.spotifyUrl}
                      isPlaying={isPlayingFromFavorites}
                      isNowPlaying={isCurrentPlaying}
                      isFavorite={!isRemoving}
                      isRemoving={isRemoving}
                      onPlayClick={() => playTrack(playObj, playlistObjs, 'favorites')}
                      onFavoriteClick={() => handleRemove(fav._id)}
                    />
                  </div>
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
