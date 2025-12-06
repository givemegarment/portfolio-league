/**
 * Confetti celebration utility for Portfolio League
 * 
 * Uses canvas-confetti for win celebrations and achievements
 */

import confetti from 'canvas-confetti';

/**
 * Basic confetti burst
 */
export function celebrate(): void {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
}

/**
 * Multi-burst celebration for big wins
 */
export function celebrateBigWin(): void {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
}

/**
 * Gold/trophy celebration for first place
 */
export function celebrateFirstPlace(): void {
  const colors = ['#FFD700', '#FFA500', '#FF8C00']; // Gold shades

  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.6 },
    colors,
    shapes: ['circle', 'square'],
    scalar: 1.2,
  });

  // Second burst
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors,
      shapes: ['circle'],
    });
  }, 200);
}

/**
 * Silver celebration for second place
 */
export function celebrateSecondPlace(): void {
  const colors = ['#C0C0C0', '#A8A8A8', '#D3D3D3']; // Silver shades

  confetti({
    particleCount: 100,
    spread: 80,
    origin: { y: 0.6 },
    colors,
  });
}

/**
 * Bronze celebration for third place
 */
export function celebrateThirdPlace(): void {
  const colors = ['#CD7F32', '#B87333', '#A0522D']; // Bronze shades

  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors,
  });
}

/**
 * Achievement unlocked celebration
 */
export function celebrateAchievement(): void {
  const colors = ['#8B5CF6', '#A78BFA', '#C4B5FD']; // Purple shades

  // Star burst from center
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.5 },
    colors,
    shapes: ['circle'],
    scalar: 0.8,
  });

  // Delayed second burst
  setTimeout(() => {
    confetti({
      particleCount: 30,
      spread: 100,
      origin: { y: 0.5 },
      colors,
      shapes: ['square'],
      scalar: 1,
    });
  }, 150);
}

/**
 * Celebrate based on rank
 */
export function celebrateRank(rank: number): void {
  if (rank === 1) {
    celebrateFirstPlace();
  } else if (rank === 2) {
    celebrateSecondPlace();
  } else if (rank === 3) {
    celebrateThirdPlace();
  } else if (rank <= 10) {
    celebrate();
  }
}

/**
 * Side cannons celebration
 */
export function fireCannons(): void {
  const end = Date.now() + 1000;

  const frame = () => {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}

/**
 * Fireworks celebration
 */
export function fireFireworks(): void {
  const duration = 5000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 45, spread: 360, ticks: 50, zIndex: 9999 };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    confetti({
      ...defaults,
      particleCount: 30,
      origin: {
        x: Math.random(),
        y: Math.random() * 0.3,
      },
      colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
    });
  }, 300);
}

/**
 * Emoji rain (custom shapes not directly supported, using colored particles)
 */
export function emojiRain(emoji: string = '🎉'): void {
  // Canvas-confetti doesn't support emoji directly,
  // so we'll create a colorful burst instead
  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'];
  
  confetti({
    particleCount: 80,
    spread: 180,
    origin: { y: 0 },
    colors,
    gravity: 0.8,
    scalar: 1.5,
    drift: 0,
    ticks: 200,
  });
}

/**
 * Subtle sparkle effect
 */
export function sparkle(): void {
  confetti({
    particleCount: 20,
    spread: 40,
    origin: { y: 0.6 },
    colors: ['#FFFFFF', '#FFD700'],
    shapes: ['circle'],
    scalar: 0.5,
    gravity: 0.5,
    ticks: 100,
  });
}

