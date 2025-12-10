/**
 * Sound effects utility for Portfolio League
 * 
 * Plays audio feedback for user actions and achievements
 */

export type SoundEffect = 'submit' | 'win' | 'levelUp' | 'notification' | 'click' | 'error';

// Sound settings storage key
const STORAGE_KEY = 'portfolio_league_sounds_enabled';

/**
 * Check if sounds are enabled
 */
export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored !== 'false'; // Default to enabled
}

/**
 * Toggle sound setting
 */
export function toggleSound(): boolean {
  if (typeof window === 'undefined') return true;
  const current = isSoundEnabled();
  localStorage.setItem(STORAGE_KEY, (!current).toString());
  return !current;
}

/**
 * Set sound enabled/disabled
 */
export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, enabled.toString());
}

// Audio cache to avoid recreating Audio objects
const audioCache: Map<string, HTMLAudioElement> = new Map();

/**
 * Play a sound effect
 */
export function playSound(effect: SoundEffect, volume: number = 0.5): void {
  if (typeof window === 'undefined') return;
  if (!isSoundEnabled()) return;

  const soundPath = `/sounds/${effect}.mp3`;

  try {
    // Check cache first
    let audio = audioCache.get(effect);
    
    if (!audio) {
      audio = new Audio(soundPath);
      audioCache.set(effect, audio);
    }

    // Reset and play
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.currentTime = 0;
    
    // Play with error handling
    audio.play().catch((error) => {
      // Silently fail - user might not have interacted with page yet
      console.debug('Sound playback failed:', error.message);
    });
  } catch (error) {
    console.debug('Error creating audio:', error);
  }
}

/**
 * Preload sounds for better responsiveness
 */
export function preloadSounds(): void {
  if (typeof window === 'undefined') return;

  const sounds: SoundEffect[] = ['submit', 'win', 'levelUp', 'notification', 'click', 'error'];
  
  sounds.forEach((effect) => {
    const audio = new Audio(`/sounds/${effect}.mp3`);
    audio.preload = 'auto';
    audioCache.set(effect, audio);
  });
}

/**
 * Play success/submit sound
 */
export function playSubmitSound(): void {
  playSound('submit', 0.6);
}

/**
 * Play win/celebration sound
 */
export function playWinSound(): void {
  playSound('win', 0.7);
}

/**
 * Play level up/achievement sound
 */
export function playLevelUpSound(): void {
  playSound('levelUp', 0.6);
}

/**
 * Play notification sound
 */
export function playNotificationSound(): void {
  playSound('notification', 0.4);
}

/**
 * Play click/tap sound
 */
export function playClickSound(): void {
  playSound('click', 0.3);
}

/**
 * Play error sound
 */
export function playErrorSound(): void {
  playSound('error', 0.5);
}

/**
 * Create a Web Audio API-based beep (fallback when no audio files)
 */
export function playBeep(
  frequency: number = 440,
  duration: number = 100,
  volume: number = 0.3
): void {
  if (typeof window === 'undefined') return;
  if (!isSoundEnabled()) return;

  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (error) {
    console.debug('Web Audio API not available:', error);
  }
}

/**
 * Play a success beep pattern
 */
export function playSuccessBeep(): void {
  playBeep(523.25, 100, 0.2); // C5
  setTimeout(() => playBeep(659.25, 100, 0.2), 100); // E5
  setTimeout(() => playBeep(783.99, 150, 0.2), 200); // G5
}

/**
 * Play an error beep
 */
export function playErrorBeep(): void {
  playBeep(220, 200, 0.2); // A3
}


