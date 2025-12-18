/**
 * Masters System for Portfolio League
 * 
 * Masters are high-performing wallets that users can follow and emulate.
 * This module handles master data, follow relationships, and Redis storage.
 */

import { redis } from './redis';
import { NarrativeType } from './narratives';

export type MasterTier = 'rising' | 'elite' | 'legendary';

export type MasterPerformance = {
  return1D: number;
  return7D: number;
  return30D: number;
  return1Y: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  winRate: number;
  tradeCount: number;
  avgHoldingPeriod: number;
};

export type MasterHolding = {
  symbol: string;
  percentage: number;
  value?: number;
  change24h?: number;
};

export type Master = {
  address: string;
  name: string;
  description?: string;
  tier: MasterTier;
  primaryNarrative: NarrativeType;
  narratives: NarrativeType[];
  tags: string[];
  holdings: MasterHolding[];
  performance: MasterPerformance;
  followerCount: number;
  emulatorCount: number;
  isVerified: boolean;
  createdAt: number;
  updatedAt: number;
};

/**
 * Get tier color
 */
export function getTierColor(tier: MasterTier): string {
  switch (tier) {
    case 'legendary':
      return '#F59E0B'; // Amber
    case 'elite':
      return '#8B5CF6'; // Purple
    case 'rising':
      return '#10B981'; // Emerald
  }
}

/**
 * Get tier label
 */
export function getTierLabel(tier: MasterTier): string {
  switch (tier) {
    case 'legendary':
      return 'Legendary';
    case 'elite':
      return 'Elite';
    case 'rising':
      return 'Rising';
  }
}

/**
 * Sort masters by performance metric
 */
export function sortMastersByPerformance(
  masters: Master[],
  metric: 'return1D' | 'return7D' | 'return30D' | 'return1Y' | 'sharpe'
): Master[] {
  const sorted = [...masters];
  switch (metric) {
    case 'return1D':
      sorted.sort((a, b) => b.performance.return1D - a.performance.return1D);
      break;
    case 'return7D':
      sorted.sort((a, b) => b.performance.return7D - a.performance.return7D);
      break;
    case 'return30D':
      sorted.sort((a, b) => b.performance.return30D - a.performance.return30D);
      break;
    case 'return1Y':
      sorted.sort((a, b) => b.performance.return1Y - a.performance.return1Y);
      break;
    case 'sharpe':
      sorted.sort((a, b) => b.performance.sharpeRatio - a.performance.sharpeRatio);
      break;
  }
  return sorted;
}

/**
 * Create sample masters for development/testing
 */
