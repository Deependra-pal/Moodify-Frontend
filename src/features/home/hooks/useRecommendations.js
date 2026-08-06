import { useState, useCallback } from 'react';
import { useGetRecommendationsMutation, useLazySearchSongsQuery } from '../../spotify/api/spotifyApi';

/**
 * Custom hook consuming RTK Query spotifyApi for emotion recommendations & song search.
 */
const useRecommendations = () => {
  const [songs, setSongs] = useState([]);
  const [currentEmotion, setCurrentEmotion] = useState('happy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [getRecommendationsMutation] = useGetRecommendationsMutation();
  const [triggerSearch] = useLazySearchSongsQuery();

  const getRecommendations = useCallback(async (emotion = 'happy') => {
    setLoading(true);
    setError(null);
    setCurrentEmotion(emotion);
    try {
      const res = await getRecommendationsMutation(emotion).unwrap();
      if (res.success && res.data?.songs) {
        setSongs(res.data.songs);
        return res.data.songs;
      } else {
        setSongs([]);
        return [];
      }
    } catch (err) {
      setError(err.data?.message || 'Failed to fetch recommendations');
      setSongs([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getRecommendationsMutation]);

  const searchSongs = useCallback(async (query) => {
    if (!query || !query.trim()) return [];
    setLoading(true);
    setError(null);
    try {
      const res = await triggerSearch(query.trim()).unwrap();
      if (res.success && res.data?.songs) {
        setSongs(res.data.songs);
        return res.data.songs;
      } else {
        setSongs([]);
        return [];
      }
    } catch (err) {
      setError(err.data?.message || 'Search failed');
      setSongs([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [triggerSearch]);

  return {
    songs,
    loading,
    error,
    currentEmotion,
    getRecommendations,
    fetchRecommendations: getRecommendations,
    searchSongs,
    searchTracks: searchSongs,
    setSongs
  };
};

export default useRecommendations;
