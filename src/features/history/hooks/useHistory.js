import { useContext } from 'react';
import { HistoryContext } from '../context/HistoryContext';

/**
 * Custom hook to manage active user play history logs.
 */
const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};

export default useHistory;

