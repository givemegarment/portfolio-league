/**
 * Admin utilities for Portfolio League
 */

/**
 * Check if an address is an admin
 */
export function isAdmin(address: string | undefined): boolean {
  if (!address) return false;
  
  const adminWallets = process.env.ADMIN_WALLETS || process.env.NEXT_PUBLIC_ADMIN_WALLETS || '';
  const admins = adminWallets
    .split(',')
    .map(a => a.trim().toLowerCase())
    .filter(a => a.length > 0);
  
  return admins.includes(address.toLowerCase());
}

/**
 * Get list of admin wallets
 */
export function getAdminWallets(): string[] {
  const adminWallets = process.env.ADMIN_WALLETS || process.env.NEXT_PUBLIC_ADMIN_WALLETS || '';
  return adminWallets
    .split(',')
    .map(a => a.trim().toLowerCase())
    .filter(a => a.length > 0);
}

/**
 * Admin stats type
 */
export type AdminStats = {
  totalPlayers: number;
  activePlayers: number;
  totalPortfolios: number;
  prizePool: number;
  weeklyParticipation: number;
  averageScore: number;
  topPerformers: Array<{
    address: string;
    score: number;
    rank: number;
  }>;
  recentActivity: Array<{
    type: string;
    address: string;
    timestamp: number;
    details?: string;
  }>;
};

/**
 * Prize pool configuration type
 */
export type PrizePoolConfig = {
  total: number;
  distribution: {
    first: number;
    second: number;
    third: number;
    topTen: number;
  };
  currency: string;
  sponsoredBy?: string;
};

