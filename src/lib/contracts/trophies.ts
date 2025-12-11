/**
 * Trophy contract interaction helpers
 * 
 * For use with the ImitatiaTrophies soulbound NFT contract
 */

import { type Address } from 'viem';

// Contract address on Base mainnet
// Deployed: https://basescan.org/address/0xf0a34C60BA49Edb94AD0CDA642231dBCc4Cc066A
export const TROPHY_CONTRACT_ADDRESS: Address = '0xf0a34C60BA49Edb94AD0CDA642231dBCc4Cc066A';

// Trophy types matching the smart contract enum
export enum TrophyType {
  WEEKLY_WINNER = 0,
  SEASON_CHAMPION = 1,
  HOT_STREAK = 2,
  PERFECT_PICK = 3,
  EARLY_ADOPTER = 4,
  GIANT_SLAYER = 5,
}

// Trophy type metadata
export const TROPHY_METADATA: Record<TrophyType, {
  name: string;
  description: string;
  emoji: string;
  rarity: 'legendary' | 'epic' | 'rare' | 'uncommon';
}> = {
  [TrophyType.WEEKLY_WINNER]: {
    name: 'Weekly Champion',
    description: 'Finished #1 in a weekly competition',
    emoji: '🥇',
    rarity: 'epic',
  },
  [TrophyType.SEASON_CHAMPION]: {
    name: 'Season Champion',
    description: 'Won a full season of Imitatio',
    emoji: '🏆',
    rarity: 'legendary',
  },
  [TrophyType.HOT_STREAK]: {
    name: 'Hot Streak',
    description: 'Finished in top 10% for 3+ consecutive weeks',
    emoji: '🔥',
    rarity: 'rare',
  },
  [TrophyType.PERFECT_PICK]: {
    name: 'Perfect Pick',
    description: 'Achieved 100%+ portfolio return in a week',
    emoji: '🎯',
    rarity: 'rare',
  },
  [TrophyType.EARLY_ADOPTER]: {
    name: 'Early Adopter',
    description: 'Participated in Season 1',
    emoji: '🌱',
    rarity: 'legendary',
  },
  [TrophyType.GIANT_SLAYER]: {
    name: 'Giant Slayer',
    description: 'Beat a top 50 player in a challenge',
    emoji: '⚔️',
    rarity: 'uncommon',
  },
};

// Contract ABI (partial - only the functions we need)
export const TROPHY_CONTRACT_ABI = [
  {
    inputs: [
      { name: 'player', type: 'address' },
      { name: 'trophyType', type: 'uint8' },
      { name: 'season', type: 'uint256' },
      { name: 'week', type: 'uint256' },
      { name: 'score', type: 'uint256' },
    ],
    name: 'awardTrophy',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'players', type: 'address[]' },
      { name: 'trophyTypes', type: 'uint8[]' },
      { name: 'seasons', type: 'uint256[]' },
      { name: 'weeks', type: 'uint256[]' },
      { name: 'scores', type: 'uint256[]' },
    ],
    name: 'batchAwardTrophies',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'player', type: 'address' }],
    name: 'getPlayerTrophies',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getTrophy',
    outputs: [
      {
        components: [
          { name: 'trophyType', type: 'uint8' },
          { name: 'season', type: 'uint256' },
          { name: 'week', type: 'uint256' },
          { name: 'score', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'player', type: 'address' },
      { name: 'trophyType', type: 'uint8' },
      { name: 'season', type: 'uint256' },
      { name: 'week', type: 'uint256' },
    ],
    name: 'hasAchievement',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'player', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Type for trophy data from contract
export type OnChainTrophy = {
  trophyType: number;
  season: bigint;
  week: bigint;
  score: bigint;
  timestamp: bigint;
};

// Helper to format score from contract (stored as integer * 100)
export function formatContractScore(score: bigint): number {
  return Number(score) / 100;
}

// Helper to convert local score to contract format
export function toContractScore(score: number): bigint {
  return BigInt(Math.round(score * 100));
}

// Map local achievement type to contract trophy type
export function achievementToTrophyType(achievementType: string): TrophyType | null {
  const mapping: Record<string, TrophyType> = {
    weekly_winner: TrophyType.WEEKLY_WINNER,
    season_champion: TrophyType.SEASON_CHAMPION,
    hot_streak: TrophyType.HOT_STREAK,
    perfect_pick: TrophyType.PERFECT_PICK,
    early_adopter: TrophyType.EARLY_ADOPTER,
    giant_slayer: TrophyType.GIANT_SLAYER,
  };
  return mapping[achievementType] ?? null;
}

// Get rarity color for trophy type
export function getTrophyRarityColor(trophyType: TrophyType): string {
  const rarity = TROPHY_METADATA[trophyType].rarity;
  switch (rarity) {
    case 'legendary':
      return '#F7931A';
    case 'epic':
      return '#9945FF';
    case 'rare':
      return '#0052FF';
    case 'uncommon':
      return '#10b981';
    default:
      return '#71717a';
  }
}