export function createSampleMasters(): Master[] {
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  
  return [
    {
      address: '0x1234567890123456789012345678901234567890',
      name: 'DeFi Whale',
      description: 'Long-term DeFi strategist with focus on yield optimization',
      tier: 'legendary',
      primaryNarrative: 'yield_farming',
      narratives: ['yield_farming', 'blue_chip'],
      tags: ['defi', 'yield', 'long-term'],
      holdings: [
        { symbol: 'AAVE', percentage: 40 },
        { symbol: 'UNI', percentage: 30 },
        { symbol: 'ETH', percentage: 30 },
      ],
      performance: {
        return1D: 2.5,
        return7D: 15.3,
        return30D: 45.2,
        return1Y: 180.5,
        sharpeRatio: 2.8,
        maxDrawdown: 18.5,
        volatility: 35.2,
        winRate: 72,
        tradeCount: 45,
        avgHoldingPeriod: 21,
      },
      followerCount: 1250,
      emulatorCount: 340,
      isVerified: true,
      createdAt: weekAgo,
      updatedAt: now,
    },
    {
      address: '0x2345678901234567890123456789012345678901',
      name: 'Meme Master',
      description: 'Early memecoin adopter with high-risk, high-reward strategy',
      tier: 'elite',
      primaryNarrative: 'memecoin',
      narratives: ['memecoin', 'degen'],
      tags: ['meme', 'high-risk', 'trending'],
      holdings: [
        { symbol: 'PEPE', percentage: 50 },
        { symbol: 'WIF', percentage: 30 },
        { symbol: 'BONK', percentage: 20 },
      ],
      performance: {
        return1D: 8.2,
        return7D: 42.5,
        return30D: 125.3,
        return1Y: 450.2,
        sharpeRatio: 1.5,
        maxDrawdown: 45.2,
        volatility: 85.3,
        winRate: 58,
        tradeCount: 120,
        avgHoldingPeriod: 5,
      },
      followerCount: 890,
      emulatorCount: 210,
      isVerified: true,
      createdAt: weekAgo,
      updatedAt: now,
    },
    {
      address: '0x3456789012345678901234567890123456789012',
      name: 'L2 Specialist',
      description: 'Layer 2 ecosystem expert focusing on Base and Optimism',
      tier: 'elite',
      primaryNarrative: 'l2_ecosystem',
      narratives: ['l2_ecosystem', 'blue_chip'],
      tags: ['l2', 'base', 'scaling'],
      holdings: [
        { symbol: 'ETH', percentage: 50 },
        { symbol: 'OP', percentage: 30 },
        { symbol: 'AERO', percentage: 20 },
      ],
      performance: {
        return1D: 1.8,
        return7D: 12.4,
        return30D: 38.7,
        return1Y: 145.2,
        sharpeRatio: 2.2,
        maxDrawdown: 22.1,
        volatility: 42.5,
        winRate: 68,
        tradeCount: 38,
        avgHoldingPeriod: 14,
      },
      followerCount: 650,
      emulatorCount: 180,
      isVerified: false,
      createdAt: weekAgo,
      updatedAt: now,
    },
    {
      address: '0x4567890123456789012345678901234567890123',
      name: 'Blue Chip Holder',
      description: 'Conservative strategy with focus on major cryptocurrencies',
      tier: 'rising',
      primaryNarrative: 'blue_chip',
      narratives: ['blue_chip', 'rwa_stables'],
      tags: ['conservative', 'btc', 'eth'],
      holdings: [
        { symbol: 'BTC', percentage: 50 },
        { symbol: 'ETH', percentage: 30 },
        { symbol: 'USDC', percentage: 20 },
      ],
      performance: {
        return1D: 0.8,
        return7D: 5.2,
        return30D: 18.5,
        return1Y: 95.3,
        sharpeRatio: 3.2,
        maxDrawdown: 12.5,
        volatility: 25.8,
        winRate: 75,
        tradeCount: 12,
        avgHoldingPeriod: 45,
      },
      followerCount: 420,
      emulatorCount: 95,
      isVerified: false,
      createdAt: weekAgo,
      updatedAt: now,
    },
    {
      address: '0x5678901234567890123456789012345678901234',
      name: 'AI Enthusiast',
      description: 'Early adopter of AI and DePIN tokens',
      tier: 'rising',
      primaryNarrative: 'ai_depin',
      narratives: ['ai_depin', 'multi_chain'],
      tags: ['ai', 'depin', 'emerging'],
      holdings: [
        { symbol: 'RENDER', percentage: 40 },
        { symbol: 'FET', percentage: 35 },
        { symbol: 'NEAR', percentage: 25 },
      ],
      performance: {
        return1D: 3.2,
        return7D: 18.7,
        return30D: 52.3,
        return1Y: 210.5,
        sharpeRatio: 1.8,
        maxDrawdown: 28.5,
        volatility: 55.2,
        winRate: 65,
        tradeCount: 28,
        avgHoldingPeriod: 18,
      },
      followerCount: 320,
      emulatorCount: 75,
      isVerified: false,
      createdAt: weekAgo,
      updatedAt: now,
    },
  ];
}

// ============ Redis Functions ============

const MASTERS_KEY = 'masters:all';
const MASTER_KEY_PREFIX = 'master:';
const FOLLOWERS_KEY_PREFIX = 'master:followers:';
const FOLLOWING_KEY_PREFIX = 'user:following:';

/**
 * Get all masters from Redis (or return samples if none exist)
 */
export async function getAllMasters(): Promise<Master[]> {
  try {
    const mastersJson = await redis.get<string>(MASTERS_KEY);
    if (mastersJson) {
      return JSON.parse(mastersJson);
    }
  } catch (error) {
    console.error('Error fetching masters from Redis:', error);
  }
  
  // Fallback to sample data
  return createSampleMasters();
}

/**
 * Get masters by narrative
 */
export async function getMastersByNarrative(narrative: NarrativeType): Promise<Master[]> {
  const allMasters = await getAllMasters();
  return allMasters.filter(m => m.narratives.includes(narrative));
}

/**
 * Get a single master by address
 */
