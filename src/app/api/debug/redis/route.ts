import { NextResponse } from 'next/server';
import { testRedisConnection, getAllPortfolioKeys, redis } from '@/lib/redis';
import { getCurrentWeek, getWeekKey } from '@/lib/weeks';

/**
 * GET /api/debug/redis
 * 
 * Diagnostic endpoint to check Redis connection and data.
 * Returns connection status, stored portfolios count, and sample data.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const testAddress = searchParams.get('address');
  
  // Test connection
  const connectionTest = await testRedisConnection();
  
  if (!connectionTest.connected) {
    return NextResponse.json({
      status: 'error',
      connection: connectionTest,
      message: 'Redis connection failed. Check your environment variables.',
      envCheck: {
        UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
        UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'not set',
      },
    }, { status: 500 });
  }

  // Get current week info
  const weekInfo = getCurrentWeek();
  const currentWeekKey = getWeekKey(weekInfo.season, weekInfo.week);

  // Get all portfolio keys
  const allKeys = await getAllPortfolioKeys();
  
  // Get current week's portfolio count and data
  let currentWeekCount = 0;
  let sampleAddresses: string[] = [];
  let samplePortfolio: unknown = null;
  let testAddressResult: unknown = null;
  
  try {
    // @upstash/redis auto-deserializes JSON, so we get objects directly
    const currentWeekData = await redis.hgetall<Record<string, unknown>>(currentWeekKey);
    if (currentWeekData) {
      const addresses = Object.keys(currentWeekData);
      currentWeekCount = addresses.length;
      sampleAddresses = addresses.slice(0, 10).map(addr => 
        `${addr.slice(0, 6)}...${addr.slice(-4)}`
      );
      
      // Get a sample portfolio for debugging (already deserialized)
      if (addresses.length > 0) {
        samplePortfolio = currentWeekData[addresses[0]];
      }
      
      // If a test address was provided, look it up
      if (testAddress) {
        const exactMatch = currentWeekData[testAddress];
        if (exactMatch) {
          // Data is already deserialized by @upstash/redis
          testAddressResult = { found: true, matchType: 'exact', data: exactMatch };
        } else {
          // Try case-insensitive
          const caseInsensitiveKey = addresses.find(
            a => a.toLowerCase() === testAddress.toLowerCase()
          );
          if (caseInsensitiveKey) {
            testAddressResult = { 
              found: true, 
              matchType: 'case-insensitive',
              storedKey: caseInsensitiveKey,
              data: currentWeekData[caseInsensitiveKey]
            };
          } else {
            testAddressResult = { found: false, allAddresses: addresses };
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching current week data:', error);
  }

  // Test a write/read cycle
  // @upstash/redis auto-serializes/deserializes, so don't use JSON.stringify/parse
  let writeReadTest = { success: false, error: '' };
  try {
    const testKey = `test:${Date.now()}`;
    const testValue = { test: true, timestamp: Date.now() };
    // Don't use JSON.stringify - @upstash/redis handles serialization
    await redis.set(testKey, testValue);
    // @upstash/redis returns the deserialized object
    const readBack = await redis.get<{ test: boolean; timestamp: number }>(testKey);
    await redis.del(testKey);
    
    if (readBack && typeof readBack === 'object') {
      writeReadTest = { success: readBack.test === true, error: '' };
    } else {
      writeReadTest = { success: false, error: 'Read returned unexpected type: ' + typeof readBack };
    }
  } catch (error) {
    writeReadTest = { success: false, error: String(error) };
  }

  // Build diagnostic response
  const diagnostics = {
    status: 'ok',
    connection: connectionTest,
    writeReadTest,
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
      samplePortfolio,
    },
    testAddressResult,
    envCheck: {
      UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'not set',
      VERCEL_URL: process.env.VERCEL_URL || 'not set',
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(diagnostics);
}

/**
 * DELETE /api/debug/redis?week=54&address=0x...
 * 
 * Clean up corrupted data in Redis.
 * - If week is provided, clears that week's data
 * - If address is also provided, only clears that address from that week
 * - If neither, clears current week's data
 */
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const weekParam = searchParams.get('week');
  const addressParam = searchParams.get('address');
  const confirmParam = searchParams.get('confirm');
  
  // Safety check - require explicit confirmation
  if (confirmParam !== 'yes') {
    return NextResponse.json({
      error: 'Add ?confirm=yes to actually delete data',
      message: 'This is a destructive operation. Add confirm=yes to the URL to proceed.',
    }, { status: 400 });
  }

  const weekInfo = getCurrentWeek();
  const week = weekParam ? parseInt(weekParam) : weekInfo.week;
  const weekKey = getWeekKey(weekInfo.season, week);

  try {
    if (addressParam) {
      // Delete specific address from the week
      await redis.hdel(weekKey, addressParam);
      return NextResponse.json({
        ok: true,
        message: `Deleted portfolio for ${addressParam} from ${weekKey}`,
      });
    } else {
      // Delete entire week's data
      await redis.del(weekKey);
      return NextResponse.json({
        ok: true,
        message: `Deleted all portfolios from ${weekKey}`,
      });
    }
  } catch (error) {
    console.error('Error deleting data:', error);
    return NextResponse.json({
      error: 'Failed to delete data',
      details: String(error),
    }, { status: 500 });
  }
}

