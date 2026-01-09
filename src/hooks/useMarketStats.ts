'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export type MarketStats = {
  totalMarketCap: number;
  marketCapChange24h: number;
  totalVolume24h: number;
  volumeChange24h: number;
  btcDominance: number;
  btcDominanceChange24h: number;
  fearGreedIndex: number;
  fearGreedLabel: string;
  activeWallets: number;
  activeWalletsChange24h: number;
};

export type MarketStatsState = {
  stats: MarketStats | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  isStale: boolean;
};

type UseMarketStatsOptions = {
  /** Polling interval in milliseconds (default: 60000 = 1 minute) */
  interval?: number;
  /** Whether to start polling immediately (default: true) */
  enabled?: boolean;
  /** Consider data stale after this many milliseconds (default: 300000 = 5 minutes) */
  staleTime?: number;
};

const DEFAULT_OPTIONS: Required<UseMarketStatsOptions> = {
  interval: 60000, // 1 minute
  enabled: true,
  staleTime: 300000, // 5 minutes
};

// Mock data generator for market stats
// In production, this would fetch from CoinGecko global endpoint or similar
function generateMockMarketStats(): MarketStats {
  // Base values with slight randomization to simulate live updates
  const baseMarketCap = 2.45; // Trillion
  const baseVolume = 98.5; // Billion
  const baseBtcDominance = 52.3;
  const baseFearGreed = 65;
  const baseActiveWallets = 1.23; // Million

  // Add small variations
  const variation = () => (Math.random() - 0.5) * 0.02; // +/- 1%
  const changeVariation = () => (Math.random() - 0.5) * 4; // +/- 2%

  const fearGreedValue = Math.round(baseFearGreed + (Math.random() - 0.5) * 20);

  const getFearGreedLabel = (value: number): string => {
    if (value <= 20) return 'Extreme Fear';
    if (value <= 40) return 'Fear';
    if (value <= 60) return 'Neutral';
    if (value <= 80) return 'Greed';
    return 'Extreme Greed';
  };

  return {
    totalMarketCap: baseMarketCap * (1 + variation()) * 1e12,
    marketCapChange24h: changeVariation(),
    totalVolume24h: baseVolume * (1 + variation()) * 1e9,
    volumeChange24h: changeVariation(),
    btcDominance: baseBtcDominance + (Math.random() - 0.5) * 2,
    btcDominanceChange24h: changeVariation() * 0.5,
    fearGreedIndex: fearGreedValue,
    fearGreedLabel: getFearGreedLabel(fearGreedValue),
    activeWallets: baseActiveWallets * (1 + variation()) * 1e6,
    activeWalletsChange24h: changeVariation(),
  };
}

// Attempt to fetch real data from API, fall back to mock
async function fetchMarketStats(): Promise<MarketStats> {
  try {
    // Try to fetch from our prices API to get some real data
    const response = await fetch('/api/prices', {
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();

      // If we have price data, we can calculate some metrics
      // For now, still use mock for global metrics as the API only has individual prices
      const mockStats = generateMockMarketStats();

      // Use real BTC price change if available
      if (data.prices?.BTC) {
        // Keep mock data but this confirms API is working
        return mockStats;
      }

      return mockStats;
    }
  } catch (error) {
    console.warn('Failed to fetch from API, using mock data:', error);
  }

  // Return mock data as fallback
  return generateMockMarketStats();
}

/**
 * Hook for fetching and polling market overview statistics
 *
 * @example
 * ```tsx
 * const { stats, isLoading, error, refetch } = useMarketStats();
 *
 * // Access market cap
 * const marketCap = stats?.totalMarketCap;
 * ```
 */
export function useMarketStats(options: UseMarketStatsOptions = {}): MarketStatsState & {
  refetch: () => Promise<void>;
} {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [state, setState] = useState<MarketStatsState>({
    stats: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
    isStale: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchStats = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      const stats = await fetchMarketStats();

      if (!mountedRef.current) return;

      setState(prev => ({
        ...prev,
        stats,
        lastUpdated: Date.now(),
        isLoading: false,
        error: null,
        isStale: false,
      }));
    } catch (error) {
      if (!mountedRef.current) return;

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isStale: prev.stats !== null,
      }));
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;

    if (opts.enabled) {
      fetchStats();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [fetchStats, opts.enabled]);

  // Polling interval
  useEffect(() => {
    if (!opts.enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(fetchStats, opts.interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchStats, opts.interval, opts.enabled]);

  // Check staleness
  useEffect(() => {
    if (!state.lastUpdated) return;

    const checkStale = () => {
      const now = Date.now();
      const age = now - state.lastUpdated!;

      if (age > opts.staleTime && !state.isStale) {
        setState(prev => ({ ...prev, isStale: true }));
      }
    };

    checkStale();

    const staleCheckInterval = setInterval(checkStale, 30000); // Check every 30 seconds

    return () => clearInterval(staleCheckInterval);
  }, [state.lastUpdated, opts.staleTime, state.isStale]);

  return {
    ...state,
    refetch: fetchStats,
  };
}

/**
 * Get the color for Fear & Greed index
 */
export function getFearGreedColor(value: number): string {
  if (value <= 20) return '#EF4444'; // Red - Extreme Fear
  if (value <= 40) return '#F97316'; // Orange - Fear
  if (value <= 60) return '#F59E0B'; // Amber - Neutral
  if (value <= 80) return '#84CC16'; // Lime - Greed
  return '#10B981'; // Green - Extreme Greed
}

/**
 * Format large numbers for display
 */
export function formatLargeNumber(value: number, decimals: number = 2): string {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(decimals)}T`;
  }
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(decimals)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(decimals)}M`;
  }
  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(decimals)}K`;
  }
  return `$${value.toFixed(decimals)}`;
}

/**
 * Format number with abbreviation (without dollar sign)
 */
export function formatNumberAbbreviated(value: number, decimals: number = 2): string {
  if (value >= 1e12) {
    return `${(value / 1e12).toFixed(decimals)}T`;
  }
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(decimals)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(decimals)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(decimals)}K`;
  }
  return value.toFixed(decimals);
}

export default useMarketStats;
