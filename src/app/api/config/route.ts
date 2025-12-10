import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const CONFIG_KEYS = {
  prizePool: 'config:prize_pool',
  prizePoolPerPlayer: 'config:prize_pool_per_player',
};

// Default values
const DEFAULTS = {
  prizePool: 1000, // Base prize pool
  prizePoolPerPlayer: 10, // Additional $ per player
};

type ConfigResponse = {
  prizePool: number;
  calculatedPrizePool: number;
  playerCount: number;
  lastUpdated: number;
};

/**
 * GET /api/config
 * 
 * Returns app configuration including dynamic prize pool
 */
export async function GET() {
  try {
    // Get stored prize pool config
    let basePrizePool = DEFAULTS.prizePool;
    let perPlayerBonus = DEFAULTS.prizePoolPerPlayer;

    try {
      const storedPrizePool = await redis.get<number>(CONFIG_KEYS.prizePool);
      const storedPerPlayer = await redis.get<number>(CONFIG_KEYS.prizePoolPerPlayer);
      
      if (storedPrizePool !== null) {
        basePrizePool = storedPrizePool;
      }
      if (storedPerPlayer !== null) {
        perPlayerBonus = storedPerPlayer;
      }
    } catch (redisError) {
      console.error('Redis error, using defaults:', redisError);
    }

    // Get player count from current week's leaderboard
    let playerCount = 0;
    try {
      const keys = await redis.keys('portfolio:*');
      // Get the most recent week's key
      if (keys.length > 0) {
        // Sort to get most recent week
        const sortedKeys = keys.sort().reverse();
        const latestKey = sortedKeys[0];
        const portfolios = await redis.hgetall(latestKey);
        playerCount = portfolios ? Object.keys(portfolios).length : 0;
      }
    } catch (error) {
      console.error('Error getting player count:', error);
    }

    // Calculate total prize pool: base + (players * perPlayerBonus)
    const calculatedPrizePool = basePrizePool + (playerCount * perPlayerBonus);

    const response: ConfigResponse = {
      prizePool: basePrizePool,
      calculatedPrizePool,
      playerCount,
      lastUpdated: Date.now(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Config API error:', error);
    
    // Return defaults on error
    return NextResponse.json({
      prizePool: DEFAULTS.prizePool,
      calculatedPrizePool: DEFAULTS.prizePool,
      playerCount: 0,
      lastUpdated: Date.now(),
    });
  }
}

/**
 * POST /api/config
 * 
 * Update configuration (admin only - add auth in production)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // In production, add authentication here
    // For now, allow updates but you should add admin auth
    
    if (typeof body.prizePool === 'number') {
      await redis.set(CONFIG_KEYS.prizePool, body.prizePool);
    }
    
    if (typeof body.prizePoolPerPlayer === 'number') {
      await redis.set(CONFIG_KEYS.prizePoolPerPlayer, body.prizePoolPerPlayer);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Config updated',
      updated: {
        prizePool: body.prizePool,
        prizePoolPerPlayer: body.prizePoolPerPlayer,
      }
    });
  } catch (error) {
    console.error('Config update error:', error);
    return NextResponse.json(
      { error: 'Failed to update config' },
      { status: 500 }
    );
  }
}
