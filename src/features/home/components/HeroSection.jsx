import React from 'react';
import useAuth from '../../auth/hooks/useAuth';

/**
 * Hero Section component for Greeting the user.
 * Formulates time-dependent greetings and provides instructions.
 */
const HeroSection = () => {
  const { user } = useAuth();

  // Dynamic greeting based on current system hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="py-6 text-left">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex flex-wrap gap-x-2">
        <span>{getGreeting()},</span>
        <span className="text-[#1db954]">{user?.username || 'Guest'}</span>
      </h1>
      <p className="mt-2 text-sm sm:text-base text-neutral-400 max-w-xl">
        Welcome to Moodify. Enable your camera feed to detect your current facial expression, map your emotions to Spotify features, and stream mood-appropriate music.
      </p>
    </div>
  );
};

export default HeroSection;
