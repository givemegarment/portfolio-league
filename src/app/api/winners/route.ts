import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { getCurrentWeek, getWeekKey, getWeekForDate } from '@/lib/weeks';
import { calculateScore, type StoredPortfolio, type AllocationItem, type PriceData } from '@/lib/scoring';

type PricesResponse = {
  prices: Record<string, PriceData>;
  lastUpdated: number;
  cached: boolean;
};

type Winner = {
  rank: number;
  address: string;
  score: number;
  allocations: AllocationItem[];
  week: number;
  season: string;
};

/**
 * Get the previous week's information
 */
function getPreviousWeek(): { season: string; week: number; startsAt: Date; endsAt: Date } {
  const now = new Date();
  // Go back 7 days to get previous week
  const previousWeekDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekInfo = getWeekForDate(previousWeekDate);
  return weekInfo;
}

/**
 * Fetch prices - for past weeks we use stored entry prices as "final" prices
 * since the week is over
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
    return {};
  }
}

/**
 * GET /api/winners
 * 
 * Returns the top 3 winners from the previous week
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const weekParam = searchParams.get('week');
  const seasonParam = searchParams.get('season') || 's1';
  
  let targetWeek: number;
  let targetSeason: string;
  
  if (weekParam) {
    // Specific week requested
    targetWeek = parseInt(weekParam);
    targetSeason = seasonParam;
  } else {
    // Default to previous week
    const prevWeek = getPreviousWeek();
    targetWeek = prevWeek.week;
    targetSeason = prevWeek.season;
  }
  
  // Don't return winners for current week (still in progress)
  const currentWeek = getCurrentWeek();
  if (targetSeason === currentWeek.season && targetWeek >= currentWeek.week) {
    return NextResponse.json({
      winners: [],
      message: 'Winners not yet determined for current/future weeks',
      week: targetWeek,
      season: targetSeason,
    });
  }
  
  const weekKey = getWeekKey(targetSeason, targetWeek);
  console.log(`[Winners] Fetching winners for ${weekKey}`);
  
  // Fetch all portfolios for the target week
  let allPortfolios: Record<string, string> | null = null;
  
  try {
    allPortfolios = await redis.hgetall<Record<string, string>>(weekKey);
  } catch (error) {
    console.error('[Winners] Redis error:', error);
    return NextResponse.json({ error: 'Failed to fetch winners data' }, { status: 500 });
  }
  
  if (!allPortfolios || Object.keys(allPortfolios).length === 0) {
    console.log(`[Winners] No portfolios found for ${weekKey}`);
    return NextResponse.json({
      winners: [],
      message: 'No portfolios found for this week',
      week: targetWeek,
      season: targetSeason,
    });
  }
  
  // Fetch current prices for scoring
  const currentPrices = await fetchCurrentPrices();
  
  // Calculate scores for all portfolios
  const scoredPortfolios: Array<{
    address: string;
    portfolio: StoredPortfolio;
    score: number;
  }> = [];
  
  for (const [address, portfolioJson] of Object.entries(allPortfolios)) {
    try {
      const parsed = JSON.parse(portfolioJson);
      
      let portfolio: StoredPortfolio;
      
      if (parsed.allocations && parsed.entryPrices) {
        portfolio = parsed as StoredPortfolio;
      } else if (parsed.allocations && Array.isArray(parsed.allocations)) {
        portfolio = {
          allocations: parsed.allocations,
          entryPrices: {},
          timestamp: parsed.timestamp || 0,
        };
      } else if (Array.isArray(parsed)) {
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
        continue;
      }
      
      // Calculate score
      let score = 0;
      
      if (Object.keys(portfolio.entryPrices).length > 0 && Object.keys(currentPrices).length > 0) {
        const result = calculateScore(portfolio, currentPrices);
        score = result.totalScore;
      }
      
      scoredPortfolios.push({
        address,
        portfolio,
        score,
      });
    } catch (error) {
      console.error(`[Winners] Error parsing portfolio for ${address}:`, error);
      continue;
    }
  }
  
  // Sort by score descending
  scoredPortfolios.sort((a, b) => b.score - a.score);
  
  // Get top 3 winners
  const winners: Winner[] = scoredPortfolios.slice(0, 3).map((item, index) => ({
    rank: index + 1,
    address: item.address,
    score: item.score,
    allocations: item.portfolio.allocations,
    week: targetWeek,
    season: targetSeason,
  }));
  
  console.log(`[Winners] Found ${winners.length} winners for ${weekKey}`);
  
  return NextResponse.json({
    winners,
    week: targetWeek,
    season: targetSeason,
    totalParticipants: scoredPortfolios.length,
  });
}

