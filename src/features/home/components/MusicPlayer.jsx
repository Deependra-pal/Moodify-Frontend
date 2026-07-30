import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePlayer } from '../../../context/PlayerContext';
import useFavorites from '../../favorites/hooks/useFavorites';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Volume2,
  X,
  ChevronDown,
  Heart,
  Shuffle,
  Repeat
} from 'lucide-react';
import defaultAlbum from '../../../assets/default_album.png';

/**
 * Spotify-inspired music playback controls.
 * Features a Bottom Mini Player that smoothly expands into a Full-Screen Player overlay.
 */
const MusicPlayer = () => {
  const {
    currentSong,
    playbackPosition,
    duration,
    isPlaying,
    isLoading,
    deviceId,
    playTrack,
    pauseTrack,
    resumeTrack,
    seekTrack,
    skipNext,
    skipPrevious,
    seekForward,
    seekBackward,
    spotifyToken,
    volume,
    changeVolume,
    isPlayerVisible,
    setIsPlayerVisible
  } = usePlayer();

  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // Listen for back navigation when full screen player is expanded (Android Back Button)
  useEffect(() => {
    const handlePopState = (e) => {
      if (isExpanded) {
        setIsExpanded(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isExpanded]);

  // Sync browser history state with player expansion
  useEffect(() => {
    if (isExpanded) {
      if (!window.history.state?.playerExpanded) {
        window.history.pushState({ playerExpanded: true }, '');
      }
    } else {
      if (window.history.state?.playerExpanded) {
        window.history.back();
      }
    }
  }, [isExpanded]);

  // Check if current playing song is favorited
  const isCurrentFavorite = useMemo(() => {
    if (!currentSong) return false;
    return favorites.some(
      (fav) =>
        fav.spotifyUri === currentSong.uri ||
        (fav.songName === currentSong.name && fav.artist === currentSong.artist)
    );
  }, [favorites, currentSong]);

  // Handle favoriting toggle directly from the player
  const handleFavoriteToggle = async (e) => {
    e.stopPropagation(); // Prevent opening full screen player
    if (!currentSong) return;
    try {
      if (isCurrentFavorite) {
        const favItem = favorites.find(
          (fav) =>
            fav.spotifyUri === currentSong.uri ||
            (fav.songName === currentSong.name && fav.artist === currentSong.artist)
        );
        if (favItem) {
          await removeFavorite(favItem._id);
        }
      } else {
        await addFavorite({
          songName: currentSong.name,
          artist: currentSong.artist,
          album: currentSong.album || 'Unknown Album',
          image: currentSong.image || '',
          spotifyUri: currentSong.uri || '',
          spotifyUrl: currentSong.spotifyUrl || ''
        });
      }
    } catch (err) {
      console.error('Failed to toggle favorite in player:', err);
    }
  };

  const handleProgressChange = (e) => {
    if (!currentSong) return;
    const value = parseInt(e.target.value, 10);
    seekTrack(value);
  };

  const formatTime = (ms) => {
    if (!ms || isNaN(ms)) return '0:00';
    const secs = Math.floor(ms / 1000);
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!isPlayerVisible) {
    if (currentSong) {
      return (
        <button
          onClick={() => setIsPlayerVisible(true)}
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] md:bottom-6 right-6 z-40 bg-[#1db954] hover:bg-[#1ed760] text-black h-12 px-5 rounded-full shadow-2xl active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-2 font-bold text-xs border border-black/10 animate-fade-in"
          title="Restore Music Player"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
          </span>
          Show Player
        </button>
      );
    }
    return null;
  }

  const title = currentSong ? (currentSong.name || 'Unknown Title') : (spotifyToken ? (!deviceId ? 'Initialising Player...' : 'No track selected') : 'Spotify not connected');
  const artist = currentSong ? (currentSong.artist || 'Unknown Artist') : (spotifyToken ? (!deviceId ? 'Setting up connection...' : 'Choose a track to play') : 'Please connect Spotify in Navbar');
  const coverImage = currentSong?.image || defaultAlbum;
  const progressPercent = ((playbackPosition || 0) / (duration || 100)) * 100;

  return (
    <>
      {/* ----------------- MINI PLAYER (Fixed on mobile, Block relative on desktop) ----------------- */}
      <div 
        onClick={() => {
          if (window.innerWidth < 768 && currentSong) {
            setIsExpanded(true);
          }
        }}
        className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:relative md:bottom-0 left-0 right-0 w-full h-20 bg-[#121212]/95 backdrop-blur-md border-t border-neutral-900 px-4 md:px-6 flex items-center justify-between gap-4 z-40 select-none md:cursor-default cursor-pointer md:hover:bg-[#121212]/95 hover:bg-neutral-900/40 transition-colors duration-200"
      >
        {/* Clickable progress slider at the very bottom edge of the mini player (Mobile only) */}
        {currentSong && (
          <div className="absolute bottom-0 left-0 right-0 h-1 group/mini-progress md:hidden" onClick={(e) => e.stopPropagation()}>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={playbackPosition || 0}
              onChange={handleProgressChange}
              className="absolute -bottom-1 left-0 w-full h-3 opacity-0 cursor-pointer z-50"
            />
            <div className="w-full h-1 bg-neutral-800 relative">
              <div 
                className="h-full bg-[#1db954] transition-all duration-100 relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover/mini-progress:opacity-100 transition-opacity"></div>
              </div>
            </div>
          </div>
        )}

        {/* Left Side: Track Info & Cover (Aligns left using flex-1) */}
        <div className="flex items-center gap-3 min-w-0 flex-1 justify-start">
          <img
            src={coverImage}
            alt={title}
            className="h-12 w-12 rounded-md object-cover border border-neutral-800 shrink-0 shadow-md"
          />
          <div className="min-w-0 max-w-[200px] md:max-w-xs">
            <h4 className={`text-xs sm:text-sm font-bold truncate ${isPlaying ? 'text-[#1db954]' : 'text-neutral-100'}`}>
              {title}
            </h4>
            <p className="text-[10px] sm:text-xs text-neutral-455 truncate">
              {artist}
            </p>
          </div>
          {currentSong && (
            <button
              onClick={handleFavoriteToggle}
              className={`p-2 transition-colors duration-100 shrink-0 cursor-pointer ${
                isCurrentFavorite ? 'text-red-500 fill-red-500 hover:text-red-400' : 'text-neutral-500 hover:text-neutral-350'
              }`}
            >
              <Heart className={`h-4.5 w-4.5 ${isCurrentFavorite ? 'fill-red-500 text-red-500' : 'fill-none'}`} />
            </button>
          )}
        </div>

        {/* Middle: Centered Playback Controls & Progress Scrubber (Hidden on mobile, centered on desktop) */}
        <div className="hidden md:flex flex-col items-center w-[400px] lg:w-[600px] shrink-0 space-y-1.5 justify-center">
          <div className="flex items-center gap-5">
            <button
              onClick={(e) => { e.stopPropagation(); seekBackward(); }}
              disabled={!currentSong}
              className="text-neutral-400 hover:text-white cursor-pointer transition-colors disabled:opacity-30"
              title="Backward 10 Seconds"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); skipPrevious(); }}
              disabled={!currentSong}
              className="text-neutral-400 hover:text-white cursor-pointer transition-transform active:scale-90 disabled:opacity-30"
              title="Previous Track"
            >
              <SkipBack className="h-5 w-5 fill-current" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); isPlaying ? pauseTrack() : resumeTrack(); }}
              disabled={!currentSong || isLoading}
              className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-transform cursor-pointer disabled:opacity-50"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <span className="h-4 w-4 rounded-full border-2 border-t-transparent border-black animate-spin"></span>
              ) : isPlaying ? (
                <Pause className="h-4 w-4 fill-current text-black" />
              ) : (
                <Play className="h-4 w-4 fill-current text-black ml-0.5" />
              )}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); skipNext(); }}
              disabled={!currentSong}
              className="text-neutral-400 hover:text-white cursor-pointer transition-transform active:scale-90 disabled:opacity-30"
              title="Next Track"
            >
              <SkipForward className="h-5 w-5 fill-current" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); seekForward(); }}
              disabled={!currentSong}
              className="text-neutral-400 hover:text-white cursor-pointer transition-colors disabled:opacity-30"
              title="Forward 10 Seconds"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 w-full text-[10px] text-neutral-455 font-semibold group">
            <span>{formatTime(playbackPosition)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={playbackPosition || 0}
              onChange={handleProgressChange}
              onClick={(e) => e.stopPropagation()}
              disabled={!currentSong}
              className="flex-1 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer outline-none transition-colors accent-[#1db954] hover:accent-[#1ed760] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:opacity-0 group-hover:[&::-webkit-slider-thumb]:opacity-100 [&::-webkit-slider-thumb]:transition-opacity [&::-webkit-slider-thumb]:duration-150"
              style={{
                background: `linear-gradient(to right, #1db954 ${progressPercent}%, #282828 ${progressPercent}%)`
              }}
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Side: Volume & Close Controls (Aligns right using flex-1) */}
        <div className="flex items-center justify-end gap-3 flex-1">
          <div className="hidden md:flex items-center gap-3 group/volume">
            <Volume2 className="h-4 w-4 text-neutral-400 shrink-0" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => changeVolume(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              disabled={!currentSong}
              className="w-24 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer outline-none transition-colors accent-[#1db954] hover:accent-[#1ed760] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:opacity-0 group-hover/volume:[&::-webkit-slider-thumb]:opacity-100 [&::-webkit-slider-thumb]:transition-opacity [&::-webkit-slider-thumb]:duration-150"
              style={{
                background: `linear-gradient(to right, #1db954 ${volume * 100}%, #282828 ${volume * 100}%)`
              }}
            />
          </div>

          {/* Mobile Playback Controls group (visible only on mobile) */}
          <div className="flex md:hidden items-center gap-3 shrink-0">
            {/* Previous track */}
            <button
              onClick={(e) => { e.stopPropagation(); skipPrevious(); }}
              disabled={!currentSong}
              className="text-neutral-400 active:text-white p-1 cursor-pointer"
              title="Previous Track"
            >
              <SkipBack className="h-4.5 w-4.5 fill-current" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={(e) => { e.stopPropagation(); isPlaying ? pauseTrack() : resumeTrack(); }}
              disabled={!currentSong || isLoading}
              className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center font-bold shadow-md cursor-pointer active:scale-95 transition-transform"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-t-transparent border-black animate-spin"></span>
              ) : isPlaying ? (
                <Pause className="h-3.5 w-3.5 fill-current text-black" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current text-black ml-0.5" />
              )}
            </button>

            {/* Next track */}
            <button
              onClick={(e) => { e.stopPropagation(); skipNext(); }}
              disabled={!currentSong}
              className="text-neutral-400 active:text-white p-1 cursor-pointer"
              title="Next Track"
            >
              <SkipForward className="h-4.5 w-4.5 fill-current" />
            </button>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); setIsPlayerVisible(false); }}
            className="text-neutral-400 hover:text-white cursor-pointer transition-colors p-2 hover:bg-neutral-800 rounded-full shrink-0"
            title="Minimize Player"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ----------------- FULL SCREEN MUSIC PLAYER (Slide-up modal overlay) ----------------- */}
      <div
        className={`fixed inset-0 z-50 bg-gradient-to-b from-[#241212] via-[#121212] to-[#121212] flex flex-col justify-between px-6 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] pt-[calc(1.5rem+env(safe-area-inset-top,0px))] transition-all duration-300 ease-out ${
          isExpanded
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-full opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* TOP BAR: Header and minimize chevron */}
        <div className="flex items-center justify-between w-full">
          <button 
            onClick={() => setIsExpanded(false)}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            <ChevronDown className="h-6 w-6" />
          </button>
          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 select-none">
            Now Playing
          </span>
          <div className="w-10"></div> {/* Spacer for symmetry */}
        </div>

        {/* COVER ARTWORK CONTAINER */}
        <div className="flex-1 flex items-center justify-center my-6 max-h-[40vh] sm:max-h-[50vh]">
          <div className="aspect-square w-[75vw] sm:w-[50vw] max-w-[320px] max-h-[320px] rounded-2xl overflow-hidden shadow-2xl border border-neutral-900/60 transition-transform duration-300 transform scale-100 hover:scale-102 select-none pointer-events-none">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          </div>
        </div>

        {/* SONG DETAILS & LIKE BUTTON ROW */}
        <div className="w-full max-w-[400px] mx-auto flex items-center justify-between mb-6">
          <div className="min-w-0 pr-4">
            <h2 className="text-xl sm:text-2xl font-black text-neutral-100 truncate tracking-tight">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 truncate mt-0.5">
              {artist}
            </p>
          </div>
          {currentSong && (
            <button
              onClick={handleFavoriteToggle}
              className={`p-3 rounded-full hover:bg-neutral-900 transition-all duration-150 active:scale-90 cursor-pointer ${
                isCurrentFavorite ? 'text-red-500' : 'text-neutral-400'
              }`}
            >
              <Heart className={`h-6 w-6 ${isCurrentFavorite ? 'fill-red-500 text-red-500' : 'fill-none'}`} />
            </button>
          )}
        </div>

        {/* PROGRESS SEEKER BAR SECTION */}
        <div className="w-full max-w-[400px] mx-auto space-y-2 mb-6 group">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={playbackPosition || 0}
            onChange={handleProgressChange}
            disabled={!currentSong}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer outline-none transition-all duration-200 accent-[#1db954] hover:accent-[#1ed760] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            style={{
              background: `linear-gradient(to right, #1db954 ${progressPercent}%, #282828 ${progressPercent}%)`
            }}
          />
          <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold select-none px-0.5">
            <span>{formatTime(playbackPosition)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* MAIN CONTROLS ROW */}
        <div className="w-full max-w-[400px] mx-auto flex items-center justify-between gap-4 mb-8">
          {/* Shuffle Toggle */}
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`p-2 transition-colors duration-150 cursor-pointer ${isShuffle ? 'text-[#1db954]' : 'text-neutral-400 hover:text-white'}`}
            title="Toggle Shuffle"
          >
            <Shuffle className="h-5 w-5" />
          </button>

          {/* Previous Track */}
          <button
            onClick={skipPrevious}
            disabled={!currentSong}
            className="p-3 text-neutral-200 hover:text-white transition-transform active:scale-90 disabled:opacity-20 cursor-pointer"
            title="Previous Track"
          >
            <SkipBack className="h-7 w-7 fill-current" />
          </button>

          {/* Large Main Play/Pause Button */}
          <button
            onClick={isPlaying ? pauseTrack : resumeTrack}
            disabled={!currentSong || isLoading}
            className="h-16 w-16 rounded-full bg-white text-black flex items-center justify-center font-bold shadow-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <span className="h-6 w-6 rounded-full border-3 border-t-transparent border-black animate-spin"></span>
            ) : isPlaying ? (
              <Pause className="h-6 w-6 fill-current text-black" />
            ) : (
              <Play className="h-6 w-6 fill-current text-black ml-1" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={skipNext}
            disabled={!currentSong}
            className="p-3 text-neutral-200 hover:text-white transition-transform active:scale-90 disabled:opacity-20 cursor-pointer"
            title="Next Track"
          >
            <SkipForward className="h-7 w-7 fill-current" />
          </button>

          {/* Repeat Toggle */}
          <button
            onClick={() => setIsRepeat(!isRepeat)}
            className={`p-2 transition-colors duration-150 cursor-pointer ${isRepeat ? 'text-[#1db954]' : 'text-neutral-400 hover:text-white'}`}
            title="Toggle Repeat"
          >
            <Repeat className="h-5 w-5" />
          </button>
        </div>

        {/* BOTTOM UTILITY / DEVICE DISPLAY FOOTER */}
        <div className="w-full text-center text-[10px] text-neutral-500 font-semibold tracking-wider select-none">
          {deviceId ? 'Spotify Web Player Connected' : 'Seeking Local Playback Device...'}
        </div>
      </div>
    </>
  );
};

export default MusicPlayer;
