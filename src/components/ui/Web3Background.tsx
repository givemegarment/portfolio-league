'use client';

import { useEffect, useRef } from 'react';

type Props = {
  className?: string;
  variant?: 'default' | 'subtle' | 'intense';
  animated?: boolean;
};

// Floating orb component
function FloatingOrb({ 
  color, 
  size, 
  x, 
  y, 
  delay = 0,
  duration = 20
}: { 
  color: string; 
  size: number; 
  x: string; 
  y: string; 
  delay?: number;
  duration?: number;
}) {
  return (
    <div 
      className="absolute rounded-full blur-3xl animate-float opacity-30"
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        left: x,
        top: y,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  );
}

// Grid pattern component
function GridPattern({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,${opacity}) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,${opacity}) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}
    />
  );
}

// Animated gradient border component
function GradientBorder({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-base-blue via-purple-600 to-accent-cyan opacity-20 blur-sm" />
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-base-blue via-purple-600 to-accent-cyan opacity-50 animate-spin-slow" 
        style={{ 
          maskImage: 'conic-gradient(from 0deg, transparent, black, transparent)',
          WebkitMaskImage: 'conic-gradient(from 0deg, transparent, black, transparent)',
        }}
      />
      <div className="relative bg-surface-2 rounded-2xl">
        {children}
      </div>
    </div>
  );
}

// Noise texture overlay
function NoiseOverlay({ opacity = 0.02 }: { opacity?: number }) {
  return (
    <div 
      className="absolute inset-0 pointer-events-none mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        opacity,
      }}
    />
  );
}

// Scanline effect
function Scanlines({ opacity = 0.02 }: { opacity?: number }) {
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `repeating-linear-gradient(
          0deg,
          rgba(255,255,255,${opacity}),
          rgba(255,255,255,${opacity}) 1px,
          transparent 1px,
          transparent 2px
        )`,
      }}
    />
  );
}

export default function Web3Background({ 
  className = '', 
  variant = 'default',
  animated = true,
}: Props) {
  const orbConfigs = {
    default: [
      { color: '#0052FF', size: 400, x: '10%', y: '20%', delay: 0, duration: 25 },
      { color: '#7C3AED', size: 300, x: '80%', y: '10%', delay: 5, duration: 30 },
      { color: '#06B6D4', size: 250, x: '70%', y: '70%', delay: 10, duration: 20 },
      { color: '#10B981', size: 200, x: '20%', y: '80%', delay: 15, duration: 35 },
    ],
    subtle: [
      { color: '#0052FF', size: 300, x: '20%', y: '30%', delay: 0, duration: 40 },
      { color: '#7C3AED', size: 250, x: '70%', y: '60%', delay: 10, duration: 45 },
    ],
    intense: [
      { color: '#0052FF', size: 500, x: '0%', y: '0%', delay: 0, duration: 20 },
      { color: '#7C3AED', size: 450, x: '60%', y: '0%', delay: 3, duration: 25 },
      { color: '#06B6D4', size: 400, x: '80%', y: '50%', delay: 6, duration: 22 },
      { color: '#10B981', size: 350, x: '10%', y: '70%', delay: 9, duration: 28 },
      { color: '#F43F5E', size: 300, x: '50%', y: '90%', delay: 12, duration: 30 },
    ],
  };

  const orbs = orbConfigs[variant];

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-mesh" />
      
      {/* Floating orbs */}
      {animated && orbs.map((orb, i) => (
        <FloatingOrb key={i} {...orb} />
      ))}
      
      {/* Grid pattern */}
      <GridPattern opacity={variant === 'intense' ? 0.05 : 0.03} />
      
      {/* Noise texture */}
      <NoiseOverlay opacity={variant === 'intense' ? 0.04 : 0.02} />
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  );
}

// Export sub-components for individual use
export { FloatingOrb, GridPattern, GradientBorder, NoiseOverlay, Scanlines };




