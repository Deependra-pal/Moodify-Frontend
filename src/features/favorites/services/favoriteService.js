import api from '../../../services/api';

/**
 * Service to handle favorites API requests.
 */
const favoriteService = {
  /**
   * Fetch all user favorite tracks
   */
  getFavorites: async () => {
    const response = await api.get('/api/favorites');
    return response.data;
  },

  /**
   * Add a track to favorites
   * @param {object} songDetails - { songName, artist, album, image, spotifyUri, spotifyUrl }
   */
  addFavorite: async (songDetails) => {
    const response = await api.post('/api/favorites', songDetails);
    return response.data;
  },

  /**
   * Remove a track from favorites by database ID
   * @param {string} favoriteId
   */
  removeFavorite: async (favoriteId) => {
    const response = await api.delete(`/api/favorites/${favoriteId}`);
    return response.data;
  },

  /**
   * Clear all tracks from user favorites
   */
  clearFavorites: async () => {
    const response = await api.delete('/api/favorites');
    return response.data;
  }
};

export default favoriteService;
