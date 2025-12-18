import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { isAdmin, type AdminStats } from '@/lib/admin';
import { getCurrentWeek } from '@/lib/weeks';

export async function GET(request: NextRequest) {
  try {
    // Check admin auth from header
    const address = request.headers.get('x-admin-address');
    
    if (!address || !isAdmin(address)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const weekInfo = getCurrentWeek();
    const weekKey = `${weekInfo.season}:week${weekInfo.week}`;

    // Get all portfolios for current week
    const portfolioKeys = await redis.keys(`portfolio:${weekKey}:*`);
    const totalPortfolios = portfolioKeys.length;

    // Get leaderboard
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    let leaderboard: Array<{ user: string; score: number; rank: number }> = [];
    try {
      const leaderboardRes = await fetch(`${baseUrl}/api/leaderboard?limit=500`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (leaderboardRes.ok) {
        leaderboard = await leaderboardRes.json();
      }
    } catch (e) {
      console.error('Error fetching leaderboard:', e);
    }

    // Calculate stats
    const activePlayers = leaderboard.length;
    const averageScore = activePlayers > 0
      ? leaderboard.reduce((sum, p) => sum + (p.score || 0), 0) / activePlayers
      : 0;

    // Get unique players (all time)
    const allPortfolioKeys = await redis.keys('portfolio:*');
    const uniqueAddresses = new Set<string>();
    for (const key of allPortfolioKeys) {
      const parts = key.split(':');
      if (parts.length >= 3) {
        uniqueAddresses.add(parts[parts.length - 1].toLowerCase());
      }
    }
    const totalPlayers = uniqueAddresses.size;

    // Top performers
    const topPerformers = leaderboard.slice(0, 10).map(p => ({
      address: p.user,
      score: p.score,
      rank: p.rank,
    }));

    // Prize pool (from config or default)
    const prizePoolData = await redis.get('config:prizePool');
    const prizePool = prizePoolData ? JSON.parse(prizePoolData as string).total : 1000;

    // Recent activity (mock for now - could be enhanced with event logging)
    const recentActivity: AdminStats['recentActivity'] = [];

    const stats: AdminStats = {
      totalPlayers,
      activePlayers,
      totalPortfolios,
      prizePool,
      weeklyParticipation: activePlayers,
      averageScore: Math.round(averageScore * 100) / 100,
      topPerformers,
      recentActivity,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}






