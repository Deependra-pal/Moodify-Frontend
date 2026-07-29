import { useState, useCallback } from 'react';
import profileService from '../services/profileService';
import useAuth from '../../auth/hooks/useAuth';

let cachedProfile = null;
let profileLoaded = false;

/**
 * Custom hook to manage user profile details, form updates, and stats.
 */
const useProfile = () => {
  const { isAuthenticated } = useAuth();

  // Clear cached data if the user is unauthenticated (logout cleanup)
  if (!isAuthenticated) {
    cachedProfile = null;
    profileLoaded = false;
  }

  const [profile, setProfile] = useState(cachedProfile);
  const [loading, setLoading] = useState(!profileLoaded);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch profile details
  const fetchProfile = useCallback(async () => {
    if (!profileLoaded) {
      setLoading(true);
    }
    setError(null);
    setSuccess(null);
    try {
      const response = await profileService.getProfile();
      if (response && response.success && response.data?.profile) {
        setProfile(response.data.profile);
        cachedProfile = response.data.profile;
        profileLoaded = true;
        return response.data.profile;
      }
      throw new Error(response.message || 'Failed to load profile');
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.message || err.message || 'Something went wrong');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile details
  const updateProfile = async (profileDetails) => {
    setUpdating(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await profileService.updateProfile(profileDetails);
      if (response && response.success && response.data?.profile) {
        setProfile(response.data.profile);
        cachedProfile = response.data.profile;
        setSuccess('Profile updated successfully!');
        return response.data.profile;
      }
      throw new Error(response.message || 'Failed to update profile');
    } catch (err) {
      console.error('Error updating profile:', err);

      // If validation error from backend is field-specific:
      if (err.response?.data) {
        const data = err.response.data;
        if (data.errors && Array.isArray(data.errors)) {
          const validationErrorMsg = data.errors.map((e) => e.message).join('. ');
          setError(validationErrorMsg);
        } else {
          setError(data.message || 'Failed to update profile details.');
        }
      } else {
        setError(err.message || 'Something went wrong');
      }
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  return {
    profile,
    loading,
    updating,
    error,
    success,
    fetchProfile,
    updateProfile,
    setSuccess,
    setError
  };
};

export default useProfile;
