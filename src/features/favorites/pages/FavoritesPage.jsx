import React, { useState, useCallback, useMemo } from 'react';
import useFavorites from '../hooks/useFavorites';
import SongCard from '../../home/components/SongCard';
import { Heart } from 'lucide-react';
import usePlayer from '../../home/hooks/usePlayer';
import { GridSkeleton } from '../../../components/common/Skeletons';
import PageContainer, { PageHeader } from '../../../components/common/PageContainer';

/**
 * Favorites page displaying the collection of user's favorited songs.
 * Instant pause/resume toggle & matching Spotify Green active colors.
 */
const FavoritesPage = () => {
  const { favorites, loading, error, removeFavorite, clearAllFavorites } = useFavorites();
  const { playTrack, pauseTrack, resumeTrack, currentSong, isPlaying } = usePlayer();
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

  const headerElement = (
    <PageHeader
      title="My Favorite Tracks"
      subtitle={`${favorites.length} songs favorited • Your personal emotional soundtrack`}
      badge="Collection"
      icon={Heart}
      themeColor="red"
      actions={
        favorites.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="px-3.5 py-2 text-xs font-extrabold uppercase tracking-wider text-rose-400 hover:text-white border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl cursor-pointer transition-all active:scale-95 shrink-0 touch-target min-h-[44px]"
            title="Clear all favorites"
          >
            Clear All
          </button>
        )
      }
    />
  );

  return (
    <PageContainer header={headerElement}>
      {error && (
        <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-xs sm:text-sm text-red-400 border border-red-500/20">
          <p className="font-semibold">Failed to fetch favorites</p>
          <p className="text-xs text-neutral-400">{error}</p>
        </div>
      )}

      {loading ? (
        <GridSkeleton count={8} />
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {favorites.map((fav) => {
            const isRemoving = removingIds.includes(fav._id);
            const isCurrentPlaying =
              isPlaying &&
              currentSong &&
              ((currentSong.uri && currentSong.uri === fav.spotifyUri) ||
                (currentSong.spotifyUrl && currentSong.spotifyUrl === fav.spotifyUrl) ||
                (currentSong.name === fav.songName && currentSong.artist === fav.artist));

            const currentTrackObj = {
              name: fav.songName,
              artist: fav.artist,
              album: fav.album,
              image: fav.image,
              spotifyUrl: fav.spotifyUrl,
              uri: fav.spotifyUri
            };

            const onPlayClick = () => {
              if (isCurrentPlaying) {
                if (isPlaying) {
                  pauseTrack();
                } else {
                  resumeTrack();
                }
              } else {
                playTrack(currentTrackObj, playlistObjs, 'favorites');
              }
            };

            return (
              <div
                key={fav._id}
                className={`transition-all duration-300 ${
                  isRemoving ? 'scale-95 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
                }`}
              >
                <SongCard
                  title={fav.songName}
                  artist={fav.artist}
                  album={fav.album}
                  imageUrl={fav.image}
                  spotifyUrl={fav.spotifyUrl}
                  isPlaying={isCurrentPlaying}
                  isNowPlaying={isCurrentPlaying}
                  isFavorite={true}
                  onPlayClick={onPlayClick}
                  onFavoriteClick={() => handleRemove(fav._id)}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 space-y-4 select-none">
          <div className="h-16 w-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-xl">
            <Heart className="h-8 w-8 fill-current" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-lg font-black text-white">No Favorites Saved Yet</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Explore music recommendations on the Home screen and click the heart icon to curate your personal emotional playlist.
            </p>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default FavoritesPage;
