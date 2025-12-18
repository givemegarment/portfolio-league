'use client';

import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glow' | 'gradient' | 'holographic';
  glowColor?: string;
  interactive?: boolean;
  noPadding?: boolean;
};

export default function Web3Card({ 
  children, 
  className = '',
  variant = 'default',
  glowColor = '#0052FF',
  interactive = false,
  noPadding = false,
}: Props) {
  const baseClasses = 'relative rounded-2xl border overflow-hidden';
  
  const variantClasses = {
    default: 'border-white/5 bg-white/[0.02]',
    glow: 'border-white/10 bg-white/[0.02]',
    gradient: 'border-transparent bg-gradient-to-br from-white/[0.05] to-white/[0.01]',
    holographic: 'border-white/10 bg-white/[0.02]',
  };

  const interactiveClasses = interactive 
    ? 'transition-all duration-300 hover:border-white/15 hover:bg-white/[0.04] hover:-translate-y-1 cursor-pointer' 
    : '';

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${interactiveClasses} ${className}`}>
      {/* Background effects based on variant */}
      {variant === 'glow' && (
        <>
          <div 
            className="absolute -inset-[100px] opacity-20 blur-3xl pointer-events-none"
            style={{ background: `radial-gradient(circle at center, ${glowColor}, transparent 70%)` }}
          />
        </>
      )}
      
      {variant === 'gradient' && (
        <div className="absolute inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />
      )}
      
      {variant === 'holographic' && (
        <div className="absolute inset-0 holographic opacity-10 pointer-events-none" />
      )}
      
      {/* Content */}
      <div className={`relative ${noPadding ? '' : 'p-6'}`}>
        {children}
      </div>
      
      {/* Shine effect on hover for interactive cards */}
      {interactive && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 pointer-events-none transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
        </div>
      )}
    </div>
  );
}

// Stat card with animated number
export function StatCard({ 
  label, 
  value, 
  suffix = '', 
  prefix = '',
  trend,
  trendValue,
  icon,
  color = '#0052FF',
}: { 
  label: string; 
  value: string | number;
  suffix?: string;
  prefix?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: ReactNode;
  color?: string;
}) {
  const trendColors = {
    up: 'text-accent-emerald',
    down: 'text-accent-rose',
    neutral: 'text-white/50',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <Web3Card variant="glow" glowColor={color}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-white font-mono">
            {prefix}{value}{suffix}
          </p>
          {trend && trendValue && (
            <p className={`text-sm mt-1 ${trendColors[trend]}`}>
              {trendIcons[trend]} {trendValue}
            </p>
          )}
        </div>
        {icon && (
          <div 
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}20` }}
          >
            {icon}
          </div>
        )}
      </div>
    </Web3Card>
  );
}

// Badge component with Web3 styling
export function Web3Badge({ 
  children, 
  variant = 'default',
  size = 'md',
  glow = false,
}: { 
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}) {
  const variantClasses = {
    default: 'bg-white/10 text-white border-white/20',
    success: 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20',
    warning: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20',
    danger: 'bg-accent-rose/10 text-accent-rose border-accent-rose/20',
    info: 'bg-base-blue/10 text-base-blue border-base-blue/20',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const glowClass = glow ? 'badge-shine' : '';

  return (
    <span className={`
      inline-flex items-center rounded-full border font-medium
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${glowClass}
    `}>
      {children}
    </span>
  );
}

// Rank badge with special styling
export function RankBadge({ rank, size = 'md' }: { rank: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return { bg: 'from-amber-400 to-amber-600', text: 'text-black', emoji: '🥇' };
    if (rank === 2) return { bg: 'from-gray-300 to-gray-500', text: 'text-black', emoji: '🥈' };
    if (rank === 3) return { bg: 'from-amber-600 to-amber-800', text: 'text-white', emoji: '🥉' };
    if (rank <= 10) return { bg: 'from-base-blue to-purple-600', text: 'text-white', emoji: '' };
    return { bg: 'from-white/10 to-white/5', text: 'text-white', emoji: '' };
  };

  const style = getRankStyle(rank);

  return (
    <div className="relative inline-flex">
      {rank <= 3 && (
        <div className={`absolute -inset-1 bg-gradient-to-br ${style.bg} rounded-full blur-md opacity-50`} />
      )}
      <div className={`
        relative flex items-center justify-center rounded-full
        bg-gradient-to-br ${style.bg} ${style.text} ${sizeClasses[size]}
        font-mono font-bold shadow-lg
        ${rank <= 3 ? 'energy-pulse' : ''}
      `}>
        {style.emoji || `#${rank}`}
      </div>
    </div>
  );
}

// Progress bar with Web3 styling
export function Web3Progress({ 
  value, 
  max = 100,
  color = '#0052FF',
  showLabel = true,
  size = 'md',
  animated = true,
}: {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}) {
  const percentage = Math.min(100, (value / max) * 100);
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
      <div className={`relative w-full rounded-full bg-white/10 overflow-hidden ${sizeClasses[size]}`}>
        <div 
          className={`h-full rounded-full transition-all duration-500 ${animated ? 'shimmer-web3' : ''}`}
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}50`,
          }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-white/50">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}




