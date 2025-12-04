/**
 * Portfolio scoring utilities
 * 
 * Calculates weighted portfolio returns based on allocation percentages
 * and price changes from entry to current.
 */

export type AllocationItem = {
  symbol: string;
  percentage: number;
};

export type PriceData = {
  price: number;
  change24h?: number;
};

export type StoredPortfolio = {
  allocations: AllocationItem[];
  entryPrices: Record<string, number>;
  timestamp: number;
};

export type ScoreBreakdown = {
  symbol: string;
  percentage: number;
  entryPrice: number;
  currentPrice: number;
  assetReturn: number; // % change of asset
  weightedReturn: number; // contribution to total score
};

export type ScoreResult = {
  totalScore: number; // Total portfolio % return
  breakdown: ScoreBreakdown[];
};

/**
 * Calculate the weighted portfolio return
 * 
 * Formula for each asset:
 * weightedReturn = ((currentPrice - entryPrice) / entryPrice) * (percentage / 100)
 * 
 * Total score = sum of all weightedReturns * 100 (to get percentage)
 * 
 * Example:
 * - BTC 50%: entry $97k, current $100k = +3.09% * 0.50 = +1.55%
 * - ETH 30%: entry $3600, current $3500 = -2.78% * 0.30 = -0.83%
 * - SOL 20%: entry $230, current $250 = +8.7% * 0.20 = +1.74%
 * - Total: +2.46%
 */
export function calculateScore(
  portfolio: StoredPortfolio,
  currentPrices: Record<string, PriceData>
): ScoreResult {
  const breakdown: ScoreBreakdown[] = [];
  let totalScore = 0;

  for (const allocation of portfolio.allocations) {
    const { symbol, percentage } = allocation;
    const entryPrice = portfolio.entryPrices[symbol];
    const currentPriceData = currentPrices[symbol];

    if (!entryPrice || !currentPriceData) {
      // Skip if we don't have price data
      console.warn(`Missing price data for ${symbol}`);
      continue;
    }

    const currentPrice = currentPriceData.price;
    
    // Calculate asset return (% change)
    const assetReturn = ((currentPrice - entryPrice) / entryPrice) * 100;
    
    // Calculate weighted contribution (percentage is 0-100, so divide by 100)
    const weightedReturn = assetReturn * (percentage / 100);
    
    totalScore += weightedReturn;

    breakdown.push({
      symbol,
      percentage,
      entryPrice,
      currentPrice,
      assetReturn,
      weightedReturn,
    });
  }

  return {
    totalScore,
    breakdown,
  };
}

/**
 * Calculate score from simple price maps (convenience function)
 */
export function calculateScoreSimple(
  allocations: AllocationItem[],
  entryPrices: Record<string, number>,
  currentPrices: Record<string, number>
): number {
  let totalScore = 0;

  for (const { symbol, percentage } of allocations) {
    const entry = entryPrices[symbol];
    const current = currentPrices[symbol];

    if (!entry || !current) continue;

    const assetReturn = ((current - entry) / entry) * 100;
    const weightedReturn = assetReturn * (percentage / 100);
    totalScore += weightedReturn;
  }

  return totalScore;
}

/**
 * Format score for display
 */
export function formatScore(score: number): string {
  const sign = score >= 0 ? '+' : '';
  return `${sign}${score.toFixed(2)}%`;
}

/**
 * Get score color class based on value
 */
export function getScoreColorClass(score: number): string {
  if (score > 0) return 'text-accent-emerald';
  if (score < 0) return 'text-accent-rose';
  return 'text-white/60';
}

