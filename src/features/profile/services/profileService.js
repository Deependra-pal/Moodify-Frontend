import api from '../../../services/api';

/**
 * Service to handle user profile API requests.
 */
const profileService = {
  /**
   * Fetch active user profile, stats and metrics
   */
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  /**
   * Update active user profile details
   * @param {object} profileDetails - { fullName, username, bio, profilePicture }
   */
  updateProfile: async (profileDetails) => {
    const response = await api.put('/profile', profileDetails);
    return response.data;
  }
};

export default profileService;
