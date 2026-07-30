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
    <div className="text-center sm:text-left space-y-3 max-w-2xl select-none">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1db954]/10 border border-[#1db954]/20 text-[#1db954] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
        <span>👋</span>
        <span>{getGreeting()}, {user?.fullName || user?.username || 'Guest'}</span>
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
        Discover music based on your emotions
      </h1>
      <p className="text-xs sm:text-sm md:text-base text-neutral-450 font-medium leading-relaxed">
        Moodify uses secure web-camera scanning to capture your facial expression in real time, map your feelings to musical vibes, and instantly curate the perfect soundtrack.
      </p>
    </div>
  );
};

export default HeroSection;
