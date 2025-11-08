import { NextResponse } from 'next/server';
import { LeaderboardEntry } from '@/app/types';

export async function GET(
  request: Request,
  { params }: { params: { season: string } }
) {
  try {
    const season = parseInt(params.season);

    // Mock leaderboard data - replace with actual blockchain queries
    const entries: LeaderboardEntry[] = Array.from({ length: 50 }, (_, i) => ({
      rank: i + 1,
      userId: `0x${Math.random().toString(16).slice(2, 42)}`,
      username: `Player${i + 1}`,
      returns: Math.random() * 40 - 10, // -10% to +30%
      portfolio: {
        id: `portfolio-${i}`,
        userId: `0x${Math.random().toString(16).slice(2, 42)}`,
        leagueId: `league-${season}`,
        allocations: [
          { asset: 'BTC', percentage: 33 },
          { asset: 'ETH', percentage: 33 },
          { asset: 'SOL', percentage: 34 },
        ],
        submittedAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        initialValue: 10000,
        currentValue: 10000 * (1 + (Math.random() * 40 - 10) / 100),
        returns: Math.random() * 40 - 10,
      },
      isWinner: i < 5, // Top 10% winners
    }));

    // Sort by returns
    entries.sort((a, b) => b.returns - a.returns);

    return NextResponse.json({ entries });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
