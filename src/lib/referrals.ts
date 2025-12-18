/**
 * Referral system utilities for Portfolio League
 * 
 * Redis Schema:
 * - referral:{code} -> { ownerAddress, createdAt }
 * - referral:address:{address} -> code (reverse lookup)
 * - referrals:{address} -> Set of referred addresses
 * - bonuses:{address} -> { totalPoints, history: [...] }
 */

import { redis } from './redis';

// Constants
export const REFERRAL_BONUS_POINTS = 100; // Points earned per successful referral
export const REFERRAL_CODE_LENGTH = 8;

// Types
export type ReferralCode = {
  code: string;
  ownerAddress: string;
  createdAt: number;
};

export type ReferralStats = {
  code: string;
  totalReferrals: number;
  referredAddresses: string[];
  totalBonusPoints: number;
};

export type BonusEntry = {
  type: 'referral' | 'achievement' | 'weekly_bonus';
  points: number;
  description: string;
  timestamp: number;
  metadata?: Record<string, string>;
};

export type BonusData = {
  totalPoints: number;
  history: BonusEntry[];
};

/**
 * Generate a short, URL-safe referral code
 */
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking chars (0, O, 1, I)
  let code = '';
  for (let i = 0; i < REFERRAL_CODE_LENGTH; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get or create a referral code for an address
 */
export async function getOrCreateReferralCode(address: string): Promise<ReferralCode> {
  const normalizedAddress = address.toLowerCase();
  
  // Check if user already has a code
  const existingCode = await redis.get<string>(`referral:address:${normalizedAddress}`);
  
  if (existingCode) {
    const codeData = await redis.get<ReferralCode>(`referral:${existingCode}`);
    if (codeData) {
      return codeData;
    }
  }
  
  // Generate a new unique code
  let code: string;
  let attempts = 0;
  const maxAttempts = 10;
  
  do {
    code = generateCode();
    const exists = await redis.exists(`referral:${code}`);
    if (!exists) break;
    attempts++;
  } while (attempts < maxAttempts);
  
  if (attempts >= maxAttempts) {
    throw new Error('Failed to generate unique referral code');
  }
  
  const referralCode: ReferralCode = {
    code,
    ownerAddress: normalizedAddress,
    createdAt: Date.now(),
  };
  
  // Store the code
  await redis.set(`referral:${code}`, JSON.stringify(referralCode));
  await redis.set(`referral:address:${normalizedAddress}`, code);
  
  return referralCode;
}

/**
 * Get referral code data by code
 */
export async function getReferralByCode(code: string): Promise<ReferralCode | null> {
  const data = await redis.get<string>(`referral:${code.toUpperCase()}`);
  if (!data) return null;
  
  try {
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch {
    return null;
  }
}

/**
 * Get referral code for an address
 */
export async function getReferralCodeForAddress(address: string): Promise<string | null> {
  const normalizedAddress = address.toLowerCase();
  return await redis.get<string>(`referral:address:${normalizedAddress}`);
}

/**
 * Track a successful referral
 * Returns true if this is a new referral, false if already tracked
 */
export async function trackReferral(
  referrerAddress: string, 
  referredAddress: string
): Promise<{ success: boolean; isNew: boolean; error?: string }> {
  const normalizedReferrer = referrerAddress.toLowerCase();
  const normalizedReferred = referredAddress.toLowerCase();
  
  // Can't refer yourself
  if (normalizedReferrer === normalizedReferred) {
    return { success: false, isNew: false, error: 'Cannot refer yourself' };
  }
  
  // Check if this address was already referred by anyone
  const wasReferred = await redis.sismember('referred:all', normalizedReferred);
  if (wasReferred) {
    return { success: false, isNew: false, error: 'Address already referred' };
  }
  
  // Add to referrer's set of referrals
  await redis.sadd(`referrals:${normalizedReferrer}`, normalizedReferred);
  
  // Mark address as referred globally
  await redis.sadd('referred:all', normalizedReferred);
  
  // Store who referred this address
  await redis.set(`referred:by:${normalizedReferred}`, normalizedReferrer);
  
  // Award bonus points to referrer
  await addBonusPoints(normalizedReferrer, {
    type: 'referral',
    points: REFERRAL_BONUS_POINTS,
    description: `Referral bonus for ${normalizedReferred.slice(0, 6)}...${normalizedReferred.slice(-4)}`,
    timestamp: Date.now(),
    metadata: { referredAddress: normalizedReferred },
  });
  
  return { success: true, isNew: true };
}

/**
 * Get all addresses referred by a user
 */
export async function getReferredAddresses(address: string): Promise<string[]> {
  const normalizedAddress = address.toLowerCase();
  const members = await redis.smembers(`referrals:${normalizedAddress}`);
  return members || [];
}

/**
 * Get referral stats for an address
 */
export async function getReferralStats(address: string): Promise<ReferralStats | null> {
  const normalizedAddress = address.toLowerCase();
  
  // Get user's referral code
  const code = await getReferralCodeForAddress(normalizedAddress);
  if (!code) return null;
  
  // Get referred addresses
  const referredAddresses = await getReferredAddresses(normalizedAddress);
  
  // Get bonus data
  const bonusData = await getBonusData(normalizedAddress);
  
  return {
    code,
    totalReferrals: referredAddresses.length,
    referredAddresses,
    totalBonusPoints: bonusData?.totalPoints || 0,
  };
}

/**
 * Add bonus points to a user
 */
export async function addBonusPoints(address: string, entry: BonusEntry): Promise<void> {
  const normalizedAddress = address.toLowerCase();
  const key = `bonuses:${normalizedAddress}`;
  
  // Get existing bonus data
  const existingData = await redis.get<string>(key);
  let bonusData: BonusData;
  
  if (existingData) {
    try {
      bonusData = typeof existingData === 'string' ? JSON.parse(existingData) : existingData;
    } catch {
      bonusData = { totalPoints: 0, history: [] };
    }
  } else {
    bonusData = { totalPoints: 0, history: [] };
  }
  
  // Add new entry
  bonusData.totalPoints += entry.points;
  bonusData.history.unshift(entry); // Add to beginning
  
  // Keep only last 100 entries
  if (bonusData.history.length > 100) {
    bonusData.history = bonusData.history.slice(0, 100);
  }
  
  await redis.set(key, JSON.stringify(bonusData));
}

/**
 * Get bonus data for an address
 */
export async function getBonusData(address: string): Promise<BonusData | null> {
  const normalizedAddress = address.toLowerCase();
  const data = await redis.get<string>(`bonuses:${normalizedAddress}`);
  
  if (!data) return null;
  
  try {
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch {
    return null;
  }
}

/**
 * Check if an address was referred by someone
 */
export async function getReferredBy(address: string): Promise<string | null> {
  const normalizedAddress = address.toLowerCase();
  return await redis.get<string>(`referred:by:${normalizedAddress}`);
}









