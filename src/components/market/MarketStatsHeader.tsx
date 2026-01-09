'use client';

import { useEffect, useRef, useState } from 'react';
import {
  useMarketStats,
  getFearGreedColor,
  formatLargeNumber,
  formatNumberAbbreviated,
  type MarketStats,
} from '@/hooks/useMarketStats';

type StatItemProps = {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  color?: string;
  isLoading?: boolean;
  showChangeIndicator?: boolean;
  previousValue?: string;
};

function StatItem({
  label,
  value,
  change,
  changeLabel,
  color,
  isLoading,
  showChangeIndicator = true,
  previousValue,
}: StatItemProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(previousValue);

  // Detect value changes and trigger animation
  useEffect(() => {
    if (prevValueRef.current !== value && prevValueRef.current !== undefined) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
    prevValueRef.current = value;
  }, [value]);

  const isPositive = change !== undefined && change >= 0;
  const changeColor = isPositive ? 'text-accent-emerald' : 'text-accent-rose';
  const changeSymbol = isPositive ? '+' : '';

  if (isLoading) {
    return (
      <div className="flex min-w-[140px] flex-shrink-0 flex-col gap-1 px-4 py-2">
        <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
        <div className="h-5 w-20 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-12 animate-pulse rounded bg-white/10" />
      </div>
    );
  }

  return (
    <div className="flex min-w-[140px] flex-shrink-0 flex-col gap-0.5 px-4 py-2">
      {/* Label */}
      <span className="whitespace-nowrap text-xs font-medium text-white/40">
        {label}
      </span>

      {/* Value */}
      <span
        className={`whitespace-nowrap text-base font-bold transition-all duration-300 ${
          isAnimating ? 'scale-105' : 'scale-100'
        }`}
        style={{ color: color || 'white' }}
      >
        {value}
        {changeLabel && (
          <span className="ml-1.5 text-xs font-medium text-white/60">
            {changeLabel}
          </span>
        )}
      </span>

      {/* Change indicator */}
      {showChangeIndicator && change !== undefined && (
        <span className={`flex items-center gap-0.5 text-xs font-medium ${changeColor}`}>
          {isPositive ? (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
          {changeSymbol}{change.toFixed(2)}%
        </span>
      )}
    </div>
  );
}

type FearGreedGaugeProps = {
  value: number;
  label: string;
  isLoading?: boolean;
};

function FearGreedGauge({ value, label, isLoading }: FearGreedGaugeProps) {
  const color = getFearGreedColor(value);

  if (isLoading) {
    return (
      <div className="flex min-w-[160px] flex-shrink-0 flex-col gap-1 px-4 py-2">
        <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-pulse rounded-full bg-white/10" />
          <div className="h-5 w-16 animate-pulse rounded bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-[160px] flex-shrink-0 flex-col gap-0.5 px-4 py-2">
      {/* Label */}
      <span className="whitespace-nowrap text-xs font-medium text-white/40">
        Fear & Greed
      </span>

      {/* Value with gauge */}
      <div className="flex items-center gap-2">
        {/* Circular gauge indicator */}
        <div
          className="relative flex h-7 w-7 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(${color} ${value}%, rgba(255,255,255,0.1) ${value}%)`,
          }}
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-2">
            <span
              className="text-[10px] font-bold"
              style={{ color }}
            >
              {value}
            </span>
          </div>
        </div>

        {/* Label */}
        <span
          className="whitespace-nowrap text-sm font-semibold"
          style={{ color }}
        >
          {label}
        </span>
      </div>

      {/* Gradient bar */}
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, #EF4444 0%, #F59E0B 50%, #10B981 100%)`,
          }}
        />
      </div>
    </div>
  );
}

type DividerProps = {
  className?: string;
};

function Divider({ className = '' }: DividerProps) {
  return (
    <div className={`h-10 w-px flex-shrink-0 bg-white/5 ${className}`} />
  );
}

type MarketStatsHeaderProps = {
  /** Optional className for custom styling */
  className?: string;
  /** Whether to show the header */
  show?: boolean;
  /** Compact mode for smaller displays */
  compact?: boolean;
};

/**
 * DropsTab-style market stats header bar
 * Displays key market statistics with live updates
 */
