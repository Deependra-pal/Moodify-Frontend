import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentSong: null,
  isPlaying: false,
  playbackPosition: 0,
  duration: 0,
  volume: 0.8,
  playlistQueue: [],
  playbackSource: 'home', // 'home' | 'favorites' | 'history'
  isPlayerVisible: true,
  spotifyToken: null,
  deviceId: null,
  isLoadingTrack: false
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentSong: (state, action) => {
      state.currentSong = action.payload;
    },
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    setPlaybackPosition: (state, action) => {
      state.playbackPosition = action.payload;
    },
    setDuration: (state, action) => {
      state.duration = action.payload;
    },
    setVolumeState: (state, action) => {
      state.volume = action.payload;
    },
    setPlaylistQueue: (state, action) => {
      state.playlistQueue = action.payload;
    },
    setPlaybackSource: (state, action) => {
      state.playbackSource = action.payload;
    },
    setIsPlayerVisible: (state, action) => {
      state.isPlayerVisible = action.payload;
    },
    setSpotifyTokenState: (state, action) => {
      state.spotifyToken = action.payload;
    },
    setDeviceIdState: (state, action) => {
      state.deviceId = action.payload;
    },
    setIsLoadingTrack: (state, action) => {
      state.isLoadingTrack = action.payload;
    },
    playTrackSuccess: (state, action) => {
      const { track, queue, source } = action.payload;
      state.currentSong = track;
      state.playlistQueue = queue || state.playlistQueue;
      state.playbackSource = source || state.playbackSource;
      state.isPlaying = true;
      state.isPlayerVisible = true;
      state.playbackPosition = 0;
      state.isLoadingTrack = false;
    }
  }
});

export const {
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
} = playerSlice.actions;

export default playerSlice.reducer;
