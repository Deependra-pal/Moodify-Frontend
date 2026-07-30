import React, { createContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import favoriteService from '../services/favoriteService';
import useAuth from '../../auth/hooks/useAuth';

export const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const { isAuthenticated } = useAuth();

  const favoritesRef = useRef(favorites);
  const isLoadedRef = useRef(isLoaded);

  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  useEffect(() => {
    isLoadedRef.current = isLoaded;
  }, [isLoaded]);

  // Fetch all favorites (uses cached state if already loaded unless forced)
  const fetchFavorites = useCallback(async (force = false) => {
    if (isLoadedRef.current && !force) {
      return favoritesRef.current;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await favoriteService.getFavorites();
      if (response && response.success) {
        const data = response.data.favorites || [];
        setFavorites(data);
        setIsLoaded(true);
        return data;
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
  const addFavorite = useCallback(async (songDetails) => {
    setError(null);
    const tempId = `temp-${Date.now()}`;
    const optimisticFavorite = {
      _id: tempId,
      songName: songDetails.songName,
      artist: songDetails.artist,
      album: songDetails.album || 'Unknown Album',
      image: songDetails.image || '',
      spotifyUri: songDetails.spotifyUri || '',
      spotifyUrl: songDetails.spotifyUrl || '',
      isOptimistic: true
    };

    // Prepend optimistic item instantly to toggle UI heart icon
    setFavorites((prev) => [optimisticFavorite, ...prev]);

    try {
      const response = await favoriteService.addFavorite(songDetails);
      if (response && response.success && response.data?.favorite) {
        // Swap temp optimistic model with actual backend-saved DB object
        setFavorites((prev) =>
          prev.map((item) => (item._id === tempId ? response.data.favorite : item))
        );
        return response.data.favorite;
      }
      throw new Error(response.message || 'Failed to add favorite');
    } catch (err) {
      // Revert/rollback change on failure
      setFavorites((prev) => prev.filter((item) => item._id !== tempId));
      console.error('Error adding favorite:', err);
      setError(err.response?.data?.message || err.message || 'Something went wrong');
      throw err;
    }
  }, []);

  // Remove track from favorites by database ID
  const removeFavorite = useCallback(async (favoriteId) => {
    setError(null);

    let rollbackFavorites;
    setFavorites((prev) => {
      rollbackFavorites = prev;
      return prev.filter((item) => item._id !== favoriteId);
    });

    try {
      // If favoriteId is a temp ID (in-flight optimistic toggle), bypass remote delete call
      if (typeof favoriteId === 'string' && favoriteId.startsWith('temp-')) {
        return true;
      }

      const response = await favoriteService.removeFavorite(favoriteId);
      if (response && response.success) {
        return true;
      }
      throw new Error(response.message || 'Failed to remove favorite');
    } catch (err) {
      // Rollback to previous state on failure
      if (rollbackFavorites) {
        setFavorites(rollbackFavorites);
      }
      console.error('Error removing favorite:', err);
      setError(err.response?.data?.message || err.message || 'Something went wrong');
      throw err;
    }
  }, []);

  // Remove all tracks from favorites
  const clearAllFavorites = useCallback(async () => {
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
  }, []);

  // Reset or load data on login/logout changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites(true);
    } else {
      setFavorites([]);
      setIsLoaded(false);
      setError(null);
    }
  }, [isAuthenticated, fetchFavorites]);

  const value = useMemo(() => ({
    favorites,
    loading,
    error,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    clearAllFavorites,
    isLoaded
  }), [favorites, loading, error, fetchFavorites, addFavorite, removeFavorite, clearAllFavorites, isLoaded]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
