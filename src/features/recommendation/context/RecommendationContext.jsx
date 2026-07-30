import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import homeService from '../../home/services/homeService';
import useAuth from '../../auth/hooks/useAuth';

export const RecommendationContext = createContext(null);

export const RecommendationProvider = ({ children }) => {
  const [recommendedSongs, setRecommendedSongs] = useState(() => {
    try {
      const saved = window.localStorage.getItem('moodify_recommended_songs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [currentEmotion, setCurrentEmotion] = useState(() => {
    return window.localStorage.getItem('moodify_current_emotion') || 'None';
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { isAuthenticated } = useAuth();

  // Sync state modifications to localStorage to persist them across external redirects
  useEffect(() => {
    try {
      window.localStorage.setItem('moodify_recommended_songs', JSON.stringify(recommendedSongs));
    } catch (e) {
      console.warn('Failed to save recommended songs to localStorage:', e);
    }
  }, [recommendedSongs]);

  useEffect(() => {
    window.localStorage.setItem('moodify_current_emotion', currentEmotion);
  }, [currentEmotion]);

  const fetchRecommendations = useCallback(async (emotion) => {
    setLoading(true);
    setError(null);
    try {
      const result = await homeService.getRecommendations(emotion);
      if (result && result.success) {
        setRecommendedSongs(result.data.songs || []);
        setCurrentEmotion(emotion);
        return result.data.songs;
      }
      throw new Error(result.message || 'Failed to fetch recommendations');
    } catch (err) {
      console.error('Error in fetchRecommendations:', err);
      const errMsg = err.response?.data?.message || err.message || 'Something went wrong';
      setError(errMsg);
      setRecommendedSongs([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearRecommendations = useCallback(() => {
    setRecommendedSongs([]);
    setCurrentEmotion('None');
    setError(null);
    window.localStorage.removeItem('moodify_recommended_songs');
    window.localStorage.removeItem('moodify_current_emotion');
  }, []);

  const searchTracks = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const result = await homeService.searchSongs(query);
      if (result && result.success) {
        setRecommendedSongs(result.data.songs || []);
        setCurrentEmotion(`Search: ${query}`);
        return result.data.songs;
      }
      throw new Error(result.message || 'Failed to search songs');
    } catch (err) {
      console.error('Error in searchTracks:', err);
      const errMsg = err.response?.data?.message || err.message || 'Something went wrong';
      setError(errMsg);
      setRecommendedSongs([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Automatically clear recommendations on logout
  useEffect(() => {
    if (!isAuthenticated) {
      clearRecommendations();
    }
  }, [isAuthenticated, clearRecommendations]);

  const contextValue = useMemo(() => ({
    recommendedSongs,
    currentEmotion,
    loading,
    error,
    fetchRecommendations,
    clearRecommendations,
    searchTracks
  }), [recommendedSongs, currentEmotion, loading, error, fetchRecommendations, clearRecommendations, searchTracks]);

  return (
    <RecommendationContext.Provider value={contextValue}>
      {children}
    </RecommendationContext.Provider>
  );
};
