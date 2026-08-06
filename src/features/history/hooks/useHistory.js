import { useMemo } from 'react';
import {
  useGetHistoryQuery,
  useAddHistoryMutation,
  useClearHistoryMutation
} from '../api/historyApi';

/**
 * Custom hook consuming RTK Query historyApi for listening history.
 */
const useHistory = () => {
  const { data, isLoading, error, refetch } = useGetHistoryQuery();
  const [addHistoryMutation] = useAddHistoryMutation();
  const [clearHistoryMutation] = useClearHistoryMutation();

  const history = useMemo(() => data?.data?.history || [], [data]);

  const addTrackToHistory = async (trackData) => {
    try {
      const res = await addHistoryMutation(trackData).unwrap();
      return res;
    } catch (err) {
      console.warn('Error recording track history:', err.message);
    }
  };

  const clearHistory = async () => {
    try {
      const res = await clearHistoryMutation().unwrap();
      return res;
    } catch (err) {
      throw err;
    }
  };

  return {
    history,
    loading: isLoading,
    error: error?.data?.message || null,
    fetchHistory: refetch,
    addTrackToHistory,
    clearHistory
  };
};

export default useHistory;
