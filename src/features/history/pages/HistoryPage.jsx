import React, { useState, useEffect, useCallback, useMemo } from 'react';
import useHistory from '../hooks/useHistory';
import useFavorites from '../../favorites/hooks/useFavorites';
import { usePlayer } from '../../../context/PlayerContext';
import { History, Trash2, Play, Pause, Heart, RefreshCw } from 'lucide-react';
import defaultAlbum from '../../../assets/default_album.png';
import { HistoryItemSkeleton } from '../../../components/common/Skeletons';

// Relative play timestamp formatter (Pure helper moved outside to avoid re-creation)
const formatPlayedAt = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * History page displaying the chronological timeline of played tracks.
 * Provides clear history actions and favorites sync.
 */
const HistoryPage = () => {
  const { history, loading, error, fetchHistory, clearHistory } = useHistory();
  const { favorites, fetchFavorites, addFavorite, removeFavorite } = useFavorites();
  const { playTrack, pauseTrack, isPlaying, currentSong, playbackSource } = usePlayer();

  // Local snapshot of history list to maintain page stability while browsing
  // Pre-fill with context cache to prevent layout flashes on back-navigation
  const [displayHistory, setDisplayHistory] = useState(history);

  useEffect(() => {
    // Force fetch to get freshest DB records on mount, then write to displayHistory
    fetchHistory(true).then((data) => {
      if (data) {
        setDisplayHistory(data);
      }
    });
    fetchFavorites();
  }, [fetchHistory, fetchFavorites]);

  // Instantly clear displayHistory if history context gets emptied
  useEffect(() => {
    if (history.length === 0) {
      setDisplayHistory([]);
    }
  }, [history]);

  // Pre-mapped history playlist memoized to prevent N^2 allocations or inline mappings
  const historyPlaylist = useMemo(() => {
    return displayHistory.map(t => ({
      name: t.songName,
      artist: t.artist,
      album: t.album || 'Unknown Album',
      image: t.image || '',
      uri: t.spotifyUri || '',
      spotifyUrl: t.spotifyUrl || ''
    }));
  }, [displayHistory]);

  const getFavoriteItem = useCallback((track) => {
    const trackUri = track.spotifyUri;
    return favorites.find(
      (fav) =>
        (trackUri && fav.spotifyUri === trackUri) ||
        (fav.songName === track.songName && fav.artist === track.artist)
    );
  }, [favorites]);

  const handleFavoriteToggle = useCallback(async (track) => {
    const favItem = getFavoriteItem(track);
    try {
      if (favItem) {
        await removeFavorite(favItem._id);
      } else {
        const songDetails = {
          songName: track.songName,
          artist: track.artist,
          album: track.album || 'Unknown Album',
          image: track.image || '',
          spotifyUri: track.spotifyUri || '',
          spotifyUrl: track.spotifyUrl || ''
        };
        await addFavorite(songDetails);
      }
    } catch (err) {
      console.error('Failed to toggle favorite on history screen:', err);
    }
  }, [getFavoriteItem, addFavorite, removeFavorite]);

  return (
    <div className="flex-1 w-full bg-[#09090b] text-white flex flex-col font-sans">
      {/* Header Banner */}
      <header className="bg-gradient-to-b from-[#1b1b3a] to-[#09090b] px-4 sm:px-6 py-6 sm:py-8 md:py-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left w-full sm:w-auto">
            <div className="h-20 w-20 sm:h-28 sm:w-28 md:h-36 md:w-36 bg-gradient-to-br from-[#535353] to-[#191919] rounded-2xl flex items-center justify-center shadow-2xl shrink-0 border border-neutral-800">
              <History className="h-10 w-10 sm:h-14 sm:w-14 md:h-16 md:w-16 text-neutral-300 animate-pulse" />
            </div>
            <div className="space-y-1 sm:space-y-2 min-w-0">
              <span className="text-[10px] sm:text-xs uppercase font-black tracking-widest text-[#1db954]">
                History Log
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-white leading-none">
                Listening History
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-neutral-400">
                Review tracks you've scanned or favorited previously
              </p>
            </div>
          </div>

          {/* Action Button */}
          {displayHistory.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-2 bg-[#282828] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 active:scale-95 border border-neutral-800 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full text-[10px] sm:text-xs font-bold transition-all cursor-pointer shrink-0 self-center sm:self-auto"
            >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Clear All History
            </button>
          )}
        </div>
      </header>

      {/* Main viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-6">
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
            <p className="font-semibold">Failed to load history</p>
            <p className="text-xs text-neutral-455">{error}</p>
          </div>
        )}

        {loading && displayHistory.length === 0 ? (
          <div className="space-y-3">
            <HistoryItemSkeleton />
            <HistoryItemSkeleton />
            <HistoryItemSkeleton />
            <HistoryItemSkeleton />
            <HistoryItemSkeleton />
          </div>
        ) : displayHistory.length > 0 ? (
          <div className="bg-[#181818] border border-neutral-900 rounded-2xl overflow-hidden shadow-xl">
            {/* Header Columns */}
            <div className="grid grid-cols-12 px-3 sm:px-6 py-3 border-b border-neutral-900 text-xs font-black tracking-wider text-neutral-500 uppercase select-none">
              <span className="col-span-2 sm:col-span-1 text-center">Play</span>
              <span className="col-span-6 sm:col-span-5 md:col-span-6">Track Info</span>
              <span className="hidden sm:block sm:col-span-3 md:col-span-2">Album</span>
              <span className="col-span-3 sm:col-span-2 text-right">Time Played</span>
              <span className="col-span-1 text-center">Fav</span>
            </div>

            {/* List Rows */}
            <div className="divide-y divide-neutral-900/60 w-full">
              {displayHistory.map((track, index) => {
                const isFavorited = !!getFavoriteItem(track);
                const trackToPlay = historyPlaylist[index];
                const isCurrentPlaying =
                  isPlaying &&
                  currentSong &&
                  ((currentSong.uri && currentSong.uri === track.spotifyUri) ||
                    (currentSong.spotifyUrl && currentSong.spotifyUrl === track.spotifyUrl) ||
                    (currentSong.name === track.songName && currentSong.artist === track.artist));

                const isPlayingFromHistory = isCurrentPlaying && playbackSource === 'history';

                return (
                  <div
                    key={track._id || index}
                    onClick={() => {
                      if (isPlayingFromHistory) {
                        pauseTrack();
                      } else {
                        playTrack(trackToPlay, historyPlaylist, 'history');
                      }
                    }}
                    className="grid grid-cols-12 items-center px-3 sm:px-6 py-4 hover:bg-[#282828]/60 cursor-pointer transition-colors duration-150 group"
                  >
                    {/* Play / Pause / Load Control */}
                    <div className="col-span-2 sm:col-span-1 flex justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPlayingFromHistory) {
                            pauseTrack();
                          } else {
                            playTrack(trackToPlay, historyPlaylist, 'history');
                          }
                        }}
                        className={`h-11 w-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 touch-target min-h-[44px] min-w-[44px] ${isPlayingFromHistory
                          ? 'bg-[#1db954] text-black font-bold scale-105 shadow-lg shadow-[#1db954]/25'
                          : 'bg-white hover:bg-neutral-200 text-black'
                          }`}
                        title={isPlayingFromHistory ? 'Pause' : 'Play'}
                      >
                        {isPlayingFromHistory ? (
                          <Pause className="h-4 w-4 fill-current text-black" />
                        ) : (
                          <Play className="h-4 w-4 fill-current text-black ml-0.5" />
                        )}
                      </button>
                    </div>

                    {/* Track Info */}
                    <div className="col-span-6 sm:col-span-5 md:col-span-6 flex items-center gap-3">
                      <img
                        src={track.image || defaultAlbum}
                        alt={track.songName}
                        className="h-10 w-10 rounded object-cover border border-neutral-800 shrink-0 select-none"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className={`font-bold text-xs sm:text-sm truncate select-none flex-1 ${isCurrentPlaying ? 'text-[#1db954]' : 'text-neutral-200'}`}>
                            {track.songName}
                          </h4>
                          {isCurrentPlaying && (
                            <span className="text-[7.5px] text-[#1db954] bg-[#1db954]/10 border border-[#1db954]/15 px-1.5 py-0.5 rounded font-black tracking-wider uppercase shrink-0 select-none">
                              Playing
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] sm:text-xs text-neutral-450 truncate select-none">
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    {/* Album Column */}
                    <span className="hidden sm:block sm:col-span-3 md:col-span-2 text-xs sm:text-sm text-neutral-450 truncate select-none">
                      {track.album || 'Unknown Album'}
                    </span>

                    {/* Time Played */}
                    <span className="col-span-3 sm:col-span-2 text-right text-[10px] sm:text-xs font-semibold text-neutral-500 select-none">
                      {formatPlayedAt(track.playedAt)}
                    </span>

                    {/* Favorite Button */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavoriteToggle(track);
                        }}
                        className={`transition-colors cursor-pointer hover:scale-110 active:scale-90 duration-100 ${isFavorited ? 'text-red-500 hover:text-red-400' : 'text-neutral-600 hover:text-red-500 active:text-red-500'
                          }`}
                      >
                        <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'fill-none'}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-20 space-y-4 border border-dashed border-neutral-800 rounded-2xl max-w-xl mx-auto p-6 bg-neutral-900/20">
            <div className="h-16 w-16 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-neutral-500">
              <History className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-neutral-350">Listening history is empty</h3>
              <p className="text-xs text-neutral-555 max-w-xs mx-auto">
                Your expression-triggered listening records will display here.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;
