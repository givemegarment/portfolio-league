import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { getCurrentWeek, getWeekKey } from '@/lib/weeks';
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

  // Get current week info
  const { season: currentSeason, week: currentWeekNum } = getCurrentWeek();
  
  // Get current prices for calculating scores
  const currentPrices = await fetchCurrentPrices();

  const history: HistoricalPortfolio[] = [];
  
  // Scan weeks from current week back to week 1 (scan last 16 weeks max for performance)
  const maxWeeksToScan = 16;
  const startWeek = Math.max(1, currentWeekNum - maxWeeksToScan + 1);
  
  for (let week = currentWeekNum; week >= startWeek; week--) {
    try {
      const weekKey = getWeekKey(currentSeason, week);
      
      // Get all portfolios for this week
      const allPortfolios = await redis.hgetall<Record<string, string>>(weekKey);
      
      if (!allPortfolios || Object.keys(allPortfolios).length === 0) {
        continue; // No portfolios for this week
      }
      
      // Find the user's address key (case-insensitive)
      const userAddressKey = Object.keys(allPortfolios).find(
        (k) => k.toLowerCase() === address.toLowerCase()
      );
      
      if (!userAddressKey) {
        continue; // User doesn't have a portfolio for this week
      }
      
      // Parse user's portfolio
      let portfolio: StoredPortfolio;
      try {
        const portfolioJson = allPortfolios[userAddressKey];
        const parsed = JSON.parse(portfolioJson);
        
        // Handle new format with entryPrices
        if (parsed.allocations && Array.isArray(parsed.allocations)) {
          portfolio = parsed as StoredPortfolio;
        }
        // Handle legacy format (just array of symbols)
        else if (Array.isArray(parsed)) {
          const symbols = parsed as string[];
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
        } else {
          continue; // Invalid format
        }
      } catch (parseError) {
        console.error(`Error parsing portfolio for week ${week}:`, parseError);
        continue;
      }
      
      const totalParticipants = Object.keys(allPortfolios).length;
      
      // Calculate scores for all participants to determine rank
      const scores: { address: string; score: number }[] = [];
      
      for (const [userAddr, portfolioJson] of Object.entries(allPortfolios)) {
        try {
          const parsed = JSON.parse(portfolioJson);
          let userPortfolio: StoredPortfolio;
          
          if (parsed.allocations && parsed.entryPrices) {
            userPortfolio = parsed as StoredPortfolio;
          } else if (parsed.allocations && Array.isArray(parsed.allocations)) {
            userPortfolio = {
              allocations: parsed.allocations,
              entryPrices: {},
              timestamp: parsed.timestamp || 0,
            };
          } else if (Array.isArray(parsed)) {
            const symbols = parsed as string[];
            const equalWeight = Math.floor(100 / symbols.length);
            const remainder = 100 - (equalWeight * symbols.length);
            userPortfolio = {
              allocations: symbols.map((symbol, idx) => ({
                symbol,
                percentage: equalWeight + (idx === 0 ? remainder : 0),
              })),
              entryPrices: {},
              timestamp: 0,
            };
          } else {
            scores.push({ address: userAddr, score: 0 });
            continue;
          }
          
          if (userPortfolio.entryPrices && Object.keys(userPortfolio.entryPrices).length > 0) {
            const result = calculateScore(userPortfolio, currentPrices);
            scores.push({ address: userAddr, score: result.totalScore });
          } else {
            scores.push({ address: userAddr, score: 0 });
          }
        } catch {
          scores.push({ address: userAddr, score: 0 });
        }
      }
      
      // Sort by score descending to determine ranks
      scores.sort((a, b) => b.score - a.score);
      
      // Find user's rank (1-indexed)
      const userRank = scores.findIndex(
        (s) => s.address.toLowerCase() === address.toLowerCase()
      ) + 1;
      
      // Get user's score
      const userScore = scores.find(
        (s) => s.address.toLowerCase() === address.toLowerCase()
      )?.score || 0;

      history.push({
        season: currentSeason,
        week,
        allocations: portfolio.allocations,
        entryPrices: portfolio.entryPrices,
        timestamp: portfolio.timestamp,
        finalScore: userScore,
        rank: userRank,
        totalParticipants,
      });
    } catch (error) {
      console.error(`Error processing portfolio for week ${week}:`, error);
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









