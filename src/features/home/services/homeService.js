import api from '../../../services/api';

/**
 * Service to handle home and recommendation API requests.
 */
const homeService = {
  /**
   * Fetch song recommendations based on emotion
   * @param {string} emotion
   * @returns {Promise<object>} Response data containing songs
   */
  getRecommendations: async (emotion) => {
    const response = await api.post('/api/spotify/recommend', { emotion });
    return response.data;
  },

  /**
   * Search songs by query (artist, tracks, etc)
   * @param {string} query
   * @returns {Promise<object>} Response data containing songs
   */
  searchSongs: async (query) => {
    const response = await api.get(`/api/spotify/search?query=${encodeURIComponent(query)}`);
    return response.data;
  }
};

export default homeService;
