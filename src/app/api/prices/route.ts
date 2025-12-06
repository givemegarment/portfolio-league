import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { SUPPORTED_ASSETS, getCoingeckoIdsString } from '@/lib/assets';

const CACHE_KEY = 'prices:current';
const CACHE_TTL_SECONDS = 60; // Cache for 60 seconds to avoid rate limits

type CoinGeckoResponse = {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
};

type PriceData = {
  price: number;
  change24h: number;
};

type PricesResponse = {
  prices: Record<string, PriceData>;
  lastUpdated: number;
  cached: boolean;
};

async function fetchFromCoinGecko(): Promise<Record<string, PriceData>> {
  const ids = getCoingeckoIdsString();
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
    // Don't cache at fetch level, we handle caching ourselves
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const data: CoinGeckoResponse = await response.json();

  // Transform CoinGecko response to our format using asset definitions
  const prices: Record<string, PriceData> = {};

  for (const asset of SUPPORTED_ASSETS) {
    const coinData = data[asset.coingeckoId];
    if (coinData) {
      prices[asset.symbol] = {
        price: coinData.usd,
        change24h: coinData.usd_24h_change ?? 0,
      };
    }
  }

  return prices;
}

export async function GET(): Promise<NextResponse<PricesResponse | { error: string }>> {
  try {
    // Try to get cached prices first
    const cached = await redis.get<{ prices: Record<string, PriceData>; lastUpdated: number }>(CACHE_KEY);

    if (cached && cached.prices && cached.lastUpdated) {
      const age = Date.now() - cached.lastUpdated;
      
      // Return cached data if still fresh
      if (age < CACHE_TTL_SECONDS * 1000) {
        return NextResponse.json({
          prices: cached.prices,
          lastUpdated: cached.lastUpdated,
          cached: true,
        });
      }
    }

    // Fetch fresh prices from CoinGecko
    const prices = await fetchFromCoinGecko();
    const lastUpdated = Date.now();

    // Cache the result
    await redis.set(
      CACHE_KEY,
      { prices, lastUpdated },
      { ex: CACHE_TTL_SECONDS }
    );

    return NextResponse.json({
      prices,
      lastUpdated,
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching prices:', error);

    // If we have stale cached data, return it as fallback
    const cached = await redis.get<{ prices: Record<string, PriceData>; lastUpdated: number }>(CACHE_KEY);
    if (cached && cached.prices) {
      return NextResponse.json({
        prices: cached.prices,
        lastUpdated: cached.lastUpdated,
        cached: true,
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}
