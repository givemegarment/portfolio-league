/**
 * Master Wallet System for Imitatio
 * 
 * Handles discovery, tracking, and analysis of high-performing wallets ("Masters")
 * that users can study and emulate.
 */

import { redis } from './redis';
import { NarrativeType, detectNarrative, getNarrative } from './narratives';

export type MasterStatus = 'active' | 'inactive' | 'pending' | 'verified';

export type MasterTier = 'legendary' | 'elite' | 'rising' | 'community';

export type MasterHolding = {
  symbol: string;
  percentage: number;
  value?: number;
  entryPrice?: number;
  currentPrice?: number;
  change24h?: number;
};

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
  avgHoldingPeriod: number; // in days
};

export type MasterProfile = {
  address: string;
  name: string;
  description?: string;
  avatar?: string;
  tier: MasterTier;
  status: MasterStatus;
  isVerified: boolean;
  narratives: NarrativeType[];
  primaryNarrative: NarrativeType;
  tags: string[];
  followerCount: number;
  emulatorCount: number;
  createdAt: number;
  updatedAt: number;
};

export type Master = MasterProfile & {
  holdings: MasterHolding[];
  performance: MasterPerformance;
  recentTrades: MasterTrade[];
};

export type MasterTrade = {
  id: string;
  type: 'buy' | 'sell' | 'swap';
  fromSymbol?: string;
  toSymbol: string;
  amount: number;
  value: number;
  timestamp: number;
  txHash?: string;
};

export type MasterSnapshot = {
  address: string;
  timestamp: number;
  holdings: MasterHolding[];
  totalValue: number;
  performance: MasterPerformance;
};

// ============ Redis Keys ============

const MASTER_PREFIX = 'master:';
const MASTER_LIST_KEY = 'masters:all';
const MASTER_BY_NARRATIVE_PREFIX = 'masters:narrative:';
const MASTER_SNAPSHOTS_PREFIX = 'master:snapshots:';
const MASTER_FOLLOWERS_PREFIX = 'master:followers:';

// ============ Master CRUD Operations ============

/**
 * Get a master by address
 */
export async function getMaster(address: string): Promise<Master | null> {
  try {
    const data = await redis.hgetall(`${MASTER_PREFIX}${address.toLowerCase()}`);
    if (!data || Object.keys(data).length === 0) return null;
    
    return parseMasterData(data);
  } catch (error) {
    console.error('Error getting master:', error);
    return null;
  }
}

/**
 * Get multiple masters by addresses
 */
export async function getMasters(addresses: string[]): Promise<Master[]> {
  const masters: Master[] = [];
  
  for (const address of addresses) {
    const master = await getMaster(address);
    if (master) masters.push(master);
  }
  
  return masters;
}

/**
 * Get all masters
 */
export async function getAllMasters(): Promise<Master[]> {
  try {
    const addresses = await redis.smembers(MASTER_LIST_KEY);
    return getMasters(addresses);
  } catch (error) {
    console.error('Error getting all masters:', error);
    return [];
  }
}

/**
 * Get masters by narrative
 */
export async function getMastersByNarrative(narrative: NarrativeType): Promise<Master[]> {
  try {
    const addresses = await redis.smembers(`${MASTER_BY_NARRATIVE_PREFIX}${narrative}`);
    return getMasters(addresses);
  } catch (error) {
    console.error('Error getting masters by narrative:', error);
    return [];
  }
}

/**
 * Create or update a master
 */
