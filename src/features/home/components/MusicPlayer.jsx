import React from 'react';
import { usePlayer } from '../../../context/PlayerContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Volume2,
  X
} from 'lucide-react';
import defaultAlbum from '../../../assets/default_album.png';

/**
 * Spotify-inspired bottom floating audio playback control deck.
 * Interfaces with PlayerContext to manage play/pause, seek, skip, and time skip buttons.
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
          className="fixed bottom-20 md:bottom-6 right-6 z-40 bg-[#1db954] hover:bg-[#1ed760] text-black h-12 px-5 rounded-full shadow-2xl active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-2 font-bold text-xs border border-black/10"
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

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 h-20 bg-[#121212]/95 backdrop-blur-md border-t border-neutral-900 px-4 md:px-6 flex items-center justify-between gap-4 z-40 select-none">
      {/* LEFT PANEL: Track Info */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <img
          src={coverImage}
          alt={title}
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-md object-cover border border-neutral-800 shrink-0"
        />
        <div className="min-w-0">
          <h4 className="text-xs sm:text-sm font-bold text-neutral-100 truncate">
            {title}
          </h4>
          <p className="text-[10px] sm:text-xs text-neutral-400 truncate">
            {artist}
          </p>
        </div>
      </div>

      {/* MIDDLE PANEL: Controls & Progress Bar */}
      <div className="flex flex-col items-center shrink-0 px-1 sm:px-4 max-w-[45%] md:max-w-[600px] space-y-1 sm:space-y-1.5">
        {/* Playback Action Control Row */}
        <div className="flex items-center gap-2 sm:gap-5">
          {/* Back 10 Seconds */}
          <button
            onClick={seekBackward}
            disabled={!currentSong}
            className="text-neutral-400 hover:text-white cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Backward 10 Seconds"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Previous Track */}
          <button
            onClick={skipPrevious}
            disabled={!currentSong}
            className="text-neutral-400 hover:text-white cursor-pointer transition-transform duration-100 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous Track"
          >
            <SkipBack className="h-5 w-5 fill-current" />
          </button>

          {/* Play / Pause / Loading State */}
          <button
            onClick={isPlaying ? pauseTrack : resumeTrack}
            disabled={!currentSong || isLoading}
            className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Next Track */}
          <button
            onClick={skipNext}
            disabled={!currentSong}
            className="text-neutral-400 hover:text-white cursor-pointer transition-transform duration-100 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next Track"
          >
            <SkipForward className="h-5 w-5 fill-current" />
          </button>

          {/* Forward 10 Seconds */}
          <button
            onClick={seekForward}
            disabled={!currentSong}
            className="text-neutral-400 hover:text-white cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Forward 10 Seconds"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>

        {/* Scrubber Progress Bar */}
        <div className="flex items-center gap-2 sm:gap-3 w-full text-[10px] text-neutral-400 font-medium">
          <span>{formatTime(playbackPosition)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={playbackPosition || 0}
            onChange={handleProgressChange}
            disabled={!currentSong}
            className="flex-1 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#1db954] hover:accent-[#1ed760] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(to right, #1db954 ${((playbackPosition || 0) / (duration || 100)) * 100}%, #282828 ${((playbackPosition || 0) / (duration || 100)) * 100}%)`
            }}
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* RIGHT PANEL: Volume & Close Controls */}
      <div className="flex items-center justify-end gap-2 pr-1 sm:pr-2 shrink-0">
        <div className="hidden md:flex items-center gap-3">
          <Volume2 className="h-4 w-4 text-neutral-400 shrink-0" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => changeVolume(e.target.value)}
            disabled={!currentSong}
            className="w-24 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#1db954] hover:accent-[#1ed760] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(to right, #1db954 ${volume * 100}%, #282828 ${volume * 100}%)`
            }}
          />
        </div>
        <button
          onClick={() => setIsPlayerVisible(false)}
          className="text-neutral-400 hover:text-white cursor-pointer transition-colors p-1.5 hover:bg-neutral-800 rounded-full shrink-0"
          title="Minimize Player"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default MusicPlayer;