export async function getMaster(address: string): Promise<Master | null> {
  try {
    const masterKey = `${MASTER_KEY_PREFIX}${address.toLowerCase()}`;
    const masterJson = await redis.get<string>(masterKey);
    if (masterJson) {
      return JSON.parse(masterJson);
    }
  } catch (error) {
    console.error('Error fetching master from Redis:', error);
  }
  
  // Fallback to sample data
  const samples = createSampleMasters();
  return samples.find(m => m.address.toLowerCase() === address.toLowerCase()) || null;
}

/**
 * Save a master to Redis
 */
export async function saveMaster(master: Master): Promise<void> {
  try {
    const masterKey = `${MASTER_KEY_PREFIX}${master.address.toLowerCase()}`;
    await redis.set(masterKey, JSON.stringify(master));
    
    // Also update the all masters list
    const allMasters = await getAllMasters();
    const index = allMasters.findIndex(m => m.address.toLowerCase() === master.address.toLowerCase());
    if (index >= 0) {
      allMasters[index] = master;
    } else {
      allMasters.push(master);
    }
    await redis.set(MASTERS_KEY, JSON.stringify(allMasters));
  } catch (error) {
    console.error('Error saving master to Redis:', error);
    throw error;
  }
}

/**
 * Follow a master
 */
export async function followMaster(userAddress: string, masterAddress: string): Promise<void> {
  try {
    const userKey = userAddress.toLowerCase();
    const masterKey = masterAddress.toLowerCase();
    
    // Add to user's following set
    const followingKey = `${FOLLOWING_KEY_PREFIX}${userKey}`;
    await redis.sadd(followingKey, masterKey);
    
    // Add to master's followers set
    const followersKey = `${FOLLOWERS_KEY_PREFIX}${masterKey}`;
    await redis.sadd(followersKey, userKey);
    
    // Update master's follower count
    const master = await getMaster(masterAddress);
    if (master) {
      master.followerCount = await redis.scard(followersKey);
      await saveMaster(master);
    }
  } catch (error) {
    console.error('Error following master:', error);
    throw error;
  }
}

/**
 * Unfollow a master
 */
export async function unfollowMaster(userAddress: string, masterAddress: string): Promise<void> {
  try {
    const userKey = userAddress.toLowerCase();
    const masterKey = masterAddress.toLowerCase();
    
    // Remove from user's following set
    const followingKey = `${FOLLOWING_KEY_PREFIX}${userKey}`;
    await redis.srem(followingKey, masterKey);
    
    // Remove from master's followers set
    const followersKey = `${FOLLOWERS_KEY_PREFIX}${masterKey}`;
    await redis.srem(followersKey, userKey);
    
    // Update master's follower count
    const master = await getMaster(masterAddress);
    if (master) {
      master.followerCount = await redis.scard(followersKey);
      await saveMaster(master);
    }
  } catch (error) {
    console.error('Error unfollowing master:', error);
    throw error;
  }
}

/**
 * Check if user is following a master
 */
export async function isFollowing(userAddress: string, masterAddress: string): Promise<boolean> {
  try {
    const userKey = userAddress.toLowerCase();
    const masterKey = masterAddress.toLowerCase();
    const followingKey = `${FOLLOWING_KEY_PREFIX}${userKey}`;
    
    const isMember = await redis.sismember(followingKey, masterKey);
    return isMember === 1;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
}

/**
 * Get all masters a user is following
 */
export async function getFollowingMasters(userAddress: string): Promise<Master[]> {
  try {
    const userKey = userAddress.toLowerCase();
    const followingKey = `${FOLLOWING_KEY_PREFIX}${userKey}`;
    const masterAddresses = await redis.smembers<string[]>(followingKey);
    
    const masters: Master[] = [];
    for (const address of masterAddresses) {
      const master = await getMaster(address);
      if (master) {
        masters.push(master);
      }
    }
    return masters;
  } catch (error) {
    console.error('Error getting following masters:', error);
    return [];
  }
}

/**
 * Get all followers of a master
 */
export async function getMasterFollowers(masterAddress: string): Promise<string[]> {
  try {
    const masterKey = masterAddress.toLowerCase();
    const followersKey = `${FOLLOWERS_KEY_PREFIX}${masterKey}`;
    return await redis.smembers<string[]>(followersKey);
  } catch (error) {
    console.error('Error getting master followers:', error);
    return [];
  }
}
