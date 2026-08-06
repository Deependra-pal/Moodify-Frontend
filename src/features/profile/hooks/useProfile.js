import { useMemo } from 'react';
import { useGetProfileQuery, useUpdateProfileMutation } from '../api/profileApi';

/**
 * Custom hook consuming RTK Query profileApi for user profile state.
 */
const useProfile = () => {
  const { data, isLoading, error, refetch } = useGetProfileQuery();
  const [updateProfileMutation] = useUpdateProfileMutation();

  const profile = useMemo(() => data?.data?.profile || data?.data?.user || null, [data]);

  const updateProfileData = async (profileData) => {
    try {
      const res = await updateProfileMutation(profileData).unwrap();
      return res;
    } catch (err) {
      throw err;
    }
  };

  return {
    profile,
    loading: isLoading,
    error: error?.data?.message || null,
    fetchProfile: refetch,
    updateProfile: updateProfileData
  };
};

export default useProfile;
