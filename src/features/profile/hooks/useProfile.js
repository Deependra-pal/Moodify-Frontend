import { useContext } from 'react';
import { ProfileContext } from '../context/ProfileContext';

/**
 * Custom hook to manage user profile details, form updates, and stats.
 * Consumes the global ProfileContext to cache profiles across renders.
 */
const useProfile = () => {
  return useContext(ProfileContext);
};

export default useProfile;
