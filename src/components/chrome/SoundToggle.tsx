'use client';

import { useState, useEffect } from 'react';
import { isSoundEnabled, toggleSound, playBeep } from '@/lib/sounds';

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEnabled(isSoundEnabled());
  }, []);

  const handleToggle = () => {
    const newState = toggleSound();
    setEnabled(newState);
    
    // Play a quick beep to confirm sounds are on
    if (newState) {
      playBeep(880, 100, 0.2);
    }
  };

  // Don't render on server to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/40"
        disabled
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`
        flex h-9 w-9 items-center justify-center rounded-lg transition-colors
        ${enabled 
          ? 'bg-base-blue/20 text-base-blue hover:bg-base-blue/30' 
          : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
        }
      `}
      title={enabled ? 'Sound effects on' : 'Sound effects off'}
    >
      {enabled ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      )}
    </button>
  );
}






