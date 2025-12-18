'use client';

import { useState, useEffect } from 'react';
import { getStoredTheme, setStoredTheme, applyTheme, type Theme } from '@/lib/theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(getStoredTheme());
  }, []);

  const cycleTheme = () => {
    const themes: Theme[] = ['dark', 'light', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    setTheme(nextTheme);
    setStoredTheme(nextTheme);
    applyTheme(nextTheme);
  };

  // Don't render on server to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/40"
        disabled
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>
    );
  }

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'system':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      default: // dark
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        );
    }
  };

  const getTitle = () => {
    switch (theme) {
      case 'light': return 'Light mode';
      case 'system': return 'System preference';
      default: return 'Dark mode';
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className={`
        flex h-9 w-9 items-center justify-center rounded-lg transition-colors
        ${theme === 'light' 
          ? 'bg-accent-amber/20 text-accent-amber hover:bg-accent-amber/30' 
          : theme === 'system'
          ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
          : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
        }
      `}
      title={getTitle()}
    >
      {getIcon()}
    </button>
  );
}






