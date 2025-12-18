import { Redis } from '@upstash/redis';
import { getCurrentWeek, getWeekKey } from './weeks';

// Check for required environment variables
if (!process.env.UPSTASH_REDIS_REST_URL) {
  console.warn('⚠️ UPSTASH_REDIS_REST_URL is not set. Redis operations will fail.');
}
if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn('⚠️ UPSTASH_REDIS_REST_TOKEN is not set. Redis operations will fail.');
}

export const redis = Redis.fromEnv()

/**
 * Test Redis connection and return diagnostics
 */
export async function testRedisConnection(): Promise<{
  connected: boolean;
  latencyMs: number;
  error?: string;
  envVars: {
    hasUrl: boolean;
    hasToken: boolean;
  };
}> {
  const startTime = Date.now();
  const envVars = {
    hasUrl: !!process.env.UPSTASH_REDIS_REST_URL,
    hasToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
  };

  if (!envVars.hasUrl || !envVars.hasToken) {
    return {
      connected: false,
      latencyMs: 0,
      error: 'Missing environment variables',
      envVars,
    };
  }

  try {
    // Simple ping test
    await redis.ping();
    const latencyMs = Date.now() - startTime;
    
    return {
      connected: true,
      latencyMs,
      envVars,
    };
  } catch (error) {
    return {
      connected: false,
      latencyMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      envVars,
    };
  }
}

/**
 * Get all portfolio keys across all seasons/weeks
 * 
 * Note: Upstash Redis REST API may have limitations with KEYS command.
 * This function tries KEYS first, then falls back to week-based scanning.
 */
export async function getAllPortfolioKeys(): Promise<string[]> {
  try {
    // Try using KEYS command first (works with standard Redis)
    const keys = await redis.keys('portfolio:*');
    if (keys && keys.length > 0) {
      return keys;
    }
  } catch (error) {
    console.warn('KEYS command failed or returned empty, using fallback:', error);
  }
  
  // Fallback: Scan known week ranges
  // This is more reliable but requires knowing the week structure
  try {
    const keys: string[] = [];
    const { season, week } = getCurrentWeek();
    
    // Scan last 20 weeks as fallback
    const maxWeeks = 20;
    const startWeek = Math.max(1, week - maxWeeks + 1);
    
    for (let w = week; w >= startWeek; w--) {
      const weekKey = getWeekKey(season, w);
      // Check if key exists by trying to get a count
      try {
        const count = await redis.hlen(weekKey);
        if (count > 0) {
          keys.push(weekKey);
        }
      } catch {
        // Key doesn't exist or error, skip
      }
    }
    
    return keys;
  } catch (error) {
    console.error('Error in fallback portfolio key scanning:', error);
    return [];
  }
}
