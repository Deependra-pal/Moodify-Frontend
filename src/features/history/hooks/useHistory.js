import { useState, useCallback } from 'react';
import historyService from '../services/historyService';

/**
 * Custom hook to manage active user play history logs.
 */
const useHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch play history logs
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await historyService.getHistory();
      if (response && response.success) {
        setHistory(response.data.history || []);
        return response.data.history;
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
  const saveHistory = async (songDetails) => {
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
  };

  // Clear entire history logs
  const clearHistory = async () => {
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
  };

  return {
    history,
    loading,
    error,
    fetchHistory,
    saveHistory,
    clearHistory
  };
};

export default useHistory;
