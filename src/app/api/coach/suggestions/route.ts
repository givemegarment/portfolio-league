import { NextRequest, NextResponse } from 'next/server';
import { analyzePortfolio, type CoachAnalysis } from '@/lib/ai-coach';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio-league.vercel.app';

type Allocation = {
  symbol: string;
  percentage: number;
};

type PriceData = {
  price: number;
  change24h: number;
};

type LeaderboardEntry = {
  rank: number;
  user: string;
  score: number;
  allocations: Allocation[];
};

/**
 * POST - Get AI coach suggestions for a portfolio
 * Body: { allocations: [{ symbol: string, percentage: number }] }
 */
export async function POST(req: NextRequest): Promise<NextResponse<CoachAnalysis | { error: string }>> {
  try {
    const body = await req.json();
    const { allocations } = body;

    if (!allocations || !Array.isArray(allocations)) {
      return NextResponse.json({ error: 'Allocations required' }, { status: 400 });
    }

    // Validate allocations
    const totalPercentage = allocations.reduce(
      (sum: number, a: Allocation) => sum + a.percentage,
      0
    );
    
    if (totalPercentage !== 100) {
      return NextResponse.json(
        { error: 'Allocations must total 100%' },
        { status: 400 }
      );
    }

    // Fetch current prices
    let prices: Record<string, PriceData> = {};
    try {
      const pricesRes = await fetch(`${BASE_URL}/api/prices`, {
        cache: 'no-store',
      });
      if (pricesRes.ok) {
        const data = await pricesRes.json();
        prices = data.prices || {};
      }
    } catch (e) {
      console.error('Error fetching prices:', e);
      // Use fallback prices
      prices = {
        BTC: { price: 97000, change24h: 0 },
        ETH: { price: 3600, change24h: 0 },
        SOL: { price: 230, change24h: 0 },
        USDC: { price: 1, change24h: 0 },
      };
    }

    // Fetch leaderboard for comparison
    let leaderboard: LeaderboardEntry[] = [];
    try {
      const leaderboardRes = await fetch(`${BASE_URL}/api/leaderboard?limit=50`, {
        cache: 'no-store',
      });
      if (leaderboardRes.ok) {
        leaderboard = await leaderboardRes.json();
      }
    } catch (e) {
      console.error('Error fetching leaderboard:', e);
    }

    // Analyze portfolio
    const analysis = analyzePortfolio(allocations, prices, leaderboard);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Coach API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze portfolio' },
      { status: 500 }
    );
  }
}





