import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import homeService from '../../home/services/homeService';
import useAuth from '../../auth/hooks/useAuth';

export const RecommendationContext = createContext(null);

export const RecommendationProvider = ({ children }) => {
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [currentEmotion, setCurrentEmotion] = useState('None');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { isAuthenticated } = useAuth();

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
