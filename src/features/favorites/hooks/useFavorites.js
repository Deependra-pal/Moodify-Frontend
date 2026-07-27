import { useState, useCallback } from 'react';
import favoriteService from '../services/favoriteService';

/**
 * Custom hook to manage active user favorite songs.
 */
const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all favorites
  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await favoriteService.getFavorites();
      if (response && response.success) {
        setFavorites(response.data.favorites || []);
        return response.data.favorites;
      }
      throw new Error(response.message || 'Failed to fetch favorites');
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err.response?.data?.message || err.message || 'Something went wrong');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Add track to favorites
  const addFavorite = async (songDetails) => {
    setError(null);
    try {
      const response = await favoriteService.addFavorite(songDetails);
      if (response && response.success && response.data?.favorite) {
        setFavorites((prev) => [response.data.favorite, ...prev]);
        return response.data.favorite;
      }
      throw new Error(response.message || 'Failed to add favorite');
    } catch (err) {
      console.error('Error adding favorite:', err);
      setError(err.response?.data?.message || err.message || 'Something went wrong');
      throw err;
    }
  };

  // Remove track from favorites by database ID
  const removeFavorite = async (favoriteId) => {
    setError(null);
    try {
      const response = await favoriteService.removeFavorite(favoriteId);
      if (response && response.success) {
        setFavorites((prev) => prev.filter((item) => item._id !== favoriteId));
        return true;
      }
      throw new Error(response.message || 'Failed to remove favorite');
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError(err.response?.data?.message || err.message || 'Something went wrong');
      throw err;
    }
  };

  // Remove all tracks from favorites
  const clearAllFavorites = async () => {
    setError(null);
    try {
      const response = await favoriteService.clearFavorites();
      if (response && response.success) {
        setFavorites([]);
        return true;
      }
      throw new Error(response.message || 'Failed to clear favorites');
    } catch (err) {
      console.error('Error clearing favorites:', err);
      setError(err.response?.data?.message || err.message || 'Something went wrong');
      throw err;
    }
  };

  return {
    favorites,
    loading,
    error,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    clearAllFavorites
  };
};

export default useFavorites;
