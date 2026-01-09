/**
 * Centralized Price Service
 * Provides fresh, validated price data for portfolio operations
 */

export type PriceData = {
  price: number;
  change24h: number;
  timestamp: number;
};

export type PriceResponse = {
  prices: Record<string, PriceData>;
  lastUpdated: number;
  cached: boolean;
  stale: boolean;
};

export type ValidatedPrices = {
  prices: Record<string, PriceData>;
  timestamp: number;
  isValid: boolean;
  ageSeconds: number;
};

// Maximum age for prices to be considered valid for lock-in (30 seconds)
const MAX_PRICE_AGE_MS = 30 * 1000;

// Price refresh interval for live tracking (30 seconds)
export const LIVE_REFRESH_INTERVAL = 30 * 1000;

// In-memory cache for prices
let cachedPrices: PriceResponse | null = null;
let lastFetchTime = 0;

/**
 * Fetch fresh prices from the API, bypassing cache if needed
 */
export async function fetchFreshPrices(bypassCache = false): Promise<PriceResponse> {
  const now = Date.now();

  // If we have cached prices less than 5 seconds old and not bypassing, return them
  if (!bypassCache && cachedPrices && (now - lastFetchTime) < 5000) {
    return {
      ...cachedPrices,
      stale: (now - cachedPrices.lastUpdated) > MAX_PRICE_AGE_MS
    };
  }

  try {
    // Add cache-busting parameter for fresh data
    const url = bypassCache
      ? `/api/prices?t=${now}&fresh=true`
      : `/api/prices?t=${now}`;

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch prices: ${response.status}`);
    }

    const data = await response.json();

    // Normalize the response
    const normalized: PriceResponse = {
      prices: {},
      lastUpdated: data.lastUpdated || now,
      cached: data.cached || false,
      stale: false
    };

    // Transform prices to include timestamp
    if (data.prices) {
      for (const [symbol, priceInfo] of Object.entries(data.prices)) {
        const info = priceInfo as { price: number; change24h: number };
        normalized.prices[symbol] = {
          price: info.price,
          change24h: info.change24h,
          timestamp: data.lastUpdated || now
        };
      }
    }

    normalized.stale = (now - normalized.lastUpdated) > MAX_PRICE_AGE_MS;

    // Update cache
    cachedPrices = normalized;
    lastFetchTime = now;

    return normalized;
  } catch (error) {
    console.error('Price fetch error:', error);

    // Return cached data if available, marked as stale
    if (cachedPrices) {
      return {
        ...cachedPrices,
        stale: true
      };
    }

    throw error;
  }
}

/**
 * Validate that prices are fresh enough for portfolio lock-in
 * Prices must be less than 30 seconds old
 */
export async function validatePricesForLockIn(symbols: string[]): Promise<ValidatedPrices> {
  const now = Date.now();

  // Always fetch fresh prices for lock-in validation
  const response = await fetchFreshPrices(true);

  const ageMs = now - response.lastUpdated;
  const ageSeconds = Math.floor(ageMs / 1000);
  const isValid = ageMs < MAX_PRICE_AGE_MS;

  // Validate that all requested symbols have prices
  const missingSymbols = symbols.filter(s => !response.prices[s]);
  if (missingSymbols.length > 0) {
    console.warn('Missing prices for symbols:', missingSymbols);
  }

  return {
    prices: response.prices,
    timestamp: response.lastUpdated,
    isValid,
    ageSeconds
  };
}

/**
 * Get current price for a single symbol
 */
export async function getCurrentPrice(symbol: string): Promise<PriceData | null> {
  const response = await fetchFreshPrices();
  return response.prices[symbol] || null;
}

/**
 * Calculate portfolio return based on entry and current prices
 */
export function calculatePortfolioReturn(
  assets: string[],
  weights: number[],
  entryPrices: Record<string, number>,
  currentPrices: Record<string, PriceData>
): number {
  if (assets.length !== weights.length) {
    console.error('Assets and weights length mismatch');
    return 0;
  }

  let totalReturn = 0;
  let totalWeight = 0;

  for (let i = 0; i < assets.length; i++) {
    const symbol = assets[i];
    const weight = weights[i] || (100 / assets.length);
    const entryPrice = entryPrices[symbol];
    const currentPrice = currentPrices[symbol]?.price;

    if (entryPrice && currentPrice && entryPrice > 0) {
      const assetReturn = ((currentPrice - entryPrice) / entryPrice) * 100;
      totalReturn += assetReturn * (weight / 100);
      totalWeight += weight;
    }
  }

  // Normalize if we didn't get all prices
  if (totalWeight > 0 && totalWeight < 100) {
    totalReturn = totalReturn * (100 / totalWeight);
  }

  return totalReturn;
}

/**
 * Format price for display
 */
export function formatPrice(price: number | undefined): string {
  if (price === undefined || price === null) return '—';
  if (price >= 1000) return `$${(price / 1000).toFixed(1)}k`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

/**
 * Format percentage change for display
 */
export function formatChange(change: number | undefined): string {
  if (change === undefined || change === null) return '';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

/**
 * Clear the price cache (useful for testing or forcing refresh)
 */
export function clearPriceCache(): void {
  cachedPrices = null;
  lastFetchTime = 0;
}
