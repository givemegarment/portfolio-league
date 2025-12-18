import { NextResponse } from 'next/server';
import { redis, getAllPortfolioKeys } from '@/lib/redis';
import { getCurrentWeek } from '@/lib/weeks';
import { calculateScore, type StoredPortfolio, type PriceData } from '@/lib/scoring';

type HistoricalPortfolio = {
  season: string;
  week: number;
  allocations: { symbol: string; percentage: number }[];
  entryPrices: Record<string, number>;
  timestamp: number;
  finalScore?: number;
  rank?: number;
};

type PerformanceDataPoint = {
  timestamp: number;
  date: string;
  portfolioValue: number;
  portfolioReturn: number;
  benchmarkValue: number;
  benchmarkReturn: number;
};

type PricesResponse = {
  prices: Record<string, PriceData>;
  lastUpdated: number;
  cached: boolean;
};

/**
 * Get the base URL for internal API calls
 */
function getBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  return 'http://localhost:3000';
}

/**
 * Fetch current prices from our prices API
 */
async function fetchCurrentPrices(): Promise<Record<string, PriceData>> {
  const baseUrl = getBaseUrl();
  
  try {
    const response = await fetch(`${baseUrl}/api/prices`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch prices');
    }
    
    const data: PricesResponse = await response.json();
    return data.prices;
  } catch (error) {
    console.error('Error fetching prices:', error);
    return {
      BTC: { price: 97000, change24h: 0 },
      ETH: { price: 3600, change24h: 0 },
      SOL: { price: 230, change24h: 0 },
      USDC: { price: 1, change24h: 0 },
    };
  }
}

/**
 * Calculate benchmark return (BTC or market average)
 */
function calculateBenchmarkReturn(
  benchmark: 'BTC' | 'market',
  prices: Record<string, PriceData>,
  historicalPrices: Record<string, number[]>,
  timestamp: number
): number {
  if (benchmark === 'BTC') {
    const btcPrices = historicalPrices['BTC'] || [];
    const currentBtcPrice = prices['BTC']?.price || 97000;
    
    if (btcPrices.length === 0) return 0;
    
    // Find closest historical BTC price
    // For simplicity, use first entry price as baseline
    const baselinePrice = btcPrices[0] || currentBtcPrice;
    return ((currentBtcPrice - baselinePrice) / baselinePrice) * 100;
  }
  
  // Market average: calculate average return of all major assets
  const majorAssets = ['BTC', 'ETH', 'SOL'];
  let totalReturn = 0;
  let count = 0;
  
  for (const asset of majorAssets) {
    const assetPrices = historicalPrices[asset] || [];
    const currentPrice = prices[asset]?.price;
    
    if (assetPrices.length > 0 && currentPrice) {
      const baselinePrice = assetPrices[0] || currentPrice;
      const assetReturn = ((currentPrice - baselinePrice) / baselinePrice) * 100;
      totalReturn += assetReturn;
      count++;
    }
  }
  
  return count > 0 ? totalReturn / count : 0;
}

/**
 * GET /api/portfolio/performance?address=0x...&range=1M&benchmark=BTC
 * 
 * Returns portfolio performance over time with benchmark comparison
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  const range = searchParams.get('range') || '1M'; // 24h, 1W, 1M, 3M, All
  const benchmark = (searchParams.get('benchmark') || 'BTC') as 'BTC' | 'market';

  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 });
  }

  // Calculate time range
  const now = Date.now();
  let startTime = now;
  
  switch (range) {
    case '24h':
      startTime = now - 24 * 60 * 60 * 1000;
      break;
    case '1W':
      startTime = now - 7 * 24 * 60 * 60 * 1000;
      break;
    case '1M':
      startTime = now - 30 * 24 * 60 * 60 * 1000;
      break;
    case '3M':
      startTime = now - 90 * 24 * 60 * 60 * 1000;
      break;
    case 'All':
      startTime = 0;
      break;
  }

  // Get all portfolio keys
  const allKeys = await getAllPortfolioKeys();
  
  if (allKeys.length === 0) {
    return NextResponse.json({ 
      address,
      data: [],
      benchmark,
      range,
    });
  }

  // Get current prices
  const currentPrices = await fetchCurrentPrices();
  const { season: currentSeason, week: currentWeekNum } = getCurrentWeek();

  const history: HistoricalPortfolio[] = [];
  const historicalPrices: Record<string, number[]> = {};

  // Fetch portfolio from each week key
  for (const key of allKeys) {
    const parts = key.split(':');
    if (parts.length !== 3) continue;
    
    const season = parts[1];
    const week = parseInt(parts[2]);
    
    if (isNaN(week)) continue;

    try {
      const allPortfolios = await redis.hgetall<Record<string, StoredPortfolio>>(key);
      
      if (!allPortfolios) continue;
      
      const userAddressKey = Object.keys(allPortfolios).find(
        (k) => k.toLowerCase() === address.toLowerCase()
      );
      
      if (!userAddressKey) continue;
      
      const portfolio = allPortfolios[userAddressKey] as StoredPortfolio;
      
      // Store entry prices for benchmark calculation
      for (const [symbol, price] of Object.entries(portfolio.entryPrices)) {
        if (!historicalPrices[symbol]) {
          historicalPrices[symbol] = [];
        }
        historicalPrices[symbol].push(price);
      }
      
      // Calculate score
      const result = calculateScore(portfolio, currentPrices);
      
      history.push({
        season,
        week,
        allocations: portfolio.allocations,
        entryPrices: portfolio.entryPrices,
        timestamp: portfolio.timestamp,
        finalScore: result.totalScore,
      });
    } catch (error) {
      console.error(`Error processing portfolio for key ${key}:`, error);
      continue;
    }
  }

  // Filter by time range and sort
  const filteredHistory = history
    .filter(h => h.timestamp >= startTime)
    .sort((a, b) => a.timestamp - b.timestamp);

  if (filteredHistory.length === 0) {
    return NextResponse.json({ 
      address,
      data: [],
      benchmark,
      range,
    });
  }

  // Build performance data points
  const data: PerformanceDataPoint[] = [];
  let cumulativeReturn = 0;
  let benchmarkCumulativeReturn = 0;
  const initialValue = 10000; // Starting portfolio value

  for (const entry of filteredHistory) {
    cumulativeReturn += entry.finalScore || 0;
    
    // Calculate benchmark return for this point
    const benchmarkReturn = calculateBenchmarkReturn(
      benchmark,
      currentPrices,
      historicalPrices,
      entry.timestamp
    );
    benchmarkCumulativeReturn = benchmarkReturn; // Simplified: use current benchmark
    
    const date = new Date(entry.timestamp);
    
    data.push({
      timestamp: entry.timestamp,
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      }),
      portfolioValue: initialValue * (1 + cumulativeReturn / 100),
      portfolioReturn: cumulativeReturn,
      benchmarkValue: initialValue * (1 + benchmarkCumulativeReturn / 100),
      benchmarkReturn: benchmarkCumulativeReturn,
    });
  }

  return NextResponse.json({
    address,
    data,
    benchmark,
    range,
    summary: {
      totalReturn: cumulativeReturn,
      benchmarkReturn: benchmarkCumulativeReturn,
      outperformance: cumulativeReturn - benchmarkCumulativeReturn,
    },
  });
}
