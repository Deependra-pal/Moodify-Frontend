import React, { useCallback, useMemo } from 'react';
import useHistory from '../hooks/useHistory';
import useFavorites from '../../favorites/hooks/useFavorites';
import usePlayer from '../../home/hooks/usePlayer';
import { History, Trash2, Heart, Play, Pause, Music, Clock, Calendar } from 'lucide-react';
import defaultAlbum from '../../../assets/default_album.png';
import { HistoryItemSkeleton } from '../../../components/common/Skeletons';
import PageContainer, { PageHeader } from '../../../components/common/PageContainer';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const getDateKey = (dateStr) => {
  if (!dateStr) return 'Other';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Other';
  return d.toDateString();
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return 'Earlier';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Earlier';

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

/**
 * Spotify-Authentic Listening History Page.
 * Horizontal list layout grouped by day (Today, Yesterday, Date), with relative day/ago badge.
 */
const HistoryPage = () => {
  const { history, loading, error, clearHistory } = useHistory();
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const { playTrack, pauseTrack, isPlaying, currentSong, playbackSource } = usePlayer();

  const displayHistory = history;

  const historyPlaylist = useMemo(() => {
    return displayHistory.map((t) => ({
      name: t.songName,
      artist: t.artist,
      album: t.album || 'Unknown Album',
      image: t.image || defaultAlbum,
      uri: t.spotifyUri || '',
      spotifyUrl: t.spotifyUrl || ''
    }));
  }, [displayHistory]);

  const getFavoriteItem = useCallback(
    (track) => {
      return favorites.find(
        (f) =>
          (f.spotifyUri && f.spotifyUri === track.spotifyUri) ||
          (f.spotifyUrl && f.spotifyUrl === track.spotifyUrl) ||
          (f.songName === track.songName && f.artist === track.artist)
      );
    },
    [favorites]
  );

  const handleFavoriteToggle = useCallback(
    async (track) => {
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
    },
    [getFavoriteItem, addFavorite, removeFavorite]
  );

  // Group history items by date key
  const groupedSections = useMemo(() => {
    const sectionsMap = new Map();

    displayHistory.forEach((track, index) => {
      const key = getDateKey(track.playedAt || track.createdAt);
      if (!sectionsMap.has(key)) {
        sectionsMap.set(key, {
          key,
          label: formatDateLabel(track.playedAt || track.createdAt),
          dateStr: track.playedAt || track.createdAt,
          items: []
        });
      }
      sectionsMap.get(key).items.push({ track, index });
    });

    return Array.from(sectionsMap.values());
  }, [displayHistory]);

  const headerElement = (
    <PageHeader
      title="Listening History"
      subtitle={`${displayHistory.length} tracks played • Grouped by date & time`}
      badge="History Log"
      icon={History}
      gradient="from-[#1b1b3a] via-[#121226] to-[#09090b]"
      actions={
        displayHistory.length > 0 && (
          <button
            type="button"
            onClick={clearHistory}
            className="flex items-center gap-2 bg-[#282828] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 active:scale-95 border border-neutral-800 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 touch-target min-h-[44px]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear History
          </button>
        )
      }
    />
  );

  return (
    <PageContainer header={headerElement}>
      {error && (
        <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-xs sm:text-sm text-red-400 border border-red-500/20">
          <p className="font-semibold">Failed to load history</p>
          <p className="text-xs text-neutral-400">{error}</p>
        </div>
      )}

      {loading && displayHistory.length === 0 ? (
        <div className="space-y-3">
          <HistoryItemSkeleton />
          <HistoryItemSkeleton />
          <HistoryItemSkeleton />
          <HistoryItemSkeleton />
        </div>
      ) : groupedSections.length > 0 ? (
        groupedSections.map((section) => (
          <div key={section.key} className="space-y-3">
            {/* Day / Date Separator Badge */}
            <div className="flex items-center gap-2 px-1">
              <Calendar className="h-4 w-4 text-[#1db954]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                {section.label}
              </h3>
              <div className="flex-1 h-px bg-white/5 ml-2" />
            </div>

            {/* Individual Song Card Boxes List */}
            <div className="space-y-2.5">
              {section.items.map(({ track, index }) => {
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
                    className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer group gap-3 sm:gap-4 shadow-md ${
                      isPlayingFromHistory
                        ? 'bg-[#122216] border-[#1db954]/60 shadow-[#1db954]/10'
                        : 'bg-[#121214] hover:bg-[#18181c] border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Left Controls & Album Cover */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      {/* Play / Pause Control */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPlayingFromHistory) {
                            pauseTrack();
                          } else {
                            playTrack(trackToPlay, historyPlaylist, 'history');
                          }
                        }}
                        className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 active:scale-95 touch-target ${
                          isPlayingFromHistory
                            ? 'bg-[#1db954] text-black font-bold scale-105 shadow-lg shadow-[#1db954]/30'
                            : 'bg-[#1f1f24] hover:bg-[#1db954] text-white hover:text-black border border-white/10'
                        }`}
                        title={isPlayingFromHistory ? 'Pause' : 'Play'}
                      >
                        {isPlayingFromHistory ? (
                          <Pause className="h-4 w-4 fill-current text-black" />
                        ) : (
                          <Play className="h-4 w-4 fill-current text-current ml-0.5" />
                        )}
                      </button>

                      {/* Artwork Image */}
                      <img
                        src={track.image || defaultAlbum}
                        alt={track.songName}
                        className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl object-cover border border-white/10 shrink-0 select-none shadow-sm"
                      />

                      {/* Track Info */}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h4
                          className={`text-xs sm:text-sm font-black truncate leading-tight ${
                            isPlayingFromHistory ? 'text-[#1db954]' : 'text-white group-hover:text-[#1db954] transition-colors'
                          }`}
                        >
                          {track.songName}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-zinc-400 font-medium truncate">
                          {track.artist} {track.album ? `• ${track.album}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Right Actions & Time Badge */}
                    <div className="shrink-0 flex items-center gap-2 sm:gap-3 text-right">
                      <span className="text-[10px] sm:text-xs font-bold text-zinc-400 flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-full border border-white/5">
                        <Clock className="h-3 w-3 text-zinc-500" />
                        {formatTimeAgo(track.playedAt || track.createdAt)}
                      </span>

                      {/* Favorite Heart Action */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavoriteToggle(track);
                        }}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-white/5 rounded-xl transition-all cursor-pointer touch-target shrink-0"
                        title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            isFavorited ? 'text-red-500 fill-current' : 'hover:text-red-400'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 space-y-4 border border-dashed border-neutral-800 rounded-2xl max-w-xl mx-auto p-6 bg-neutral-900/20 my-auto select-none">
          <div className="h-16 w-16 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-neutral-500">
            <Music className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-neutral-350">No listening history yet</h3>
            <p className="text-xs text-neutral-550 max-w-xs mx-auto">
              Any songs you stream or scan on Moodify will automatically be logged here.
            </p>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default HistoryPage;
