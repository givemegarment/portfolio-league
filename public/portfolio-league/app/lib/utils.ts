import { Asset } from '../types';

/**
 * Format wallet address to short form
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format currency with proper separators
 */
export function formatCurrency(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format percentage with sign
 */
export function formatPercent(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Calculate portfolio value based on price changes
 */
export function calculatePortfolioValue(
  allocations: Array<{ asset: Asset; percentage: number }>,
  startPrices: Record<Asset, number>,
  currentPrices: Record<Asset, number>,
  initialValue: number = 10000
): number {
  let finalValue = 0;

  allocations.forEach(({ asset, percentage }) => {
    const startPrice = startPrices[asset];
    const currentPrice = currentPrices[asset];
    const priceChange = currentPrice / startPrice;
    const allocation = (percentage / 100) * initialValue;
    finalValue += allocation * priceChange;
  });

  return finalValue;
}

/**
 * Calculate returns percentage
 */
export function calculateReturns(
  initialValue: number,
  currentValue: number
): number {
  return ((currentValue - initialValue) / initialValue) * 100;
}

/**
 * Validate portfolio allocations
 */
export function validateAllocations(allocations: number[]): {
  valid: boolean;
  error?: string;
} {
  const total = allocations.reduce((a, b) => a + b, 0);

  if (allocations.length !== 3) {
    return { valid: false, error: 'Must have exactly 3 allocations' };
  }

  if (allocations.some(a => a < 0 || a > 100)) {
    return { valid: false, error: 'Allocations must be between 0 and 100' };
  }

  if (Math.abs(total - 100) > 0.01) {
    return { valid: false, error: 'Allocations must sum to 100%' };
  }

  return { valid: true };
}

/**
 * Get asset color for UI
 */
export function getAssetColor(asset: Asset): string {
  const colors = {
    BTC: '#F7931A',
    ETH: '#627EEA',
    SOL: '#14F195',
    USDC_YIELD: '#2775CA',
  };
  return colors[asset] || '#999';
}

/**
 * Get asset icon
 */
export function getAssetIcon(asset: Asset): string {
  const icons = {
    BTC: '₿',
    ETH: 'Ξ',
    SOL: '◎',
    USDC_YIELD: '$',
  };
  return icons[asset] || '?';
}

/**
 * Calculate rank badge emoji
 */
export function getRankBadge(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  if (rank <= 10) return '🏆';
  return '🎖️';
}

/**
 * Format timestamp to relative time
 */
export function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

/**
 * Generate shareable text for Farcaster
 */
export function generateShareText(
  season: number,
  assets: Asset[],
  allocations: number[],
  rank?: number,
  returns?: number
): string {
  let text = `Just entered Portfolio League Season ${season}! 🏆\n\n`;
  text += 'My portfolio:\n';
  assets.forEach((asset, i) => {
    text += `${getAssetIcon(asset)} ${asset}: ${allocations[i]}%\n`;
  });

  if (rank && returns !== undefined) {
    text += `\nCurrent rank: ${getRankBadge(rank)} #${rank}\n`;
    text += `Returns: ${formatPercent(returns)}\n`;
  }

  text += '\nThink you can beat me? Join now! 👇';
  return text;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check if league is active
 */
export function isLeagueActive(startTime: number, endTime: number): boolean {
  const now = Date.now();
  return now >= startTime && now < endTime;
}

/**
 * Get league status
 */
export function getLeagueStatus(
  startTime: number,
  endTime: number
): 'upcoming' | 'active' | 'completed' {
  const now = Date.now();
  if (now < startTime) return 'upcoming';
  if (now >= startTime && now < endTime) return 'active';
  return 'completed';
}

/**
 * Convert asset enum to number for contract
 */
export function assetToNumber(asset: Asset): number {
  const map = { BTC: 0, ETH: 1, SOL: 2, USDC_YIELD: 3 };
  return map[asset];
}

/**
 * Convert number to asset enum from contract
 */
export function numberToAsset(num: number): Asset {
  const map = ['BTC', 'ETH', 'SOL', 'USDC_YIELD'] as const;
  return map[num];
}
