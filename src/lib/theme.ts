/**
 * Theme management for Portfolio League
 */

export type Theme = 'dark' | 'light' | 'system';

const STORAGE_KEY = 'portfolio_league_theme';

/**
 * Get the stored theme preference
 */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light' || stored === 'system') {
    return stored;
  }
  return 'dark'; // Default to dark
}

/**
 * Set the theme preference
 */
export function setStoredTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, theme);
}

/**
 * Get the resolved theme (accounting for system preference)
 */
export function getResolvedTheme(theme: Theme): 'dark' | 'light' {
  if (theme === 'system') {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  
  const resolved = getResolvedTheme(theme);
  const root = document.documentElement;
  
  if (resolved === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
    root.classList.remove('light');
  }
}

/**
 * Initialize theme on page load
 */
export function initializeTheme(): void {
  const theme = getStoredTheme();
  applyTheme(theme);
  
  // Listen for system theme changes
  if (theme === 'system' && typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      applyTheme('system');
    });
  }
}