export default function MarketStatsHeader({
  className = '',
  show = true,
  compact = false,
}: MarketStatsHeaderProps) {
  const { stats, isLoading, error, lastUpdated, isStale } = useMarketStats({
    interval: 60000, // Update every minute
    enabled: show,
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll state
  const checkScrollState = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    checkScrollState();
    window.addEventListener('resize', checkScrollState);
    return () => window.removeEventListener('resize', checkScrollState);
  }, [stats]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 200;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!show) return null;

  // Prepare display values
  const marketCap = stats ? formatLargeNumber(stats.totalMarketCap, 2) : '--';
  const volume = stats ? formatLargeNumber(stats.totalVolume24h, 2) : '--';
  const btcDom = stats ? `${stats.btcDominance.toFixed(1)}%` : '--%';
  const activeUsers = stats
    ? formatNumberAbbreviated(stats.activeWallets, 2)
    : '--';

  return (
    <div
      className={`relative w-full border-b border-white/5 bg-surface-2/80 backdrop-blur-xl ${className}`}
    >
      {/* Glass overlay effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-base-blue/5 via-transparent to-accent-cyan/5" />

      {/* Scroll fade indicators */}
      {canScrollLeft && (
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-12 bg-gradient-to-r from-surface-2 to-transparent" />
      )}
      {canScrollRight && (
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-12 bg-gradient-to-l from-surface-2 to-transparent" />
      )}

      {/* Scroll buttons for desktop */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-1 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-surface-3/80 p-1.5 text-white/60 transition-all hover:bg-surface-4 hover:text-white md:block"
          aria-label="Scroll left"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-1 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-surface-3/80 p-1.5 text-white/60 transition-all hover:bg-surface-4 hover:text-white md:block"
          aria-label="Scroll right"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Stats container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollState}
        className={`scrollbar-none flex items-center overflow-x-auto ${
          compact ? 'py-1' : 'py-1.5'
        }`}
      >
        {/* Live indicator */}
        <div className="flex min-w-[80px] flex-shrink-0 items-center gap-1.5 px-4">
          <div className="relative flex h-2 w-2">
            {!isStale && !error && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-emerald opacity-75" />
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                error
                  ? 'bg-accent-rose'
                  : isStale
                  ? 'bg-accent-amber'
                  : 'bg-accent-emerald'
              }`}
            />
          </div>
          <span className="text-xs font-medium text-white/40">
            {error ? 'Error' : isStale ? 'Stale' : 'Live'}
          </span>
        </div>

        <Divider />

        {/* Total Market Cap */}
        <StatItem
          label="Market Cap"
          value={marketCap}
          change={stats?.marketCapChange24h}
          isLoading={isLoading}
        />

        <Divider className="hidden sm:block" />

        {/* 24h Volume */}
        <StatItem
          label="24h Volume"
          value={volume}
          change={stats?.volumeChange24h}
          isLoading={isLoading}
        />

        <Divider className="hidden md:block" />

        {/* BTC Dominance */}
        <StatItem
          label="BTC Dominance"
          value={btcDom}
          change={stats?.btcDominanceChange24h}
          isLoading={isLoading}
          color="#F7931A" // Bitcoin orange
        />

        <Divider className="hidden lg:block" />

        {/* Fear & Greed Index */}
        <FearGreedGauge
          value={stats?.fearGreedIndex ?? 50}
          label={stats?.fearGreedLabel ?? 'Loading'}
          isLoading={isLoading}
        />

        <Divider className="hidden xl:block" />

        {/* Active Wallets */}
        <StatItem
          label="Active Wallets"
          value={activeUsers}
          change={stats?.activeWalletsChange24h}
          isLoading={isLoading}
          showChangeIndicator={true}
        />

        {/* Last updated timestamp */}
        {lastUpdated && (
          <>
            <Divider className="hidden 2xl:block" />
            <div className="hidden min-w-[100px] flex-shrink-0 flex-col gap-0.5 px-4 py-2 2xl:flex">
              <span className="whitespace-nowrap text-xs font-medium text-white/40">
                Updated
              </span>
              <span className="whitespace-nowrap text-xs text-white/60">
                {new Date(lastUpdated).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </>
        )}

        {/* Spacer for scroll padding */}
        <div className="w-4 flex-shrink-0" />
      </div>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-base-blue/20 to-transparent" />
    </div>
  );
}

/**
 * Compact version of MarketStatsHeader for use in smaller spaces
 */
export function MarketStatsHeaderCompact({
  className = '',
}: {
  className?: string;
}) {
  return <MarketStatsHeader className={className} compact />;
}

/**
 * Individual stat badge for use outside the header
 */
export function MarketStatBadge({
  type,
  className = '',
}: {
  type: 'marketCap' | 'volume' | 'btcDominance' | 'fearGreed';
  className?: string;
}) {
  const { stats, isLoading } = useMarketStats({ interval: 60000 });

  if (isLoading || !stats) {
    return (
      <div
        className={`inline-flex animate-pulse items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 ${className}`}
      >
        <div className="h-3 w-12 rounded bg-white/10" />
      </div>
    );
  }

  const configs = {
    marketCap: {
      label: 'MCap',
      value: formatLargeNumber(stats.totalMarketCap, 1),
      change: stats.marketCapChange24h,
    },
    volume: {
      label: 'Vol',
      value: formatLargeNumber(stats.totalVolume24h, 1),
      change: stats.volumeChange24h,
    },
    btcDominance: {
      label: 'BTC.D',
      value: `${stats.btcDominance.toFixed(1)}%`,
      change: stats.btcDominanceChange24h,
    },
    fearGreed: {
      label: 'F&G',
      value: `${stats.fearGreedIndex}`,
      change: undefined,
      color: getFearGreedColor(stats.fearGreedIndex),
    },
  };

  const config = configs[type];
  const isPositive = config.change !== undefined && config.change >= 0;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-surface-2/80 px-3 py-1.5 backdrop-blur-sm ${className}`}
    >
      <span className="text-xs text-white/40">{config.label}</span>
      <span
        className="text-xs font-semibold"
        style={{ color: 'color' in config ? config.color : 'white' }}
      >
        {config.value}
      </span>
      {config.change !== undefined && (
        <span
          className={`text-[10px] font-medium ${
            isPositive ? 'text-accent-emerald' : 'text-accent-rose'
          }`}
        >
          {isPositive ? '+' : ''}
          {config.change.toFixed(1)}%
        </span>
      )}
    </div>
  );
}
