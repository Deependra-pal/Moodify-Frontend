import React from 'react';
import { Disc, HelpCircle } from 'lucide-react';

/**
 * Clean minimalist empty state placeholder.
 * Displayed in the Recommendations grid when no list has been fetched.
 */
const RecommendationEmptyState = () => {
  return (
    <div className="bg-[#181818] border border-neutral-900 rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[300px] shadow-xl">
      <div className="relative">
        <Disc className="h-16 w-16 text-neutral-800 animate-[spin_8s_linear_infinite] stroke-[1]" />
        <HelpCircle className="h-6 w-6 text-[#1db954] absolute -bottom-1 -right-1 bg-neutral-950 rounded-full border border-neutral-900" />
      </div>
      
      <h3 className="mt-6 text-base font-bold text-neutral-300">
        No songs recommended yet
      </h3>
      <p className="mt-2 text-xs text-neutral-500 max-w-sm leading-relaxed">
        Your recommendation playlist is currently empty. Detect your current mood above to load music matching your facial expressions!
      </p>
    </div>
  );
};

export default RecommendationEmptyState;
