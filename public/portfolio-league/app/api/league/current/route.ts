import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { getWeekStartTimestamp, getWeekEndTimestamp } from '@/lib/utils';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export async function GET(request: NextRequest) {
  try {
    // Get current week from Redis or calculate
    let currentWeek = await redis.get<number>('current:week');
    
    if (!currentWeek) {
      currentWeek = 1;
      await redis.set('current:week', currentWeek);
    }

    const startTimestamp = getWeekStartTimestamp();
    const endTimestamp = getWeekEndTimestamp();
    const now = Date.now() / 1000;
    
    // Calculate time remaining
    const timeRemaining = endTimestamp - now;
    const days = Math.floor(timeRemaining / (24 * 60 * 60));
    const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);

    // Get participant count
    const participantCount = await redis.get<number>(`participants:week:${currentWeek}`) || 0;

    // Get prize pool
    const prizePool = 1000; // USDC

    return NextResponse.json({
      week: currentWeek,
      season: 1,
      startTimestamp,
      endTimestamp,
      timeRemaining: `${days}d ${hours}h ${minutes}m`,
      timeRemainingSeconds: timeRemaining,
      participantCount,
      prizePool,
      status: now < endTimestamp ? 'active' : 'ended',
    });
  } catch (error) {
    console.error('Error fetching league info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
