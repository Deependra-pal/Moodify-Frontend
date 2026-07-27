import api from '../../../services/api';

/**
 * Service to handle history API requests.
 */
const historyService = {
  /**
   * Fetch user play history list
   */
  getHistory: async () => {
    const response = await api.get('/history');
    return response.data;
  },

  /**
   * Save played track to history
   * @param {object} songDetails - { songName, artist, album, image, spotifyUri, spotifyUrl }
   */
  saveHistory: async (songDetails) => {
    const response = await api.post('/history', songDetails);
    return response.data;
  },

  /**
   * Clear entire play history logs
   */
  clearHistory: async () => {
    const response = await api.delete('/history');
    return response.data;
  }
};

export default historyService;
