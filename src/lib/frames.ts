/**
 * Shared utilities for Farcaster Frames
 */

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio-league.vercel.app';

// Asset colors for portfolio visualization
export const ASSET_COLORS: Record<string, string> = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  SOL: '#9945FF',
  USDC: '#2775CA',
};

// Format address for display
export function formatAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Format score with sign
export function formatScore(score: number): string {
  const sign = score >= 0 ? '+' : '';
  return `${sign}${score.toFixed(2)}%`;
}

// Get score color
export function getScoreColor(score: number): string {
  return score >= 0 ? '#10b981' : '#f43f5e';
}

// Fetch leaderboard data
export async function fetchLeaderboard(limit: number = 5): Promise<Array<{
  rank: number;
  user: string;
  score: number;
  allocations: Array<{ symbol: string; percentage: number }>;
}>> {
  try {
    const response = await fetch(`${BASE_URL}/api/leaderboard?limit=${limit}`, {
      next: { revalidate: 60 },
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
  }
  return [];
}

// Fetch portfolio for an address
export async function fetchPortfolio(address: string): Promise<{
  allocations: Array<{ symbol: string; percentage: number }>;
  score?: number;
  rank?: number;
  timestamp?: number;
} | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/portfolio?address=${address}`, {
      next: { revalidate: 30 },
    });
    if (response.ok) {
      const data = await response.json();
      if (data.portfolio?.allocations) {
        // Try to get score and rank from leaderboard
        const leaderboard = await fetchLeaderboard(100);
        const entry = leaderboard.find(
          (r) => r.user.toLowerCase() === address.toLowerCase()
        );
        
        return {
          allocations: data.portfolio.allocations,
          score: entry?.score,
          rank: entry?.rank,
          timestamp: data.portfolio.timestamp,
        };
      }
    }
  } catch (error) {
    console.error('Failed to fetch portfolio:', error);
  }
  return null;
}

// Get current week info
export async function getWeekInfo(): Promise<{
  season: string;
  week: number;
}> {
  try {
    const response = await fetch(`${BASE_URL}/api/portfolio?address=0x0000000000000000000000000000000000000000`, {
      next: { revalidate: 300 },
    });
    if (response.ok) {
      const data = await response.json();
      return {
        season: data.weekInfo?.season?.replace('s', '') || '1',
        week: data.weekInfo?.week || 1,
      };
    }
  } catch (error) {
    console.error('Failed to fetch week info:', error);
  }
  return { season: '1', week: 1 };
}


