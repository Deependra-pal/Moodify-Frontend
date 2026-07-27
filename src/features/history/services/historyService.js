import api from '../../../services/api';

/**
 * Service to handle history API requests.
 */
const historyService = {
  /**
   * Fetch user play history list
   */
  getHistory: async () => {
    const response = await api.get('/api/history');
    return response.data;
  },

  /**
   * Save played track to history
   * @param {object} songDetails - { songName, artist, album, image, spotifyUri, spotifyUrl }
   */
  saveHistory: async (songDetails) => {
    const response = await api.post('/api/history', songDetails);
    return response.data;
  },

  /**
   * Clear entire play history logs
   */
  clearHistory: async () => {
    const response = await api.delete('/api/history');
    return response.data;
  }
};

export default historyService;
