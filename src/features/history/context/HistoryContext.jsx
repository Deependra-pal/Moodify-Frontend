import React, { createContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import historyService from '../services/historyService';
import useAuth from '../../auth/hooks/useAuth';

export const HistoryContext = createContext(null);

export const HistoryProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const { isAuthenticated } = useAuth();

  const historyRef = useRef(history);
  const isLoadedRef = useRef(isLoaded);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    isLoadedRef.current = isLoaded;
  }, [isLoaded]);

  // Fetch listening history (uses cached state if already loaded unless forced)
  const fetchHistory = useCallback(async (force = false) => {
    if (isLoadedRef.current && !force) {
      return historyRef.current;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await historyService.getHistory();
      if (response && response.success) {
        const data = response.data.history || [];
        setHistory(data);
        setIsLoaded(true);
        return data;
      }
      throw new Error(response.message || 'Failed to fetch history');
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err.response?.data?.message || err.message || 'Something went wrong');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Save played track to history
  const saveHistory = useCallback(async (songDetails) => {
    setError(null);
    try {
      const response = await historyService.saveHistory(songDetails);
      if (response && response.success && response.data?.history) {
        setHistory((prev) => [response.data.history, ...prev]);
        return response.data.history;
      }
      throw new Error(response.message || 'Failed to save history');
    } catch (err) {
      console.error('Error saving history:', err);
      setError(err.response?.data?.message || err.message || 'Something went wrong');
      throw err;
    }
  }, []);

  // Clear entire history logs
  const clearHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await historyService.clearHistory();
      if (response && response.success) {
        setHistory([]);
        return true;
      }
      throw new Error(response.message || 'Failed to clear history');
    } catch (err) {
      console.error('Error clearing history:', err);
      setError(err.response?.data?.message || err.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset or load data on login/logout changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory(true);
    } else {
      setHistory([]);
      setIsLoaded(false);
      setError(null);
    }
  }, [isAuthenticated, fetchHistory]);

  const value = useMemo(() => ({
    history,
    loading,
    error,
    fetchHistory,
    saveHistory,
    clearHistory,
    isLoaded
  }), [history, loading, error, fetchHistory, saveHistory, clearHistory, isLoaded]);

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
};
