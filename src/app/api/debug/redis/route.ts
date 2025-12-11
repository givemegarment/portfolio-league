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
    const currentWeekData = await redis.hgetall<Record<string, string>>(currentWeekKey);
    if (currentWeekData) {
      const addresses = Object.keys(currentWeekData);
      currentWeekCount = addresses.length;
      sampleAddresses = addresses.slice(0, 10).map(addr => 
        `${addr.slice(0, 6)}...${addr.slice(-4)}`
      );
      
      // Get a sample portfolio for debugging
      if (addresses.length > 0) {
        try {
          samplePortfolio = JSON.parse(currentWeekData[addresses[0]]);
        } catch {
          samplePortfolio = 'Failed to parse';
        }
      }
      
      // If a test address was provided, look it up
      if (testAddress) {
        const exactMatch = currentWeekData[testAddress];
        if (exactMatch) {
          testAddressResult = { found: true, matchType: 'exact', data: JSON.parse(exactMatch) };
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
              data: JSON.parse(currentWeekData[caseInsensitiveKey]) 
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
  let writeReadTest = { success: false, error: '' };
  try {
    const testKey = `test:${Date.now()}`;
    const testValue = { test: true, timestamp: Date.now() };
    await redis.set(testKey, JSON.stringify(testValue));
    const readBack = await redis.get<string>(testKey);
    await redis.del(testKey);
    
    if (readBack) {
      const parsed = JSON.parse(readBack);
      writeReadTest = { success: parsed.test === true, error: '' };
    } else {
      writeReadTest = { success: false, error: 'Read returned null' };
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




