import api from '../../../services/api';

/**
 * Service to handle authentication API requests.
 */
const authService = {
  /**
   * Log in user
   * @param {string} email
   * @param {string} password
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Register a new user
   * @param {string} username
   * @param {string} email
   * @param {string} password
   */
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },

  /**
   * Log out user
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * Retrieve currently authenticated user info
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export default authService;
