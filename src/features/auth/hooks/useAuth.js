import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setCredentials, logoutUser, updateUser, setAuthLoading } from '../slice/authSlice';
import {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery
} from '../api/authApi';

/**
 * Custom hook to consume Redux Toolkit auth state and RTK Query endpoints.
 * Provides instant derived auth state on page reload to eliminate Login page flashing.
 */
const useAuth = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();

  const { data: meData, isLoading: isMeLoading, isError: isMeError, refetch } = useGetMeQuery();

  const user = authState.user || (meData?.success ? meData.data?.user : null);
  const isAuthenticated = authState.isAuthenticated || !!user;
  const loading = (isMeLoading && !user) || (authState.loading && !user && !isMeError);

  useEffect(() => {
    if (isMeLoading) return;

    if (meData?.success && meData.data?.user) {
      dispatch(setCredentials({ user: meData.data.user }));
    } else if (isMeError && !user) {
      dispatch(logoutUser());
    } else if (!meData && !user) {
      dispatch(setAuthLoading(false));
    }
  }, [meData, isMeLoading, isMeError, user, dispatch]);

  const login = async (email, password) => {
    try {
      const res = await loginMutation({ email, password }).unwrap();
      if (res.success && res.data?.user) {
        dispatch(setCredentials({ user: res.data.user }));
        refetch();
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.data?.message || 'Invalid email or password' };
    }
  };

  const register = async (username, email, password, fullName) => {
    try {
      const res = await registerMutation({ username, email, password, fullName }).unwrap();
      if (res.success && res.data?.user) {
        dispatch(setCredentials({ user: res.data.user }));
        refetch();
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: err.data?.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (err) {
      console.warn('Server logout error:', err.message);
    } finally {
      dispatch(logoutUser());
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUserProfile: (data) => dispatch(updateUser(data))
  };
};

export default useAuth;
