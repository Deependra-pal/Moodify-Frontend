import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import profileService from '../services/profileService';
import useAuth from '../../auth/hooks/useAuth';

export const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Clear cached data if the user is unauthenticated (logout cleanup)
  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(null);
      setIsLoaded(false);
      setLoading(true);
    }
  }, [isAuthenticated]);

  // Fetch profile details - utilizes loading indicator only on first fetch
  const fetchProfile = useCallback(async (force = false) => {
    if (isLoaded && !force) {
      return profile;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await profileService.getProfile();
      if (response && response.success && response.data?.profile) {
        setProfile(response.data.profile);
        setIsLoaded(true);
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
  }, [isLoaded, profile]);

  // Update profile details
  const updateProfile = useCallback(async (profileDetails) => {
    setUpdating(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await profileService.updateProfile(profileDetails);
      if (response && response.success && response.data?.profile) {
        setProfile(response.data.profile);
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
  }, []);

  const contextValue = useMemo(() => ({
    profile,
    loading,
    updating,
    error,
    success,
    fetchProfile,
    updateProfile,
    setSuccess,
    setError
  }), [profile, loading, updating, error, success, fetchProfile, updateProfile]);

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};
