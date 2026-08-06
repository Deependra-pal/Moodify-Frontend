import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/AuthContext';
import { RecommendationProvider } from './features/recommendation/context/RecommendationContext';
import { PlayerProvider } from './context/PlayerContext';
import { FavoritesProvider } from './features/favorites/context/FavoritesContext';
import { HistoryProvider } from './features/history/context/HistoryContext';
import { ProfileProvider } from './features/profile/context/ProfileContext';
import { ChatProvider } from './features/chat/context/ChatContext';
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
 * Main application component.
 * Wraps routes in Providers, BrowserRouter, and Suspense for smooth code splitting.
 */
const App = () => {
  return (
    <AuthProvider>
      <ProfileProvider>
        <FavoritesProvider>
          <HistoryProvider>
            <RecommendationProvider>
              <PlayerProvider>
                <ChatProvider>
                  <BrowserRouter>
                    <Suspense fallback={<PageLoadingFallback />}>
                      <Routes>
                        {/* Public Authentication Routes (Lazy Loaded Only, No Skeleton) */}
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
                </ChatProvider>
              </PlayerProvider>
            </RecommendationProvider>
          </HistoryProvider>
        </FavoritesProvider>
      </ProfileProvider>
    </AuthProvider>
  );
};

export default App;
