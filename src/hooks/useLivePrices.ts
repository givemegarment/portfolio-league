'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchFreshPrices,
  calculatePortfolioReturn,
  LIVE_REFRESH_INTERVAL,
  type PriceData as ServicePriceData
} from '@/services/priceService';

export type PriceData = {
  price: number;
  change24h: number;
  timestamp?: number;
};

export type PricesState = {
  prices: Record<string, PriceData>;
  lastUpdated: number | null;
  isLoading: boolean;
  error: string | null;
  isStale: boolean;
};

export type LivePortfolioState = {
  currentReturn: number;
  currentValue: number;
  entryValue: number;
  lastUpdated: number;
  isLoading: boolean;
  error: string | null;
  priceHistory: { timestamp: number; value: number; return: number }[];
};

type UseLivePricesOptions = {
  /** Polling interval in milliseconds (default: 30000 = 30 seconds) */
  interval?: number;
  /** Whether to start polling immediately (default: true) */
  enabled?: boolean;
  /** Consider data stale after this many milliseconds (default: 120000 = 2 minutes) */
  staleTime?: number;
  /** Force fresh fetch, bypassing cache */
  bypassCache?: boolean;
};

const DEFAULT_OPTIONS: Required<UseLivePricesOptions> = {
  interval: 30000, // 30 seconds
  enabled: true,
  staleTime: 120000, // 2 minutes
  bypassCache: false,
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
      const response = await fetchFreshPrices(opts.bypassCache);

      if (!mountedRef.current) return;

      // Convert service price data to hook price data format
      const prices: Record<string, PriceData> = {};
      for (const [symbol, data] of Object.entries(response.prices)) {
        prices[symbol] = {
          price: data.price,
          change24h: data.change24h,
          timestamp: data.timestamp
        };
      }

      setState(prev => ({
        ...prev,
        prices,
        lastUpdated: response.lastUpdated,
        isLoading: false,
        error: null,
        isStale: response.stale,
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
  }, [opts.bypassCache]);

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
 * Hook for live portfolio tracking with entry prices
 * Calculates real-time returns and maintains price history for charts
 */
export function useLivePortfolio(
  assets: string[],
  weights: number[],
  entryPrices: Record<string, number>,
  options: {
    enabled?: boolean;
    initialValue?: number;
    maxHistoryPoints?: number;
    refreshInterval?: number;
  } = {}
): LivePortfolioState & { refresh: () => Promise<void> } {
  const {
    enabled = true,
    initialValue = 100,
    maxHistoryPoints = 100,
    refreshInterval = LIVE_REFRESH_INTERVAL
  } = options;

  const [state, setState] = useState<LivePortfolioState>({
    currentReturn: 0,
    currentValue: initialValue,
    entryValue: initialValue,
    lastUpdated: 0,
    isLoading: true,
    error: null,
    priceHistory: []
  });

  const historyRef = useRef<{ timestamp: number; value: number; return: number }[]>([]);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!enabled || assets.length === 0 || Object.keys(entryPrices).length === 0) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const response = await fetchFreshPrices(true);

      if (!mountedRef.current) return;

      // Convert to the format expected by calculatePortfolioReturn
      const servicePrices: Record<string, ServicePriceData> = {};
      for (const [symbol, data] of Object.entries(response.prices)) {
        servicePrices[symbol] = {
          price: data.price,
          change24h: data.change24h,
          timestamp: data.timestamp
        };
      }

      const currentReturn = calculatePortfolioReturn(assets, weights, entryPrices, servicePrices);
      const currentValue = initialValue * (1 + currentReturn / 100);

      // Add to history
      const historyPoint = {
        timestamp: response.lastUpdated,
        value: currentValue,
        return: currentReturn
      };

      // Deduplicate by timestamp (within 10 second window)
      const lastPoint = historyRef.current[historyRef.current.length - 1];
      if (!lastPoint || (response.lastUpdated - lastPoint.timestamp) > 10000) {
        historyRef.current.push(historyPoint);

        // Trim history if needed
        if (historyRef.current.length > maxHistoryPoints) {
          historyRef.current = historyRef.current.slice(-maxHistoryPoints);
        }
      }

      setState({
        currentReturn,
        currentValue,
        entryValue: initialValue,
        lastUpdated: response.lastUpdated,
        isLoading: false,
        error: null,
        priceHistory: [...historyRef.current]
      });
    } catch (error) {
      if (!mountedRef.current) return;

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch prices'
      }));
    }
  }, [enabled, assets, weights, entryPrices, initialValue, maxHistoryPoints]);

  // Track mounted state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Initial fetch and when dependencies change
  useEffect(() => {
    if (enabled && assets.length > 0 && Object.keys(entryPrices).length > 0) {
      refresh();
    }
  }, [enabled, assets.join(','), JSON.stringify(entryPrices)]);

  // Set up polling interval
  useEffect(() => {
    if (!enabled || assets.length === 0 || Object.keys(entryPrices).length === 0) return;

    const intervalId = setInterval(refresh, refreshInterval);
    return () => clearInterval(intervalId);
  }, [enabled, assets.join(','), JSON.stringify(entryPrices), refreshInterval, refresh]);

  return { ...state, refresh };
}

/**
 * Hook to validate prices for lock-in
 * Returns validation status and fresh prices
 * Prices must be less than 30 seconds old to be valid
 */
export function usePriceValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    ageSeconds: number;
    prices: Record<string, PriceData>;
    timestamp: number;
  } | null>(null);

  const validate = useCallback(async (): Promise<{
    isValid: boolean;
    prices: Record<string, PriceData>;
    ageSeconds: number;
    timestamp: number;
  }> => {
    setIsValidating(true);

    try {
      const response = await fetchFreshPrices(true);
      const now = Date.now();
      const ageMs = now - response.lastUpdated;
      const ageSeconds = Math.floor(ageMs / 1000);
      const isValid = ageMs < 30000; // 30 seconds max age

      // Convert to hook format
      const prices: Record<string, PriceData> = {};
      for (const [symbol, data] of Object.entries(response.prices)) {
        prices[symbol] = {
          price: data.price,
          change24h: data.change24h,
          timestamp: data.timestamp
        };
      }

      const result = {
        isValid,
        ageSeconds,
        prices,
        timestamp: response.lastUpdated
      };

      setValidationResult(result);
      return result;
    } catch (error) {
      console.error('Price validation failed:', error);
      const result = {
        isValid: false,
        ageSeconds: -1,
        prices: {} as Record<string, PriceData>,
        timestamp: 0
      };
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  return {
    isValidating,
    validationResult,
    validate
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
