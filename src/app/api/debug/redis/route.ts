import { NextResponse } from 'next/server';
import { testRedisConnection, getAllPortfolioKeys, redis } from '@/lib/redis';
import { getCurrentWeek, getWeekKey } from '@/lib/weeks';

/**
 * GET /api/debug/redis
 * 
 * Diagnostic endpoint to check Redis connection and data.
 * Returns connection status, stored portfolios count, and sample data.
 */
export async function GET() {
  // Test connection
  const connectionTest = await testRedisConnection();
  
  if (!connectionTest.connected) {
    return NextResponse.json({
      status: 'error',
      connection: connectionTest,
      message: 'Redis connection failed. Check your environment variables.',
    }, { status: 500 });
  }

  // Get current week info
  const weekInfo = getCurrentWeek();
  const currentWeekKey = getWeekKey(weekInfo.season, weekInfo.week);

  // Get all portfolio keys
  const allKeys = await getAllPortfolioKeys();
  
  // Get current week's portfolio count
  let currentWeekCount = 0;
  let sampleAddresses: string[] = [];
  
  try {
    const currentWeekData = await redis.hgetall<Record<string, string>>(currentWeekKey);
    if (currentWeekData) {
      const addresses = Object.keys(currentWeekData);
      currentWeekCount = addresses.length;
      sampleAddresses = addresses.slice(0, 5).map(addr => 
        `${addr.slice(0, 6)}...${addr.slice(-4)}`
      );
    }
  } catch (error) {
    console.error('Error fetching current week data:', error);
  }

  // Build diagnostic response
  const diagnostics = {
    status: 'ok',
    connection: connectionTest,
    weekInfo: {
      season: weekInfo.season,
      week: weekInfo.week,
      isLocked: weekInfo.isLocked,
      startsAt: weekInfo.startsAt.toISOString(),
      endsAt: weekInfo.endsAt.toISOString(),
    },
    storage: {
      currentWeekKey,
      allPortfolioKeys: allKeys,
      totalKeysCount: allKeys.length,
      currentWeekPortfolios: currentWeekCount,
      sampleAddresses,
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(diagnostics);
}




