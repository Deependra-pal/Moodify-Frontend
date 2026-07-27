import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/AuthContext';
import { RecommendationProvider } from './features/recommendation/context/RecommendationContext';
import { PlayerProvider } from './context/PlayerContext';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import HomePage from './features/home/pages/HomePage';
import FavoritesPage from './features/favorites/pages/FavoritesPage';
import HistoryPage from './features/history/pages/HistoryPage';
import ProfilePage from './features/profile/pages/ProfilePage';

/**
 * Main application component.
 * Wraps routes in AuthProvider, RecommendationProvider, PlayerProvider, and BrowserRouter.
 * Registers public authentication paths and guards protected views.
 */
const App = () => {
  return (
    <AuthProvider>
      <RecommendationProvider>
        <PlayerProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Main Application Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <HomePage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/callback"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <HomePage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <FavoritesPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <HistoryPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ProfilePage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Catch-all Fallback Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </PlayerProvider>
      </RecommendationProvider>
    </AuthProvider>
  );
};

export default App;

