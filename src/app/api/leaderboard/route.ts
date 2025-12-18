import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { getCurrentWeek, getWeekKey } from '@/lib/weeks';
import { calculateScore, type StoredPortfolio, type AllocationItem, type PriceData } from '@/lib/scoring';

type PricesResponse = {
  prices: Record<string, PriceData>;
  lastUpdated: number;
  cached: boolean;
};

type LeaderRow = { 
  rank: number; 
  user: string; 
  score: number; 
  allocations: AllocationItem[];
  entryPrices: Record<string, number>;
};

/**
 * Fetch current prices from our prices API
 */
async function fetchCurrentPrices(): Promise<Record<string, PriceData>> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
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
    // Fallback prices
    return {
      BTC: { price: 97000, change24h: 0 },
      ETH: { price: 3600, change24h: 0 },
      SOL: { price: 230, change24h: 0 },
      USDC: { price: 1, change24h: 0 },
    };
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get('limit');
  const seasonParam = searchParams.get('season');
  const weekParam = searchParams.get('week');
  const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam))) : 50;

  // Get week - use provided or current
  const currentWeek = getCurrentWeek();
  const season = seasonParam || currentWeek.season;
  const week = weekParam ? parseInt(weekParam) : currentWeek.week;
  const weekKey = getWeekKey(season, week);

  console.log(`[Leaderboard] Fetching portfolios for ${weekKey}`);

  // Fetch all portfolios for this week
  // @upstash/redis auto-deserializes JSON, so we get objects directly
  let allPortfolios: Record<string, StoredPortfolio | string[]> | null = null;
  
  try {
    allPortfolios = await redis.hgetall<Record<string, StoredPortfolio | string[]>>(weekKey);
    console.log(`[Leaderboard] Found ${allPortfolios ? Object.keys(allPortfolios).length : 0} portfolios`);
  } catch (error) {
    console.error('[Leaderboard] Redis error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard data' }, { status: 500 });
  }
  
  if (!allPortfolios || Object.keys(allPortfolios).length === 0) {
    console.log('[Leaderboard] No portfolios found for current week');
    return NextResponse.json([]);
  }

  // Fetch current prices
  const currentPrices = await fetchCurrentPrices();

  // Calculate scores for all portfolios
  const scoredPortfolios: Array<{
    address: string;
    portfolio: StoredPortfolio;
    score: number;
  }> = [];

  for (const [address, portfolioData] of Object.entries(allPortfolios)) {
    try {
      // @upstash/redis auto-deserializes, so portfolioData is already an object
      let portfolio: StoredPortfolio;
      
      // Handle new format with entryPrices (already deserialized)
      if (typeof portfolioData === 'object' && !Array.isArray(portfolioData) && portfolioData.allocations && portfolioData.entryPrices) {
        portfolio = portfolioData as StoredPortfolio;
      }
      // Handle legacy format without entryPrices
      else if (typeof portfolioData === 'object' && !Array.isArray(portfolioData) && portfolioData.allocations && Array.isArray(portfolioData.allocations)) {
        // For legacy data without entry prices, we can't calculate real scores
        // Use 0 as score or skip
        portfolio = {
          allocations: portfolioData.allocations,
          entryPrices: {},
          timestamp: portfolioData.timestamp || 0,
        };
      }
      // Handle very old format (just array of symbols)
      else if (Array.isArray(portfolioData)) {
        const symbols = portfolioData as string[];
        const equalWeight = Math.floor(100 / symbols.length);
        const remainder = 100 - (equalWeight * symbols.length);
        
        portfolio = {
          allocations: symbols.map((symbol, idx) => ({
            symbol,
            percentage: equalWeight + (idx === 0 ? remainder : 0),
          })),
          entryPrices: {},
          timestamp: 0,
        };
      }
      else {
        continue; // Skip invalid data
      }

      // Calculate score
      let score = 0;
      
      if (Object.keys(portfolio.entryPrices).length > 0) {
        // Real score calculation
        const result = calculateScore(portfolio, currentPrices);
        score = result.totalScore;
      }
      // If no entry prices (legacy data), score stays 0

      scoredPortfolios.push({
        address,
        portfolio,
        score,
      });
    } catch (error) {
      console.error(`Error processing portfolio for ${address}:`, error);
      continue;
    }
  }

  // Sort by score descending
  scoredPortfolios.sort((a, b) => b.score - a.score);

  // Build leaderboard rows
  const rows: LeaderRow[] = scoredPortfolios.slice(0, limit).map((item, index) => ({
    rank: index + 1,
    user: item.address,
    score: item.score,
    allocations: item.portfolio.allocations,
    entryPrices: item.portfolio.entryPrices,
  }));

  return NextResponse.json(rows);
}

// Keep POST for admin/testing purposes but mark as deprecated
export async function POST(req: Request) {
  // This is now deprecated - scores are calculated live
  // Keeping for backwards compatibility during transition
  
  const body = await req.json();
  
  if (!body?.user || !body?.portfolio) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { season, week } = getCurrentWeek();
  const weekKey = getWeekKey(season, week);

  // Fetch current prices for entry snapshot
  const currentPrices = await fetchCurrentPrices();
  const entryPrices: Record<string, number> = {};
  
  for (const allocation of body.portfolio) {
    const priceData = currentPrices[allocation.symbol];
    if (priceData) {
      entryPrices[allocation.symbol] = priceData.price;
    }
  }

  const portfolioData: StoredPortfolio = {
    allocations: body.portfolio,
    entryPrices,
    timestamp: Date.now(),
  };

  // @upstash/redis auto-serializes objects, so don't use JSON.stringify
  await redis.hset(weekKey, {
    [body.user]: portfolioData,
  });

  return NextResponse.json({ ok: true, message: 'Portfolio saved via leaderboard API (deprecated)' });
}

export async function DELETE() {
  // Clear current week's data (for testing)
  const { season, week } = getCurrentWeek();
  const weekKey = getWeekKey(season, week);
  
  await redis.del(weekKey);
  
  // Also clear old leaderboard key if it exists
  await redis.del('leaderboard');
  
  return NextResponse.json({ ok: true, message: `Cleared ${weekKey}` });
}
