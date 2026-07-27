import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * Reusable route guard component.
 * Redirects to `/login` if the user is not authenticated.
 * Renders a loading screen if the session verification is in progress.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#121212] text-white">
        <div className="flex flex-col items-center gap-4">
          {/* Spotify green loader */}
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-800 border-t-[#1db954]"></div>
          <p className="text-sm font-semibold tracking-wider text-neutral-400">Loading Moodify...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, storing the attempted path for redirecting back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
