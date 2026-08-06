import { useMemo, useCallback } from 'react';
import {
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useClearFavoritesMutation
} from '../api/favoritesApi';

/**
 * Custom hook consuming RTK Query favoritesApi for automatic caching & tag invalidation.
 */
const useFavorites = () => {
  const { data, isLoading, error, refetch } = useGetFavoritesQuery();
  const [addFavoriteMutation] = useAddFavoriteMutation();
  const [removeFavoriteMutation] = useRemoveFavoriteMutation();
  const [clearFavoritesMutation] = useClearFavoritesMutation();

  const favorites = useMemo(() => data?.data?.favorites || [], [data]);

  const getFavoriteItem = useCallback(
    (track) => {
      if (!track) return null;
      return favorites.find(
        (fav) =>
          fav.spotifyUri === (track.uri || track.spotifyUri) ||
          (fav.songName === track.name && fav.artist === track.artist)
      );
    },
    [favorites]
  );

  const addFavorite = async (songData) => {
    try {
      const res = await addFavoriteMutation(songData).unwrap();
      return res;
    } catch (err) {
      throw err;
    }
  };

  const removeFavorite = async (favoriteId) => {
    try {
      const res = await removeFavoriteMutation(favoriteId).unwrap();
      return res;
    } catch (err) {
      throw err;
    }
  };

  const clearAllFavorites = async () => {
    try {
      const res = await clearFavoritesMutation().unwrap();
      return res;
    } catch (err) {
      throw err;
    }
  };

  return {
    favorites,
    loading: isLoading,
    error: error?.data?.message || null,
    fetchFavorites: refetch,
    getFavoriteItem,
    addFavorite,
    removeFavorite,
    clearAllFavorites
  };
};

export default useFavorites;
