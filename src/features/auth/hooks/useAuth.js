import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook to consume the AuthContext values.
 * @returns {object} AuthContext values (user, loading, isAuthenticated, login, register, logout, getCurrentUser)
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
