import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

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
      const data = await redis.hget(key, address);
      
      if (data) {
        stats.totalCompetitions++;

        // Parse the portfolio data
        const portfolio = typeof data === 'string' ? JSON.parse(data) : data;
        
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

        // Get rank for this competition (would need leaderboard calculation)
        // For now, we'll use a simplified approach
        const allPortfolios = await redis.hgetall(key);
        if (allPortfolios) {
          const totalParticipants = Object.keys(allPortfolios).length;
          
          // Calculate this user's rank based on score
          // This is a simplified version - in production you'd have stored scores
          const rank = Math.floor(Math.random() * totalParticipants) + 1; // Placeholder
          ranks.push(rank);

          // Check if top 10%
          if (rank <= Math.ceil(totalParticipants * 0.1)) {
            topFinishes++;
          }
        }
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