export async function saveMaster(master: Master): Promise<boolean> {
  try {
    const address = master.address.toLowerCase();
    const key = `${MASTER_PREFIX}${address}`;
    
    // Serialize master data
    const data = serializeMasterData(master);
    
    // Save master data
    await redis.hset(key, data);
    
    // Add to master list
    await redis.sadd(MASTER_LIST_KEY, address);
    
    // Add to narrative indexes
    for (const narrative of master.narratives) {
      await redis.sadd(`${MASTER_BY_NARRATIVE_PREFIX}${narrative}`, address);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving master:', error);
    return false;
  }
}

/**
 * Delete a master
 */
export async function deleteMaster(address: string): Promise<boolean> {
  try {
    const normalizedAddress = address.toLowerCase();
    const master = await getMaster(normalizedAddress);
    
    if (!master) return false;
    
    // Remove from narrative indexes
    for (const narrative of master.narratives) {
      await redis.srem(`${MASTER_BY_NARRATIVE_PREFIX}${narrative}`, normalizedAddress);
    }
    
    // Remove from master list
    await redis.srem(MASTER_LIST_KEY, normalizedAddress);
    
    // Delete master data
    await redis.del(`${MASTER_PREFIX}${normalizedAddress}`);
    
    return true;
  } catch (error) {
    console.error('Error deleting master:', error);
    return false;
  }
}

// ============ Performance Calculations ============

/**
 * Calculate performance metrics from historical snapshots
 */
export function calculatePerformance(snapshots: MasterSnapshot[]): MasterPerformance {
  if (snapshots.length < 2) {
    return getDefaultPerformance();
  }
  
  // Sort by timestamp descending (most recent first)
  const sorted = [...snapshots].sort((a, b) => b.timestamp - a.timestamp);
  const current = sorted[0];
  const now = Date.now();
  
  // Find snapshots for each time period
  const snapshot1D = findClosestSnapshot(sorted, now - 24 * 60 * 60 * 1000);
  const snapshot7D = findClosestSnapshot(sorted, now - 7 * 24 * 60 * 60 * 1000);
  const snapshot30D = findClosestSnapshot(sorted, now - 30 * 24 * 60 * 60 * 1000);
  const snapshot1Y = findClosestSnapshot(sorted, now - 365 * 24 * 60 * 60 * 1000);
  
  // Calculate returns
  const return1D = snapshot1D ? calculateReturn(snapshot1D.totalValue, current.totalValue) : 0;
  const return7D = snapshot7D ? calculateReturn(snapshot7D.totalValue, current.totalValue) : 0;
  const return30D = snapshot30D ? calculateReturn(snapshot30D.totalValue, current.totalValue) : 0;
  const return1Y = snapshot1Y ? calculateReturn(snapshot1Y.totalValue, current.totalValue) : 0;
  
  // Calculate risk metrics
  const dailyReturns = calculateDailyReturns(sorted);
  const volatility = calculateVolatility(dailyReturns);
  const sharpeRatio = calculateSharpeRatio(return1Y, volatility);
  const maxDrawdown = calculateMaxDrawdown(sorted);
  
  return {
    return1D,
    return7D,
    return30D,
    return1Y,
    sharpeRatio,
    maxDrawdown,
    volatility,
    winRate: 0, // Requires trade history
    tradeCount: 0, // Requires trade history
    avgHoldingPeriod: 0, // Requires trade history
  };
}

/**
 * Calculate Sharpe Ratio
 * Assumes risk-free rate of 5% annually
 */
export function calculateSharpeRatio(annualReturn: number, volatility: number): number {
  const riskFreeRate = 5; // 5% annual
  if (volatility === 0) return 0;
  return (annualReturn - riskFreeRate) / volatility;
}

/**
 * Calculate maximum drawdown from snapshots
 */
export function calculateMaxDrawdown(snapshots: MasterSnapshot[]): number {
  if (snapshots.length < 2) return 0;
  
  // Sort by timestamp ascending
  const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);
  
  let maxValue = sorted[0].totalValue;
  let maxDrawdown = 0;
  
  for (const snapshot of sorted) {
    if (snapshot.totalValue > maxValue) {
      maxValue = snapshot.totalValue;
    }
    
    const drawdown = ((maxValue - snapshot.totalValue) / maxValue) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  return maxDrawdown;
}

/**
 * Calculate portfolio volatility (annualized)
 */
export function calculateVolatility(dailyReturns: number[]): number {
  if (dailyReturns.length < 2) return 0;
  
  const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const squaredDiffs = dailyReturns.map(r => Math.pow(r - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (dailyReturns.length - 1);
  const stdDev = Math.sqrt(variance);
  
  // Annualize (sqrt of 365 trading days)
  return stdDev * Math.sqrt(365);
}

// ============ Helper Functions ============

function findClosestSnapshot(snapshots: MasterSnapshot[], targetTime: number): MasterSnapshot | null {
  for (const snapshot of snapshots) {
    if (snapshot.timestamp <= targetTime) {
      return snapshot;
    }
  }
  return null;
}

function calculateReturn(startValue: number, endValue: number): number {
  if (startValue === 0) return 0;
  return ((endValue - startValue) / startValue) * 100;
}

function calculateDailyReturns(snapshots: MasterSnapshot[]): number[] {
  if (snapshots.length < 2) return [];
  
  const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);
  const returns: number[] = [];
  
  for (let i = 1; i < sorted.length; i++) {
    const dailyReturn = calculateReturn(sorted[i - 1].totalValue, sorted[i].totalValue);
    returns.push(dailyReturn);
  }
  
  return returns;
}

function getDefaultPerformance(): MasterPerformance {
  return {
    return1D: 0,
    return7D: 0,
    return30D: 0,
    return1Y: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    volatility: 0,
    winRate: 0,
    tradeCount: 0,
    avgHoldingPeriod: 0,
  };
}

function serializeMasterData(master: Master): Record<string, string> {
  return {
    address: master.address,
    name: master.name,
    description: master.description || '',
    avatar: master.avatar || '',
    tier: master.tier,
    status: master.status,
    isVerified: master.isVerified.toString(),
    narratives: JSON.stringify(master.narratives),
    primaryNarrative: master.primaryNarrative,
    tags: JSON.stringify(master.tags),
    followerCount: master.followerCount.toString(),
    emulatorCount: master.emulatorCount.toString(),
    createdAt: master.createdAt.toString(),
    updatedAt: master.updatedAt.toString(),
    holdings: JSON.stringify(master.holdings),
    performance: JSON.stringify(master.performance),
    recentTrades: JSON.stringify(master.recentTrades),
  };
}

function parseMasterData(data: Record<string, unknown>): Master {
  return {
    address: data.address as string,
    name: data.name as string,
    description: data.description as string || undefined,
    avatar: data.avatar as string || undefined,
    tier: data.tier as MasterTier,
    status: data.status as MasterStatus,
    isVerified: data.isVerified === 'true',
    narratives: JSON.parse(data.narratives as string || '[]'),
    primaryNarrative: data.primaryNarrative as NarrativeType,
    tags: JSON.parse(data.tags as string || '[]'),
    followerCount: parseInt(data.followerCount as string || '0'),
    emulatorCount: parseInt(data.emulatorCount as string || '0'),
    createdAt: parseInt(data.createdAt as string || '0'),
    updatedAt: parseInt(data.updatedAt as string || '0'),
    holdings: JSON.parse(data.holdings as string || '[]'),
    performance: JSON.parse(data.performance as string || '{}'),
    recentTrades: JSON.parse(data.recentTrades as string || '[]'),
  };
}

// ============ Follow System ============

/**
 * Follow a master
 */
export async function followMaster(userAddress: string, masterAddress: string): Promise<boolean> {
  try {
    const normalizedMaster = masterAddress.toLowerCase();
    const normalizedUser = userAddress.toLowerCase();
    
    await redis.sadd(`${MASTER_FOLLOWERS_PREFIX}${normalizedMaster}`, normalizedUser);
    await redis.hincrby(`${MASTER_PREFIX}${normalizedMaster}`, 'followerCount', 1);
    
    return true;
  } catch (error) {
    console.error('Error following master:', error);
    return false;
  }
}

/**
 * Unfollow a master
 */
export async function unfollowMaster(userAddress: string, masterAddress: string): Promise<boolean> {
  try {
    const normalizedMaster = masterAddress.toLowerCase();
    const normalizedUser = userAddress.toLowerCase();
    
    await redis.srem(`${MASTER_FOLLOWERS_PREFIX}${normalizedMaster}`, normalizedUser);
    await redis.hincrby(`${MASTER_PREFIX}${normalizedMaster}`, 'followerCount', -1);
    
    return true;
  } catch (error) {
    console.error('Error unfollowing master:', error);
    return false;
  }
}

/**
 * Check if user follows a master
 */
export async function isFollowing(userAddress: string, masterAddress: string): Promise<boolean> {
  try {
    const normalizedMaster = masterAddress.toLowerCase();
    const normalizedUser = userAddress.toLowerCase();
    
    return await redis.sismember(`${MASTER_FOLLOWERS_PREFIX}${normalizedMaster}`, normalizedUser);
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
}

/**
 * Get user's followed masters
 */
export async function getFollowedMasters(userAddress: string): Promise<string[]> {
  try {
    const allMasters = await redis.smembers(MASTER_LIST_KEY);
    const followed: string[] = [];
    
    for (const masterAddress of allMasters) {
      const isFollow = await isFollowing(userAddress, masterAddress);
      if (isFollow) {
        followed.push(masterAddress);
      }
    }
    
    return followed;
  } catch (error) {
    console.error('Error getting followed masters:', error);
    return [];
  }
}

// ============ Tier & Sorting ============

/**
 * Get tier color
 */
export function getTierColor(tier: MasterTier): string {
  switch (tier) {
    case 'legendary':
      return '#F7931A';
    case 'elite':
      return '#9945FF';
    case 'rising':
      return '#0052FF';
    case 'community':
      return '#71717A';
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
      return 'Rising Star';
    case 'community':
      return 'Community';
  }
}

/**
 * Sort masters by performance
 */
export function sortMastersByPerformance(
  masters: Master[],
  metric: keyof MasterPerformance = 'return7D',
  ascending = false
): Master[] {
  return [...masters].sort((a, b) => {
    const aValue = a.performance[metric] || 0;
    const bValue = b.performance[metric] || 0;
    return ascending ? aValue - bValue : bValue - aValue;
  });
}

/**
 * Filter masters by minimum performance
 */
export function filterMastersByPerformance(
  masters: Master[],
  metric: keyof MasterPerformance,
  minValue: number
): Master[] {
  return masters.filter(m => (m.performance[metric] || 0) >= minValue);
}

// ============ Sample/Demo Masters ============

/**
 * Create sample masters for demo/testing
 */
export function createSampleMasters(): Master[] {
  const now = Date.now();
  
  return [
    {
      address: '0x1234567890abcdef1234567890abcdef12345678',
      name: 'Blue Chip Bull',
      description: 'Conservative strategy focused on BTC and ETH accumulation',
      tier: 'legendary',
      status: 'verified',
      isVerified: true,
      narratives: ['blue_chip'],
      primaryNarrative: 'blue_chip',
      tags: ['btc', 'eth', 'long-term'],
      followerCount: 1250,
      emulatorCount: 340,
      createdAt: now - 90 * 24 * 60 * 60 * 1000,
      updatedAt: now,
      holdings: [
        { symbol: 'BTC', percentage: 50, change24h: 2.1 },
        { symbol: 'ETH', percentage: 35, change24h: 1.5 },
        { symbol: 'SOL', percentage: 15, change24h: 3.2 },
      ],
      performance: {
        return1D: 1.8,
        return7D: 8.5,
        return30D: 24.3,
        return1Y: 156.2,
        sharpeRatio: 2.1,
        maxDrawdown: 18.5,
        volatility: 42.3,
        winRate: 68,
        tradeCount: 45,
        avgHoldingPeriod: 30,
      },
      recentTrades: [],
    },
    {
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      name: 'Degen Dave',
      description: 'High-risk memecoin specialist. Not financial advice!',
      tier: 'elite',
      status: 'active',
      isVerified: true,
      narratives: ['memecoin', 'degen'],
      primaryNarrative: 'memecoin',
      tags: ['memes', 'degen', 'high-risk'],
      followerCount: 890,
      emulatorCount: 210,
      createdAt: now - 60 * 24 * 60 * 60 * 1000,
      updatedAt: now,
      holdings: [
        { symbol: 'PEPE', percentage: 35, change24h: -5.2 },
        { symbol: 'WIF', percentage: 25, change24h: 12.3 },
        { symbol: 'BONK', percentage: 20, change24h: 8.1 },
        { symbol: 'DEGEN', percentage: 20, change24h: 15.4 },
      ],
      performance: {
        return1D: 8.2,
        return7D: -12.5,
        return30D: 89.7,
        return1Y: 0,
        sharpeRatio: 0.8,
        maxDrawdown: 65.2,
        volatility: 120.5,
        winRate: 45,
        tradeCount: 230,
        avgHoldingPeriod: 3,
      },
      recentTrades: [],
    },
    {
      address: '0xfedcba0987654321fedcba0987654321fedcba09',
      name: 'DeFi Wizard',
      description: 'Yield farming and DeFi protocol expert',
      tier: 'elite',
      status: 'verified',
      isVerified: true,
      narratives: ['yield_farming'],
      primaryNarrative: 'yield_farming',
      tags: ['defi', 'yield', 'protocols'],
      followerCount: 720,
      emulatorCount: 180,
      createdAt: now - 120 * 24 * 60 * 60 * 1000,
      updatedAt: now,
      holdings: [
        { symbol: 'AAVE', percentage: 30, change24h: 2.8 },
        { symbol: 'UNI', percentage: 25, change24h: 1.2 },
        { symbol: 'CRV', percentage: 20, change24h: -0.5 },
        { symbol: 'LINK', percentage: 15, change24h: 3.1 },
        { symbol: 'MKR', percentage: 10, change24h: 0.8 },
      ],
      performance: {
        return1D: 1.5,
        return7D: 5.2,
        return30D: 18.9,
        return1Y: 85.4,
        sharpeRatio: 1.6,
        maxDrawdown: 28.3,
        volatility: 55.2,
        winRate: 62,
        tradeCount: 78,
        avgHoldingPeriod: 14,
      },
      recentTrades: [],
    },
    {
      address: '0x9876543210fedcba9876543210fedcba98765432',
      name: 'L2 Maxi',
      description: 'All-in on Layer 2 scaling solutions',
      tier: 'rising',
      status: 'active',
      isVerified: false,
      narratives: ['l2_ecosystem'],
      primaryNarrative: 'l2_ecosystem',
      tags: ['l2', 'scaling', 'base', 'optimism'],
      followerCount: 340,
      emulatorCount: 95,
      createdAt: now - 45 * 24 * 60 * 60 * 1000,
      updatedAt: now,
      holdings: [
        { symbol: 'OP', percentage: 35, change24h: 4.2 },
        { symbol: 'ARB', percentage: 30, change24h: 2.8 },
        { symbol: 'AERO', percentage: 20, change24h: 6.5 },
        { symbol: 'POL', percentage: 15, change24h: 1.1 },
      ],
      performance: {
        return1D: 3.8,
        return7D: 12.3,
        return30D: 35.6,
        return1Y: 0,
        sharpeRatio: 1.2,
        maxDrawdown: 35.1,
        volatility: 68.4,
        winRate: 58,
        tradeCount: 52,
        avgHoldingPeriod: 10,
      },
      recentTrades: [],
    },
    {
      address: '0x5555666677778888999900001111222233334444',
      name: 'AI Alpha',
      description: 'Betting big on AI and decentralized compute',
      tier: 'rising',
      status: 'active',
      isVerified: false,
      narratives: ['ai_depin'],
      primaryNarrative: 'ai_depin',
      tags: ['ai', 'depin', 'compute'],
      followerCount: 210,
      emulatorCount: 65,
      createdAt: now - 30 * 24 * 60 * 60 * 1000,
      updatedAt: now,
      holdings: [
        { symbol: 'RENDER', percentage: 40, change24h: 5.5 },
        { symbol: 'FET', percentage: 35, change24h: 3.2 },
        { symbol: 'NEAR', percentage: 25, change24h: 2.1 },
      ],
      performance: {
        return1D: 3.9,
        return7D: 18.7,
        return30D: 42.1,
        return1Y: 0,
        sharpeRatio: 1.4,
        maxDrawdown: 32.5,
        volatility: 75.2,
        winRate: 55,
        tradeCount: 38,
        avgHoldingPeriod: 12,
      },
      recentTrades: [],
    },
  ];
}




