import { Redis } from '@upstash/redis'

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
 */
export async function getAllPortfolioKeys(): Promise<string[]> {
  try {
    const keys = await redis.keys('portfolio:*');
    return keys;
  } catch (error) {
    console.error('Error getting portfolio keys:', error);
    return [];
  }
}
