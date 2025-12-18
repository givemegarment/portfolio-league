import { NextResponse } from 'next/server';
import { redis, getAllPortfolioKeys } from '@/lib/redis';
import { getCurrentWeek } from '@/lib/weeks';
import { calculateScore, calculateRiskMetrics, type StoredPortfolio, type PriceData } from '@/lib/scoring';

type HistoricalPortfolio = {
  season: string;
  week: number;
  allocations: { symbol: string; percentage: number }[];
  entryPrices: Record<string, number>;
  timestamp: number;
  finalScore?: number;
  rank?: number;
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
 * Calculate correlation between two assets
 */
function calculateCorrelation(
  asset1Returns: number[],
  asset2Returns: number[]
): number {
  if (asset1Returns.length !== asset2Returns.length || asset1Returns.length < 2) {
    return 0;
  }

  const mean1 = asset1Returns.reduce((a, b) => a + b, 0) / asset1Returns.length;
  const mean2 = asset2Returns.reduce((a, b) => a + b, 0) / asset2Returns.length;

  let numerator = 0;
  let sumSq1 = 0;
  let sumSq2 = 0;

  for (let i = 0; i < asset1Returns.length; i++) {
    const diff1 = asset1Returns[i] - mean1;
    const diff2 = asset2Returns[i] - mean2;
    numerator += diff1 * diff2;
    sumSq1 += diff1 * diff1;
    sumSq2 += diff2 * diff2;
  }

  const denominator = Math.sqrt(sumSq1 * sumSq2);
  if (denominator === 0) return 0;

  return numerator / denominator;
}

/**
 * GET /api/portfolio/analytics?address=0x...
 * 
 * Returns comprehensive analytics data for a portfolio
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 });
  }

  // Get all portfolio keys
  const allKeys = await getAllPortfolioKeys();
  
  if (allKeys.length === 0) {
    return NextResponse.json({ 
      address,
      analytics: null,
      error: 'No portfolio data found',
    });
  }

  // Get current prices
  const currentPrices = await fetchCurrentPrices();
  const { season: currentSeason, week: currentWeekNum } = getCurrentWeek();

  const history: HistoricalPortfolio[] = [];
  const weeklyReturns: number[] = [];
  const assetReturns: Record<string, number[]> = {};

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
      const result = calculateScore(portfolio, currentPrices);
      
      history.push({
        season,
        week,
        allocations: portfolio.allocations,
        entryPrices: portfolio.entryPrices,
        timestamp: portfolio.timestamp,
        finalScore: result.totalScore,
      });

      weeklyReturns.push(result.totalScore);

      // Track asset returns
      for (const breakdown of result.breakdown) {
        if (!assetReturns[breakdown.symbol]) {
          assetReturns[breakdown.symbol] = [];
        }
        assetReturns[breakdown.symbol].push(breakdown.assetReturn);
      }
    } catch (error) {
      console.error(`Error processing portfolio for key ${key}:`, error);
      continue;
    }
  }

  if (history.length === 0) {
    return NextResponse.json({ 
      address,
      analytics: null,
      error: 'No portfolio history found for this address',
    });
  }

  // Calculate win/loss ratio
  const wins = weeklyReturns.filter(r => r > 0).length;
  const losses = weeklyReturns.filter(r => r < 0).length;
  const winRate = weeklyReturns.length > 0 ? (wins / weeklyReturns.length) * 100 : 0;

  // Calculate best/worst performing assets
  const assetPerformance: Array<{
    symbol: string;
    averageReturn: number;
    totalReturn: number;
    weeksHeld: number;
  }> = [];

  for (const [symbol, returns] of Object.entries(assetReturns)) {
    if (returns.length > 0) {
      const averageReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
      const totalReturn = returns.reduce((a, b) => a + b, 0);
      assetPerformance.push({
        symbol,
        averageReturn,
        totalReturn,
        weeksHeld: returns.length,
      });
    }
  }

  assetPerformance.sort((a, b) => b.averageReturn - a.averageReturn);
  const bestAssets = assetPerformance.slice(0, 5);
  const worstAssets = assetPerformance.slice(-5).reverse();

  // Calculate risk metrics
  const riskMetrics = calculateRiskMetrics(
    history[history.length - 1]?.allocations || [],
    weeklyReturns
  );

  // Calculate correlation matrix
  const allSymbols = Object.keys(assetReturns);
  const correlationMatrix: Record<string, Record<string, number>> = {};

  for (let i = 0; i < allSymbols.length; i++) {
    const symbol1 = allSymbols[i];
    correlationMatrix[symbol1] = {};
    
    for (let j = 0; j < allSymbols.length; j++) {
      const symbol2 = allSymbols[j];
      
      if (symbol1 === symbol2) {
        correlationMatrix[symbol1][symbol2] = 1;
      } else {
        const returns1 = assetReturns[symbol1] || [];
        const returns2 = assetReturns[symbol2] || [];
        
        // Align returns by week (simplified - in real app, match by timestamp)
        const minLength = Math.min(returns1.length, returns2.length);
        const aligned1 = returns1.slice(-minLength);
        const aligned2 = returns2.slice(-minLength);
        
        correlationMatrix[symbol1][symbol2] = calculateCorrelation(aligned1, aligned2);
      }
    }
  }

  // Calculate total portfolio value over time
  const portfolioValueHistory = history.map((entry, index) => {
    const cumulativeReturn = weeklyReturns.slice(0, index + 1).reduce((a, b) => a + b, 0);
    return {
      timestamp: entry.timestamp,
      date: new Date(entry.timestamp).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      value: 10000 * (1 + cumulativeReturn / 100),
      return: cumulativeReturn,
    };
  });

  return NextResponse.json({
    address,
    analytics: {
      winLossRatio: {
        wins,
        losses,
        winRate,
        totalWeeks: weeklyReturns.length,
      },
      bestPerformingAssets: bestAssets,
      worstPerformingAssets: worstAssets,
      riskMetrics,
      correlationMatrix,
      portfolioValueHistory,
      totalReturn: weeklyReturns.reduce((a, b) => a + b, 0),
      averageReturn: weeklyReturns.length > 0 
        ? weeklyReturns.reduce((a, b) => a + b, 0) / weeklyReturns.length 
        : 0,
    },
  });
}
