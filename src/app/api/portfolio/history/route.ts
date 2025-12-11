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
  totalParticipants?: number;
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
      // Get all portfolios for this week to calculate rank
      // @upstash/redis auto-deserializes JSON, so we get objects directly
      const allPortfolios = await redis.hgetall<Record<string, StoredPortfolio>>(key);
      
      if (!allPortfolios) continue;
      
      // Find the user's address key (case-insensitive) since Ethereum addresses are case-insensitive
      const userAddressKey = Object.keys(allPortfolios).find(
        (k) => k.toLowerCase() === address.toLowerCase()
      );
      
      if (!userAddressKey) continue;
      
      const totalParticipants = Object.keys(allPortfolios).length;
      
      // Calculate scores for all participants to determine rank
      const scores: { address: string; score: number }[] = [];
      
      for (const [userAddress, portfolioData] of Object.entries(allPortfolios)) {
        try {
          // @upstash/redis auto-deserializes, so portfolioData is already an object
          const userPortfolio = portfolioData as StoredPortfolio;
          
          if (userPortfolio.entryPrices && Object.keys(userPortfolio.entryPrices).length > 0) {
            const result = calculateScore(userPortfolio, currentPrices);
            scores.push({ address: userAddress, score: result.totalScore });
          } else {
            scores.push({ address: userAddress, score: 0 });
          }
        } catch {
          scores.push({ address: userAddress, score: 0 });
        }
      }
      
      // Sort by score descending to determine ranks
      scores.sort((a, b) => b.score - a.score);
      
      // Find user's rank (1-indexed)
      const userRank = scores.findIndex(
        (s) => s.address.toLowerCase() === address.toLowerCase()
      ) + 1;
      
      // Get user's portfolio and score using the actual key from Redis
      const portfolio = allPortfolios[userAddressKey] as StoredPortfolio;
      const userScore = scores.find(
        (s) => s.address.toLowerCase() === address.toLowerCase()
      )?.score || 0;

      history.push({
        season,
        week,
        allocations: portfolio.allocations,
        entryPrices: portfolio.entryPrices,
        timestamp: portfolio.timestamp,
        finalScore: userScore,
        rank: userRank,
        totalParticipants,
      });
    } catch (error) {
      console.error(`Error processing portfolio for key ${key}:`, error);
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





