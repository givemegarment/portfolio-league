import { NextResponse } from 'next/server';
import { UserStats } from '@/app/types';

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    // Mock user stats - in production, aggregate from blockchain data
    const stats: UserStats = {
      totalSeasons: 5,
      wins: 1,
      topDecileFinishes: 3,
      bestRank: 2,
      bestReturns: 28.5,
      averageReturns: 8.2,
      badges: [], // Populated separately
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
