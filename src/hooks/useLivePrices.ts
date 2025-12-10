'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export type PriceData = {
  price: number;
  change24h: number;
};

export type PricesState = {
  prices: Record<string, PriceData>;
  lastUpdated: number | null;
  isLoading: boolean;
  error: string | null;
  isStale: boolean;
};

type UseLivePricesOptions = {
  /** Polling interval in milliseconds (default: 30000 = 30 seconds) */
  interval?: number;
  /** Whether to start polling immediately (default: true) */
  enabled?: boolean;
  /** Consider data stale after this many milliseconds (default: 120000 = 2 minutes) */
  staleTime?: number;
};

const DEFAULT_OPTIONS: Required<UseLivePricesOptions> = {
  interval: 30000, // 30 seconds
  enabled: true,
  staleTime: 120000, // 2 minutes
};

/**
 * Hook for fetching and polling live cryptocurrency prices
 * 
 * @example
 * ```tsx
 * const { prices, isLoading, error, refetch } = useLivePrices();
 * 
 * // Access a specific price
 * const btcPrice = prices.BTC?.price;
 * ```
 */
export function useLivePrices(options: UseLivePricesOptions = {}): PricesState & {
  refetch: () => Promise<void>;
} {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const [state, setState] = useState<PricesState>({
    prices: {},
    lastUpdated: null,
    isLoading: true,
    error: null,
    isStale: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchPrices = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      const response = await fetch('/api/prices');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch prices: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!mountedRef.current) return;

      if (data.error) {
        throw new Error(data.error);
      }
      
      setState(prev => ({
        ...prev,
        prices: data.prices || {},
        lastUpdated: data.lastUpdated || Date.now(),
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
        // Keep existing prices if we have them
        isStale: prev.prices && Object.keys(prev.prices).length > 0,
      }));
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    
    if (opts.enabled) {
      fetchPrices();
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchPrices, opts.enabled]);

  // Polling interval
  useEffect(() => {
    if (!opts.enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(fetchPrices, opts.interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchPrices, opts.interval, opts.enabled]);

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

    // Check immediately
    checkStale();

    // Set up interval to check staleness
    const staleCheckInterval = setInterval(checkStale, 10000); // Check every 10 seconds

    return () => clearInterval(staleCheckInterval);
  }, [state.lastUpdated, opts.staleTime, state.isStale]);

  return {
    ...state,
    refetch: fetchPrices,
  };
}

/**
 * Get a specific asset price from prices object
 */
export function getAssetPrice(prices: Record<string, PriceData>, symbol: string): PriceData | null {
  return prices[symbol] || null;
}

/**
 * Calculate portfolio value given allocations and prices
 */
export function calculatePortfolioValue(
  allocations: Array<{ symbol: string; percentage: number }>,
  prices: Record<string, PriceData>,
  baseValue: number = 10000
): number {
  let totalValue = 0;

  for (const allocation of allocations) {
    const priceData = prices[allocation.symbol];
    if (priceData) {
      // Each allocation percentage represents that % of the base value
      // The price change affects that portion
      const allocationValue = (allocation.percentage / 100) * baseValue;
      // For simplicity, we just track the value as-is since we're not tracking
      // entry prices in this hook
      totalValue += allocationValue;
    }
  }

  return totalValue;
}

export default useLivePrices;


