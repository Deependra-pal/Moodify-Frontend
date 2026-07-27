import { useContext } from 'react';
import { RecommendationContext } from '../../recommendation/context/RecommendationContext';

/**
 * Custom hook to manage song recommendations state and fetch operations.
 * Now consumes global RecommendationContext to persist state across page views.
 */
const useRecommendations = () => {
  const context = useContext(RecommendationContext);

  if (!context) {
    throw new Error('useRecommendations must be used within a RecommendationProvider');
  }

  return {
    songs: context.recommendedSongs,
    loading: context.loading,
    error: context.error,
    fetchRecommendations: context.fetchRecommendations,
    clearRecommendations: context.clearRecommendations,
    currentEmotion: context.currentEmotion,
    searchTracks: context.searchTracks
  };
};

export default useRecommendations;
