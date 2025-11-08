import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { calculatePortfolioReturn } from '@/lib/utils';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

interface PortfolioEntry {
  address: string;
  assets: string[];
  week: number;
  submittedAt: number;
  startPrices: Record<string, number>;
  return?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week') || '1';

    // Fetch all portfolios for the week
    const portfolios = await redis.hgetall(`portfolio:week:${week}`);

    if (!portfolios || Object.keys(portfolios).length === 0) {
      return NextResponse.json({ leaderboard: [] });
    }

    // Fetch current prices
    const pricesResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/oracle/prices`);
    const currentPrices = await pricesResponse.json();

    // Calculate returns for each portfolio
    const leaderboardEntries = Object.entries(portfolios).map(([address, data]) => {
      const portfolio = JSON.parse(data as string) as PortfolioEntry;
      const portfolioReturn = calculatePortfolioReturn(
        portfolio.startPrices,
        currentPrices,
        portfolio.assets
      );

      return {
        address,
        portfolio: portfolio.assets,
        return: portfolioReturn,
        submittedAt: portfolio.submittedAt,
      };
    });

    // Sort by return (descending)
    leaderboardEntries.sort((a, b) => b.return - a.return);

    // Add rank and calculate prizes
    const totalParticipants = leaderboardEntries.length;
    const topDecileCount = Math.ceil(totalParticipants * 0.1);
    const prizePool = 1000; // USDC

    const leaderboard = leaderboardEntries.map((entry, index) => {
      const rank = index + 1;
      let prize = 0;

      // Prize distribution for top 10%
      if (rank <= topDecileCount) {
        // Weighted distribution: 1st gets more, decreasing for lower ranks
        const weight = (topDecileCount - index) / topDecileCount;
        const totalWeight = (topDecileCount * (topDecileCount + 1)) / 2;
        prize = Math.floor((weight / totalWeight) * prizePool * topDecileCount);
      }

      return {
        rank,
        ...entry,
        prize,
      };
    });

    return NextResponse.json({ leaderboard, totalParticipants, week });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
