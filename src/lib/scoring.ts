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

// ============ Risk Metrics ============

export type RiskMetrics = {
  sharpeRatio: number;
  volatility: number;
  maxDrawdown: number;
  riskScore: 'low' | 'medium' | 'high' | 'extreme';
  diversificationScore: number;
};

/**
 * Calculate Sharpe Ratio for a portfolio
 * Assumes risk-free rate of 5% annually, converted to period rate
 */
export function calculateSharpeRatio(
  returns: number[],
  periodDays: number = 7
): number {
  if (returns.length < 2) return 0;
  
  const riskFreeAnnual = 0.05;
  const riskFreePeriod = riskFreeAnnual * (periodDays / 365);
  
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const excessReturn = avgReturn - riskFreePeriod * 100;
  
  // Calculate standard deviation
  const squaredDiffs = returns.map(r => Math.pow(r - avgReturn, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (returns.length - 1);
  const stdDev = Math.sqrt(variance);
  
  if (stdDev === 0) return 0;
  
  return excessReturn / stdDev;
}

/**
 * Calculate portfolio volatility
 */
export function calculateVolatility(returns: number[]): number {
  if (returns.length < 2) return 0;
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (returns.length - 1);
  
  return Math.sqrt(variance);
}

/**
 * Calculate maximum drawdown from a series of values
 */
export function calculateMaxDrawdown(values: number[]): number {
  if (values.length < 2) return 0;
  
  let maxValue = values[0];
  let maxDrawdown = 0;
  
  for (const value of values) {
    if (value > maxValue) {
      maxValue = value;
    }
    
    const drawdown = ((maxValue - value) / maxValue) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  return maxDrawdown;
}

/**
 * Calculate diversification score based on allocation spread
 * Higher score = more diversified
 */
export function calculateDiversificationScore(allocations: AllocationItem[]): number {
  if (allocations.length === 0) return 0;
  if (allocations.length === 1) return 0;
  
  // Calculate Herfindahl-Hirschman Index (HHI)
  const hhi = allocations.reduce((sum, a) => sum + Math.pow(a.percentage / 100, 2), 0);
  
  // Convert to 0-100 scale where higher = more diversified
  // HHI of 1 = completely concentrated, HHI of 1/n = perfectly distributed
  const maxDiversification = 1 / allocations.length;
  const diversification = (1 - hhi) / (1 - maxDiversification);
  
  return Math.round(diversification * 100);
}

/**
 * Determine risk level based on volatility and allocation
 */
export function getRiskLevel(
  volatility: number,
  allocations: AllocationItem[]
): RiskMetrics['riskScore'] {
  // High-risk assets
  const highRiskAssets = ['PEPE', 'WIF', 'BONK', 'DEGEN', 'BRETT', 'TOSHI', 'HIGHER'];
  
  const highRiskAllocation = allocations
    .filter(a => highRiskAssets.includes(a.symbol))
    .reduce((sum, a) => sum + a.percentage, 0);
  
  if (volatility > 100 || highRiskAllocation > 70) return 'extreme';
  if (volatility > 60 || highRiskAllocation > 40) return 'high';
  if (volatility > 30 || highRiskAllocation > 20) return 'medium';
  return 'low';
}

/**
 * Calculate complete risk metrics
 */
export function calculateRiskMetrics(
  allocations: AllocationItem[],
  historicalReturns: number[] = []
): RiskMetrics {
  const volatility = calculateVolatility(historicalReturns);
  const sharpeRatio = calculateSharpeRatio(historicalReturns);
  const maxDrawdown = calculateMaxDrawdown(historicalReturns.map((r, i) => 
    100 + historicalReturns.slice(0, i + 1).reduce((a, b) => a + b, 0)
  ));
  const diversificationScore = calculateDiversificationScore(allocations);
  const riskScore = getRiskLevel(volatility, allocations);
  
  return {
    sharpeRatio,
    volatility,
    maxDrawdown,
    riskScore,
    diversificationScore,
  };
}

/**
 * Get risk score color
 */
export function getRiskScoreColor(riskScore: RiskMetrics['riskScore']): string {
  switch (riskScore) {
    case 'low': return '#10B981';
    case 'medium': return '#F59E0B';
    case 'high': return '#F97316';
    case 'extreme': return '#EF4444';
  }
}

/**
 * Get risk score label
 */
export function getRiskScoreLabel(riskScore: RiskMetrics['riskScore']): string {
  switch (riskScore) {
    case 'low': return 'Conservative';
    case 'medium': return 'Moderate';
    case 'high': return 'Aggressive';
    case 'extreme': return 'Degen';
  }
}

/**
 * Calculate risk-adjusted return
 */
export function calculateRiskAdjustedReturn(
  totalReturn: number,
  volatility: number
): number {
  if (volatility === 0) return totalReturn;
  return totalReturn / volatility;
}
