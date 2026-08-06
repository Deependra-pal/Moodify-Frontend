import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { PageLoadingFallback } from '../../../components/common/Skeletons';

/**
 * Reusable route guard component.
 * Redirects to `/login` if the user is not authenticated.
 * Renders the single Moodify loading screen if session verification is in progress.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoadingFallback />;
  }

  if (!isAuthenticated) {
    // Redirect to login, storing the attempted path for redirecting back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
