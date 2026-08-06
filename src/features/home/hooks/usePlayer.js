import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  setCurrentSong,
  setIsPlaying,
  setPlaybackPosition,
  setDuration,
  setVolumeState,
  setPlaylistQueue,
  setPlaybackSource,
  setIsPlayerVisible,
  setSpotifyTokenState,
  setDeviceIdState,
  setIsLoadingTrack,
  playTrackSuccess
} from '../slice/playerSlice';

/**
 * Custom hook to consume Redux Toolkit playerSlice state and actions.
 */
export const usePlayer = () => {
  const dispatch = useAppDispatch();
  const playerState = useAppSelector((state) => state.player);

  const playTrack = (track, queue = [], source = 'home') => {
    if (!track) return;
    dispatch(playTrackSuccess({ track, queue, source }));
  };

  const pauseTrack = () => {
    dispatch(setIsPlaying(false));
  };

  const resumeTrack = () => {
    dispatch(setIsPlaying(true));
  };

  const seekTrack = (posMs) => {
    dispatch(setPlaybackPosition(posMs));
  };

  const skipNext = () => {
    const { currentSong, playlistQueue } = playerState;
    if (!currentSong || !playlistQueue.length) return;
    const currentIndex = playlistQueue.findIndex(
      (s) => s.uri === currentSong.uri || (s.name === currentSong.name && s.artist === currentSong.artist)
    );
    if (currentIndex >= 0 && currentIndex < playlistQueue.length - 1) {
      dispatch(playTrackSuccess({ track: playlistQueue[currentIndex + 1], queue: playlistQueue, source: playerState.playbackSource }));
    }
  };

  const skipPrevious = () => {
    const { currentSong, playlistQueue } = playerState;
    if (!currentSong || !playlistQueue.length) return;
    const currentIndex = playlistQueue.findIndex(
      (s) => s.uri === currentSong.uri || (s.name === currentSong.name && s.artist === currentSong.artist)
    );
    if (currentIndex > 0) {
      dispatch(playTrackSuccess({ track: playlistQueue[currentIndex - 1], queue: playlistQueue, source: playerState.playbackSource }));
    }
  };

  const seekForward = () => {
    dispatch(setPlaybackPosition(Math.min(playerState.playbackPosition + 10000, playerState.duration || 300000)));
  };

  const seekBackward = () => {
    dispatch(setPlaybackPosition(Math.max(playerState.playbackPosition - 10000, 0)));
  };

  const changeVolume = (vol) => {
    dispatch(setVolumeState(parseFloat(vol)));
  };

  return {
    ...playerState,
    playTrack,
    pauseTrack,
    resumeTrack,
    seekTrack,
    skipNext,
    skipPrevious,
    seekForward,
    seekBackward,
    changeVolume,
    setSpotifyToken: (token) => dispatch(setSpotifyTokenState(token)),
    setIsPlayerVisible: (visible) => dispatch(setIsPlayerVisible(visible)),
    disconnectSpotify: () => dispatch(setSpotifyTokenState(null))
  };
};

export default usePlayer;
