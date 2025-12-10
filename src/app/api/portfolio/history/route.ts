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

type PricesResponse = {
  prices: Record<string, PriceData>;
  lastUpdated: number;
  cached: boolean;
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
    return {
      BTC: { price: 97000, change24h: 0 },
      ETH: { price: 3600, change24h: 0 },
      SOL: { price: 230, change24h: 0 },
      USDC: { price: 1, change24h: 0 },
    };
  }
}

/**
 * GET /api/portfolio/history?address=0x...
 * 
 * Returns all historical portfolios for a user across all seasons/weeks.
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
      history: [],
      currentWeek: getCurrentWeek(),
    });
  }

  // Get current prices for calculating current week's score
  const currentPrices = await fetchCurrentPrices();
  const { season: currentSeason, week: currentWeekNum } = getCurrentWeek();

  const history: HistoricalPortfolio[] = [];

  // Fetch portfolio from each week key
  for (const key of allKeys) {
    // Parse key format: portfolio:s1:53
    const parts = key.split(':');
    if (parts.length !== 3) continue;
    
    const season = parts[1];
    const week = parseInt(parts[2]);
    
    if (isNaN(week)) continue;

    try {
      const portfolioJson = await redis.hget<string>(key, address);
      
      if (!portfolioJson) continue;

      const portfolio: StoredPortfolio = JSON.parse(portfolioJson);
      
      // Calculate score for this portfolio
      let finalScore: number | undefined;
      
      if (portfolio.entryPrices && Object.keys(portfolio.entryPrices).length > 0) {
        // For current week, use current prices
        // For past weeks, we'd ideally have final prices stored, but for now use current
        const result = calculateScore(portfolio, currentPrices);
        finalScore = result.totalScore;
      }

      history.push({
        season,
        week,
        allocations: portfolio.allocations,
        entryPrices: portfolio.entryPrices,
        timestamp: portfolio.timestamp,
        finalScore,
      });
    } catch (error) {
      console.error(`Error parsing portfolio for key ${key}:`, error);
      continue;
    }
  }

  // Sort by season and week (newest first)
  history.sort((a, b) => {
    if (a.season !== b.season) {
      return b.season.localeCompare(a.season);
    }
    return b.week - a.week;
  });

  return NextResponse.json({
    address,
    history,
    currentWeek: {
      season: currentSeason,
      week: currentWeekNum,
    },
    totalWeeksPlayed: history.length,
  });
}


