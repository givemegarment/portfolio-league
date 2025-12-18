import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { calculateScore, type StoredPortfolio, type PriceData } from '@/lib/scoring';

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

type PlayerStats = {
  address: string;
  totalCompetitions: number;
  bestRank: number | null;
  worstRank: number | null;
  winRate: number; // Percentage of top 10% finishes
  totalReturn: number; // Cumulative return across all competitions
  averageReturn: number;
  joinDate: number | null; // Timestamp of first competition entry
  lastActive: number | null; // Timestamp of most recent entry
  competitionBreakdown: {
    daily: number;
    weekly: number;
    monthly: number;
  };
};

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  const { address } = params;

  if (!address || !address.startsWith('0x')) {
    return NextResponse.json(
      { error: 'Invalid address' },
      { status: 400 }
    );
  }

  try {
    // Get all portfolio keys for this user
    const allKeys = await redis.keys('portfolio:*');
    
    // Fetch current prices for score calculation
    const currentPrices = await fetchCurrentPrices();
    
    const stats: PlayerStats = {
      address,
      totalCompetitions: 0,
      bestRank: null,
      worstRank: null,
      winRate: 0,
      totalReturn: 0,
      averageReturn: 0,
      joinDate: null,
      lastActive: null,
      competitionBreakdown: {
        daily: 0,
        weekly: 0,
        monthly: 0,
      },
    };

    const returns: number[] = [];
    const ranks: number[] = [];
    let topFinishes = 0;

    // Iterate through all competition weeks
    for (const key of allKeys) {
      // Get all portfolios to do case-insensitive address lookup
      // @upstash/redis auto-deserializes JSON, so we get objects directly
      const allPortfolios = await redis.hgetall<Record<string, StoredPortfolio>>(key);
      
      if (!allPortfolios) continue;
      
      // Find the user's address key (case-insensitive)
      const userAddressKey = Object.keys(allPortfolios).find(
        (k) => k.toLowerCase() === address.toLowerCase()
      );
      
      if (!userAddressKey) continue;
      
      // @upstash/redis auto-deserializes, so data is already an object
      const portfolio = allPortfolios[userAddressKey] as StoredPortfolio;
      
      stats.totalCompetitions++;

      // Track timestamp for join date / last active
      if (portfolio.timestamp) {
        if (!stats.joinDate || portfolio.timestamp < stats.joinDate) {
          stats.joinDate = portfolio.timestamp;
        }
        if (!stats.lastActive || portfolio.timestamp > stats.lastActive) {
          stats.lastActive = portfolio.timestamp;
        }
      }

      // Track competition type
      if (key.includes('daily')) {
        stats.competitionBreakdown.daily++;
      } else if (key.includes('monthly')) {
        stats.competitionBreakdown.monthly++;
      } else {
        stats.competitionBreakdown.weekly++;
      }

      // Calculate scores for all participants to determine rank
      const scores: { address: string; score: number }[] = [];
      
      for (const [userAddr, portfolioData] of Object.entries(allPortfolios)) {
        try {
          // @upstash/redis auto-deserializes, so portfolioData is already an object
          const userPortfolio = portfolioData as StoredPortfolio;
          
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
      
      // Sort by score descending
      scores.sort((a, b) => b.score - a.score);
      
      const totalParticipants = scores.length;
      
      // Find user's rank (1-indexed)
      const rank = scores.findIndex(
        (s) => s.address.toLowerCase() === address.toLowerCase()
      ) + 1;
      
      // Get user's score
      const userScore = scores.find(
        (s) => s.address.toLowerCase() === address.toLowerCase()
      )?.score || 0;
      
      returns.push(userScore);
      ranks.push(rank);

      // Check if top 10%
      if (rank <= Math.ceil(totalParticipants * 0.1)) {
        topFinishes++;
      }
    }

    // Calculate aggregates
    if (stats.totalCompetitions > 0) {
      stats.winRate = Math.round((topFinishes / stats.totalCompetitions) * 100);
      
      if (ranks.length > 0) {
        stats.bestRank = Math.min(...ranks);
        stats.worstRank = Math.max(...ranks);
      }

      if (returns.length > 0) {
        stats.totalReturn = returns.reduce((a, b) => a + b, 0);
        stats.averageReturn = stats.totalReturn / returns.length;
      }
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}









