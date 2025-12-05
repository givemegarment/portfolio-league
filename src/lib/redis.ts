import { Redis } from '@upstash/redis'

// Check for required environment variables
if (!process.env.UPSTASH_REDIS_REST_URL) {
  console.warn('⚠️ UPSTASH_REDIS_REST_URL is not set. Redis operations will fail.');
}
if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn('⚠️ UPSTASH_REDIS_REST_TOKEN is not set. Redis operations will fail.');
}

export const redis = Redis.fromEnv()
