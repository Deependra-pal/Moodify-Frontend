import React from 'react';
import { Music } from 'lucide-react';

/**
 * Reusable Skeleton UI Suite matching exact layout bounds of real Moodify content.
 */

// 1. Song Card Skeleton (Matches SongCard.jsx dimensions)
export const SongCardSkeleton = () => (
  <div className="bg-[#181818] border border-neutral-900 rounded-xl p-3 sm:p-4 flex flex-col space-y-3 animate-pulse shadow-md">
    {/* Album Cover Thumbnail Box */}
    <div className="relative aspect-square w-full bg-neutral-800/80 rounded-lg overflow-hidden shrink-0">
      <div className="absolute inset-0 flex items-center justify-center text-neutral-700">
        <Music className="h-8 w-8 stroke-[1.5]" />
      </div>
    </div>
    {/* Song Title Line */}
    <div className="space-y-2 pt-1 flex-1">
      <div className="h-4 w-4/5 bg-neutral-800/90 rounded-md" />
      <div className="h-3 w-3/5 bg-neutral-800/60 rounded-md" />
    </div>
    {/* Card Bottom Meta Bar */}
    <div className="flex items-center justify-between pt-1 border-t border-neutral-900/80">
      <div className="h-3 w-16 bg-neutral-800/50 rounded-md" />
      <div className="h-7 w-7 bg-neutral-800/80 rounded-full shrink-0" />
    </div>
  </div>
);

// 2. Song Card Grid Skeleton Container
export const GridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
    {Array.from({ length: count }).map((_, i) => (
      <SongCardSkeleton key={i} />
    ))}
  </div>
);

// 3. Conversation Item Skeleton (Matches ChatSidebar conversation item)
export const ConversationItemSkeleton = () => (
  <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-white/5 flex items-center gap-3 animate-pulse">
    <div className="h-12 w-12 rounded-2xl bg-zinc-800/80 shrink-0" />
    <div className="flex-1 space-y-2 min-w-0">
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 bg-zinc-800/90 rounded-md" />
        <div className="h-3 w-10 bg-zinc-800/50 rounded-md" />
      </div>
      <div className="h-3 w-3/4 bg-zinc-800/60 rounded-md" />
    </div>
  </div>
);

// 4. Friend Card Skeleton (Matches FriendsListView card)
export const FriendCardSkeleton = () => (
  <div className="p-4 rounded-2xl bg-[#121214] border border-white/5 flex items-center justify-between gap-3 animate-pulse">
    <div className="flex items-center gap-3 min-w-0">
      <div className="h-12 w-12 rounded-2xl bg-zinc-800/80 shrink-0" />
      <div className="space-y-1.5 min-w-0">
        <div className="h-4 w-24 bg-zinc-800/90 rounded-md" />
        <div className="h-3 w-32 bg-zinc-800/50 rounded-md" />
      </div>
    </div>
    <div className="h-9 w-20 bg-zinc-800/80 rounded-xl shrink-0" />
  </div>
);

// 5. Request Card Skeleton (Matches FriendRequestsView card)
export const RequestCardSkeleton = () => (
  <div className="p-4 rounded-2xl bg-[#121214] border border-white/5 flex items-center justify-between gap-3 animate-pulse">
    <div className="flex items-center gap-3 min-w-0">
      <div className="h-12 w-12 rounded-2xl bg-zinc-800/80 shrink-0" />
      <div className="space-y-1.5 min-w-0">
        <div className="h-4 w-28 bg-zinc-800/90 rounded-md" />
        <div className="h-3 w-36 bg-zinc-800/50 rounded-md" />
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <div className="h-9 w-20 bg-zinc-800/80 rounded-xl" />
      <div className="h-9 w-20 bg-zinc-800/40 rounded-xl" />
    </div>
  </div>
);

// 6. History Item Skeleton (Matches HistoryPage row)
export const HistoryItemSkeleton = () => (
  <div className="p-4 rounded-2xl bg-[#121214] border border-white/5 flex items-center justify-between gap-4 animate-pulse">
    <div className="flex items-center gap-3.5 min-w-0">
      <div className="h-12 w-12 rounded-xl bg-zinc-800/80 shrink-0" />
      <div className="space-y-2 min-w-0">
        <div className="h-4 w-36 bg-zinc-800/90 rounded-md" />
        <div className="h-3 w-24 bg-zinc-800/50 rounded-md" />
      </div>
    </div>
    <div className="h-3 w-16 bg-zinc-800/50 rounded-md shrink-0" />
  </div>
);

// 7. Profile Skeleton (Matches ProfilePage header & stats)
export const ProfileSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#121214] border border-white/5 p-6 rounded-3xl">
      <div className="h-28 w-28 rounded-full bg-zinc-800/80 shrink-0" />
      <div className="space-y-3 text-center sm:text-left flex-1">
        <div className="h-7 w-48 bg-zinc-800/90 rounded-lg mx-auto sm:mx-0" />
        <div className="h-4 w-32 bg-zinc-800/60 rounded-md mx-auto sm:mx-0" />
        <div className="h-4 w-64 bg-zinc-800/40 rounded-md mx-auto sm:mx-0" />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="h-24 bg-[#121214] border border-white/5 rounded-2xl" />
      <div className="h-24 bg-[#121214] border border-white/5 rounded-2xl" />
      <div className="h-24 bg-[#121214] border border-white/5 rounded-2xl" />
    </div>
  </div>
);

// 8. Page Loading Fallback (Single Premium Moodify Loader for App startup & route transitions)
export const PageLoadingFallback = () => (
  <div className="fixed inset-0 z-50 bg-[#09090b] flex flex-col items-center justify-center space-y-4 select-none animate-in fade-in duration-200">
    <div className="relative flex items-center justify-center">
      <div className="h-16 w-16 rounded-full border-2 border-[#1db954]/20 border-t-[#1db954] animate-spin" />
      <div className="absolute h-8 w-8 rounded-full bg-[#1db954]/10 flex items-center justify-center">
        <Music className="h-4 w-4 text-[#1db954]" />
      </div>
    </div>
    <p className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Loading Moodify...</p>
  </div>
);
