import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import { PageLoadingFallback } from './components/common/Skeletons';

// --- ROUTE LEVEL CODE SPLITTING (React.lazy) ---
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage'));
const HomePage = lazy(() => import('./features/home/pages/HomePage'));
const FavoritesPage = lazy(() => import('./features/favorites/pages/FavoritesPage'));
const HistoryPage = lazy(() => import('./features/history/pages/HistoryPage'));
const ProfilePage = lazy(() => import('./features/profile/pages/ProfilePage'));
const ChatPage = lazy(() => import('./features/chat/pages/ChatPage'));

/**
 * Main application component powered by Redux Toolkit + RTK Query.
 * Wraps routes in BrowserRouter and Suspense for smooth code splitting.
 */
const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoadingFallback />}>
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
            path="/chat"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ChatPage />
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
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
