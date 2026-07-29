import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import useRecommendations from '../features/home/hooks/useRecommendations';
import { getSpotifyAccessToken, logoutSpotify } from '../utils/spotifyAuth';
import { HistoryContext } from '../features/history/context/HistoryContext';

export const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const { saveHistory } = useContext(HistoryContext) || {};
  const [currentSong, setCurrentSong] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [playbackPosition, setPlaybackPosition] = useState(0); // in ms
  const [duration, setDuration] = useState(0); // in ms
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [spotifyToken, setSpotifyToken] = useState(() => window.localStorage.getItem('spotify_access_token') || null);
  const [localPlaylist, setLocalPlaylist] = useState([]);
  const [volume, setVolume] = useState(0.5);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  const playerRef = useRef(null);
  const { songs: recommendedSongs } = useRecommendations();

  // Update token from localStorage periodically or when active
  const checkToken = useCallback(async () => {
    const token = await getSpotifyAccessToken();
    if (token) {
      setSpotifyToken(token);
    } else {
      setSpotifyToken(null);
    }
  }, []);

  useEffect(() => {
    checkToken();
  }, [checkToken]);

  // Player Instantiation Callback
  const initPlayer = useCallback(() => {
    if (!spotifyToken) {
      return;
    }
    if (!window.Spotify || !window.Spotify.Player) {
      return;
    }
    if (playerRef.current) {
      return;
    }

    const player = new window.Spotify.Player({
      name: 'Moodify Web Player',
      getOAuthToken: async (cb) => {
        const freshToken = await getSpotifyAccessToken();
        cb(freshToken || spotifyToken);
      },
      volume: 0.5
    });

    playerRef.current = player;

    // Error Listeners
    player.addListener('initialization_error', ({ message }) => {
      console.error('Spotify Player Initialization Error:', message);
    });
    player.addListener('authentication_error', ({ message }) => {
      console.error('Spotify Player Authentication Error:', message);
      logoutSpotify();
      setSpotifyToken(null);
    });
    player.addListener('account_error', ({ message }) => {
      console.error('Spotify Player Account Error:', message);
    });
    player.addListener('playback_error', ({ message }) => {
      console.error('Spotify Player Playback Error:', message);
    });

    // Playback state updates
    player.addListener('player_state_changed', (state) => {
      if (!state) {
        return;
      }

      const currentTrack = state.track_window.current_track;

      setIsPlaying(!state.paused);
      setPlaybackPosition(state.position);
      setDuration(state.duration);

      if (currentTrack) {
        const songData = {
          name: currentTrack.name,
          artist: currentTrack.artists.map(a => a.name).join(', '),
          album: currentTrack.album.name,
          image: currentTrack.album.images[0]?.url || '',
          uri: currentTrack.uri
        };
        setCurrentSong(songData);
      }
    });

    // Ready Listener
    player.addListener('ready', ({ device_id }) => {
      setDeviceId(device_id);
      setIsLoading(false);
    });

    // Not Ready Listener
    player.addListener('not_ready', ({ device_id }) => {
      setDeviceId(null);
    });

    player.connect().then(success => {
      if (!success) {
        console.error('Spotify Player failed to connect.');
      }
    }).catch(err => {
      console.error('Connect exception:', err);
    });
  }, [spotifyToken]);

  // Load SDK Script dynamically and register ready listener on mount
  useEffect(() => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      window.spotifySDKLoaded = true;
      if (spotifyToken) {
        initPlayer();
      }
    };

    if (!document.getElementById('spotify-player-script')) {
      const script = document.createElement('script');
      script.id = 'spotify-player-script';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    } else {
      if (window.Spotify && window.Spotify.Player) {
        window.onSpotifyWebPlaybackSDKReady();
      }
    }
  }, [spotifyToken, initPlayer]);

  // Synchronize player mount on token updates
  useEffect(() => {
    if (spotifyToken) {
      if (window.Spotify && window.Spotify.Player) {
        initPlayer();
      }
    } else {
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
        setDeviceId(null);
        setCurrentSong(null);
        setIsPlaying(false);
      }
    }
  }, [spotifyToken, initPlayer]);

  // Synchronous tick simulation for playback position
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setPlaybackPosition((prev) => {
          if (prev + 1000 >= duration) {
            clearInterval(timer);
            return duration;
          }
          return prev + 1000;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, duration]);

  // Trigger Spotify Playback
  const playTrack = useCallback(async (track, playlist = []) => {
    console.log('playTrack invoked with:', { track, playlistSize: playlist.length, deviceId });
    const activePlaylist = playlist.length > 0 ? playlist : recommendedSongs;
    const index = activePlaylist.findIndex(
      (p) => (p.uri && p.uri === track.uri) || (p.spotifyUrl && p.spotifyUrl === track.spotifyUrl) || (p.name === track.name && p.artist === track.artist)
    );

    if (!deviceId) {
      console.warn('playTrack aborting: deviceId is missing');
      return;
    }

    setLocalPlaylist(activePlaylist);
    setCurrentSongIndex(index !== -1 ? index : 0);
    setIsLoading(true);

    try {
      const activeToken = await getSpotifyAccessToken();
      const targetUri = track.uri || track.spotifyUri;
      console.log('Attempting playback of targetUri:', targetUri);

      const response = await axios.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          uris: [targetUri]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeToken || spotifyToken}`
          }
        }
      );

      if (response.status === 200 || response.status === 204 || response.status === 202) {
        console.log('Playback API request succeeded');
        setCurrentSong(track);
        setIsPlaying(true);
        setPlaybackPosition(0);
        setIsPlayerVisible(true);

        // Save to backend listening history
        if (saveHistory) {
          try {
            await saveHistory({
              songName: track.name || track.songName,
              artist: track.artist,
              album: track.album || 'Unknown Album',
              image: track.image || '',
              spotifyUri: targetUri,
              spotifyUrl: track.spotifyUrl || ''
            });
          } catch (historyErr) {
            console.error('Failed to save track to history:', historyErr);
          }
        }
      } else {
        console.error('Spotify Play API Failed. HTTP Status:', response.status, 'Response:', response.data);
      }
    } catch (err) {
      console.error('Play API exception:', err.response?.data || err.message || err);
    } finally {
      setIsLoading(false);
    }
  }, [deviceId, spotifyToken, recommendedSongs, saveHistory]);

  // Pause track directly on SDK player
  const pauseTrack = useCallback(async () => {
    if (playerRef.current) {
      try {
        await playerRef.current.pause();
        setIsPlaying(false);
      } catch (err) {
        console.error('Spotify SDK pause failure:', err);
      }
    }
  }, []);

  // Resume track directly on SDK player
  const resumeTrack = useCallback(async () => {
    if (playerRef.current) {
      try {
        await playerRef.current.resume();
        setIsPlaying(true);
      } catch (err) {
        console.error('Spotify SDK resume failure:', err);
      }
    }
  }, []);

  // Seek track to absolute position (ms)
  const seekTrack = useCallback(async (posMs) => {
    if (playerRef.current) {
      try {
        await playerRef.current.seek(posMs);
        setPlaybackPosition(posMs);
      } catch (err) {
        console.error('Spotify SDK seek failure:', err);
      }
    }
  }, []);

  // Skip Next from local playlist or recommended list
  const skipNext = useCallback(() => {
    const playlistToUse = localPlaylist.length > 0 ? localPlaylist : recommendedSongs;

    if (playlistToUse.length === 0 || currentSongIndex === -1) {
      return;
    }

    const nextIndex = (currentSongIndex + 1) % playlistToUse.length;
    const nextSong = playlistToUse[nextIndex];
    if (nextSong) {
      playTrack(nextSong, playlistToUse);
    }
  }, [localPlaylist, recommendedSongs, currentSongIndex, playTrack]);

  // Skip Previous from local playlist or recommended list
  const skipPrevious = useCallback(() => {
    const playlistToUse = localPlaylist.length > 0 ? localPlaylist : recommendedSongs;

    if (playlistToUse.length === 0 || currentSongIndex === -1) {
      return;
    }

    let prevIndex = currentSongIndex - 1;
    if (prevIndex < 0) {
      prevIndex = playlistToUse.length - 1;
    }
    const prevSong = playlistToUse[prevIndex];
    if (prevSong) {
      playTrack(prevSong, playlistToUse);
    }
  }, [localPlaylist, recommendedSongs, currentSongIndex, playTrack]);

  // Forward 10 Seconds
  const seekForward = useCallback(() => {
    const target = Math.min(duration, playbackPosition + 10000);
    seekTrack(target);
  }, [playbackPosition, duration, seekTrack]);

  // Backward 10 Seconds
  const seekBackward = useCallback(() => {
    const target = Math.max(0, playbackPosition - 10000);
    seekTrack(target);
  }, [playbackPosition, seekTrack]);

  const changeVolume = useCallback(async (newVal) => {
    const val = parseFloat(newVal);
    if (playerRef.current) {
      try {
        await playerRef.current.setVolume(val);
        setVolume(val);
      } catch (err) {
        console.error('Failed to set volume on Spotify Player:', err);
      }
    }
  }, []);

  const disconnectSpotify = useCallback(() => {
    logoutSpotify();
    setSpotifyToken(null);
    setDeviceId(null);
    setCurrentSong(null);
    setIsPlaying(false);
  }, []);

  const value = useMemo(() => ({
    currentSong,
    currentSongIndex,
    playbackPosition,
    duration,
    isPlaying,
    isLoading,
    deviceId,
    spotifyToken,
    setSpotifyToken,
    playTrack,
    pauseTrack,
    resumeTrack,
    seekTrack,
    skipNext,
    skipPrevious,
    seekForward,
    seekBackward,
    disconnectSpotify,
    volume,
    changeVolume,
    isPlayerVisible,
    setIsPlayerVisible
  }), [
    currentSong,
    currentSongIndex,
    playbackPosition,
    duration,
    isPlaying,
    isLoading,
    deviceId,
    spotifyToken,
    playTrack,
    pauseTrack,
    resumeTrack,
    seekTrack,
    skipNext,
    skipPrevious,
    seekForward,
    seekBackward,
    disconnectSpotify,
    volume,
    changeVolume,
    isPlayerVisible
  ]);

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
