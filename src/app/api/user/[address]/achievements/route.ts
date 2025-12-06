import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { getCurrentWeek, getWeekKey } from '@/lib/weeks';
import {
  type Achievement,
  createAchievement,
  checkWeeklyWinner,
  checkTop10Percent,
  checkPerfectPick,
  checkHotStreak,
  checkConsistent,
  checkEarlyAdopter,
} from '@/lib/achievements';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio-league.vercel.app';

type LeaderboardEntry = {
  rank: number;
  user: string;
  score: number;
};

/**
 * GET - Fetch achievements for an address
 * Also checks and awards any new achievements
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address;
  
  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  const { season, week } = getCurrentWeek();
  
  // Fetch existing achievements
  const achievementsKey = `achievements:${address.toLowerCase()}`;
  const existingAchievements = await redis.get<Achievement[]>(achievementsKey) || [];
  
  // Collect data to check for new achievements
  const newAchievements: Achievement[] = [];
  
  // 1. Check participation history for various achievements
  const participationWeeks: number[] = [];
  const weeklyResults: Array<{ week: number; rank: number; totalPlayers: number; score: number }> = [];
  
  // Scan recent weeks (up to 12)
  for (let w = 1; w <= week; w++) {
    const weekKey = getWeekKey(season, w);
    const portfolioJson = await redis.hget<string>(weekKey, address);
    
    if (portfolioJson) {
      participationWeeks.push(w);
      
      // Get leaderboard for this week to find rank
      try {
        const leaderboardRes = await fetch(`${BASE_URL}/api/leaderboard?limit=100`, {
          cache: 'no-store',
        });
        
        if (leaderboardRes.ok) {
          const leaderboard: LeaderboardEntry[] = await leaderboardRes.json();
          const entry = leaderboard.find(
            (r) => r.user.toLowerCase() === address.toLowerCase()
          );
          
          if (entry) {
            weeklyResults.push({
              week: w,
              rank: entry.rank,
              totalPlayers: leaderboard.length,
              score: entry.score,
            });
          }
        }
      } catch (e) {
        console.error('Error fetching leaderboard:', e);
      }
    }
  }

  // Helper to check if achievement already exists
  const hasAchievement = (type: string, checkWeek?: number) => {
    return existingAchievements.some(
      (a) => a.type === type && (checkWeek === undefined || a.week === checkWeek)
    );
  };

  // 2. Check for Early Adopter (Season 1)
  if (participationWeeks.length > 0 && checkEarlyAdopter(season)) {
    if (!hasAchievement('early_adopter')) {
      newAchievements.push(createAchievement('early_adopter', season));
    }
  }

  // 3. Check for Consistent Player (4 weeks in a row)
  if (checkConsistent(participationWeeks, week)) {
    if (!hasAchievement('consistent')) {
      newAchievements.push(createAchievement('consistent', season, week));
    }
  }

  // 4. Check weekly results for performance achievements
  for (const result of weeklyResults) {
    // Weekly Winner
    if (checkWeeklyWinner(result.rank)) {
      if (!hasAchievement('weekly_winner', result.week)) {
        newAchievements.push(
          createAchievement('weekly_winner', season, result.week, { rank: 1 })
        );
      }
    }

    // Top 10%
    if (checkTop10Percent(result.rank, result.totalPlayers)) {
      if (!hasAchievement('top_10_percent', result.week)) {
        newAchievements.push(
          createAchievement('top_10_percent', season, result.week, {
            rank: result.rank,
            totalPlayers: result.totalPlayers,
          })
        );
      }
    }

    // Perfect Pick (100%+ return)
    if (checkPerfectPick(result.score)) {
      if (!hasAchievement('perfect_pick', result.week)) {
        newAchievements.push(
          createAchievement('perfect_pick', season, result.week, {
            score: result.score,
          })
        );
      }
    }
  }

  // 5. Check for Hot Streak
  if (checkHotStreak(weeklyResults)) {
    if (!hasAchievement('hot_streak')) {
      newAchievements.push(
        createAchievement('hot_streak', season, week, {
          streakLength: 3,
        })
      );
    }
  }

  // Save new achievements if any
  if (newAchievements.length > 0) {
    const allAchievements = [...existingAchievements, ...newAchievements];
    await redis.set(achievementsKey, allAchievements);
    
    return NextResponse.json({
      achievements: allAchievements,
      newAchievements,
      stats: {
        totalAchievements: allAchievements.length,
        weeksParticipated: participationWeeks.length,
        bestRank: weeklyResults.length > 0 
          ? Math.min(...weeklyResults.map((r) => r.rank))
          : null,
      },
    });
  }

  return NextResponse.json({
    achievements: existingAchievements,
    newAchievements: [],
    stats: {
      totalAchievements: existingAchievements.length,
      weeksParticipated: participationWeeks.length,
      bestRank: weeklyResults.length > 0 
        ? Math.min(...weeklyResults.map((r) => r.rank))
        : null,
    },
  });
}

/**
 * POST - Manually award an achievement (admin only in future)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address;
  const body = await req.json();
  const { type, season, week, metadata } = body;

  if (!address || !type) {
    return NextResponse.json({ error: 'Address and type required' }, { status: 400 });
  }

  const achievementsKey = `achievements:${address.toLowerCase()}`;
  const existingAchievements = await redis.get<Achievement[]>(achievementsKey) || [];

  // Check if already has this achievement
  const alreadyHas = existingAchievements.some(
    (a) => a.type === type && a.season === season && a.week === week
  );

  if (alreadyHas) {
    return NextResponse.json({ error: 'Achievement already earned' }, { status: 400 });
  }

  const newAchievement = createAchievement(type, season, week, metadata);
  const allAchievements = [...existingAchievements, newAchievement];
  
  await redis.set(achievementsKey, allAchievements);

  return NextResponse.json({
    ok: true,
    achievement: newAchievement,
    totalAchievements: allAchievements.length,
  });
}



