/**
 * AI Portfolio Coach
 * 
 * Rule-based suggestion engine that analyzes:
 * - Historical winner patterns
 * - Current week's popular picks
 * - Asset momentum (price trends)
 * - Risk/volatility indicators
 */

type Allocation = {
  symbol: string;
  percentage: number;
};

type PriceData = {
  price: number;
  change24h: number;
};

type LeaderboardEntry = {
  rank: number;
  user: string;
  score: number;
  allocations: Allocation[];
};

export type Suggestion = {
  id: string;
  type: 'increase' | 'decrease' | 'add' | 'remove' | 'rebalance';
  asset: string;
  currentAllocation: number;
  suggestedAllocation: number;
  reasoning: string;
  confidence: number; // 0-1
  riskImpact: 'lower' | 'neutral' | 'higher';
};

export type CoachAnalysis = {
  suggestions: Suggestion[];
  riskScore: number; // 1-10
  diversificationScore: number; // 1-10
  momentumAlignment: number; // -1 to 1 (negative = against momentum)
  popularityScore: number; // How similar to popular picks (0-1)
  insights: string[];
};

// Asset metadata for analysis
const ASSET_METADATA: Record<string, { volatility: number; category: string }> = {
  BTC: { volatility: 0.6, category: 'blue-chip' },
  ETH: { volatility: 0.7, category: 'blue-chip' },
  SOL: { volatility: 0.85, category: 'alt' },
  USDC: { volatility: 0.01, category: 'stablecoin' },
};

/**
 * Calculate portfolio risk score (1-10)
 * Higher score = higher risk
 */
export function calculateRiskScore(allocations: Allocation[]): number {
  let weightedVolatility = 0;
  
  for (const { symbol, percentage } of allocations) {
    const meta = ASSET_METADATA[symbol];
    if (meta) {
      weightedVolatility += meta.volatility * (percentage / 100);
    }
  }
  
  // Scale to 1-10
  return Math.min(10, Math.max(1, Math.round(weightedVolatility * 10 + 1)));
}

/**
 * Calculate diversification score (1-10)
 * Higher score = better diversification
 */
export function calculateDiversificationScore(allocations: Allocation[]): number {
  if (allocations.length === 0) return 1;
  if (allocations.length === 1) return 2;
  
  // Check category distribution
  const categoryWeights: Record<string, number> = {};
  for (const { symbol, percentage } of allocations) {
    const category = ASSET_METADATA[symbol]?.category || 'unknown';
    categoryWeights[category] = (categoryWeights[category] || 0) + percentage;
  }
  
  const categories = Object.keys(categoryWeights);
  const evenDistribution = 100 / categories.length;
  
  // Calculate how far from even distribution we are
  let deviationSum = 0;
  for (const weight of Object.values(categoryWeights)) {
    deviationSum += Math.abs(weight - evenDistribution);
  }
  
  // More assets and more categories = higher score
  const assetBonus = Math.min(allocations.length, 4) * 1.5;
  const categoryBonus = categories.length * 2;
  const distributionPenalty = deviationSum / 50;
  
  return Math.min(10, Math.max(1, Math.round(assetBonus + categoryBonus - distributionPenalty)));
}

/**
 * Calculate momentum alignment (-1 to 1)
 * Positive = portfolio aligns with current momentum
 */
export function calculateMomentumAlignment(
  allocations: Allocation[],
  prices: Record<string, PriceData>
): number {
  let alignment = 0;
  let totalWeight = 0;
  
  for (const { symbol, percentage } of allocations) {
    const priceData = prices[symbol];
    if (!priceData) continue;
    
    // Normalize change to -1 to 1 range (assuming max 20% daily change)
    const normalizedChange = Math.max(-1, Math.min(1, priceData.change24h / 20));
    
    alignment += normalizedChange * (percentage / 100);
    totalWeight += percentage / 100;
  }
  
  return totalWeight > 0 ? alignment / totalWeight : 0;
}

/**
 * Calculate how similar portfolio is to top performers
 */
export function calculatePopularityScore(
  allocations: Allocation[],
  leaderboard: LeaderboardEntry[]
): number {
  if (leaderboard.length === 0) return 0.5;
  
  // Get top 10 portfolios
  const topPortfolios = leaderboard.slice(0, 10);
  
  // Calculate average allocation per asset among winners
  const avgAllocations: Record<string, number> = {};
  for (const entry of topPortfolios) {
    for (const { symbol, percentage } of entry.allocations) {
      avgAllocations[symbol] = (avgAllocations[symbol] || 0) + percentage / topPortfolios.length;
    }
  }
  
  // Compare user's allocations to average
  let similarity = 0;
  let checked = 0;
  
  for (const { symbol, percentage } of allocations) {
    const avgPct = avgAllocations[symbol] || 0;
    const diff = Math.abs(percentage - avgPct);
    similarity += 1 - (diff / 100);
    checked++;
  }
  
  return checked > 0 ? similarity / checked : 0.5;
}

/**
 * Generate portfolio suggestions
 */
export function generateSuggestions(
  allocations: Allocation[],
  prices: Record<string, PriceData>,
  leaderboard: LeaderboardEntry[]
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const allSymbols = ['BTC', 'ETH', 'SOL', 'USDC'];
  
  // Get current allocations as map
  const currentMap = new Map(allocations.map(a => [a.symbol, a.percentage]));
  
  // Calculate averages from top performers
  const topAvg: Record<string, number> = {};
  const topPortfolios = leaderboard.slice(0, 10);
  for (const entry of topPortfolios) {
    for (const { symbol, percentage } of entry.allocations) {
      topAvg[symbol] = (topAvg[symbol] || 0) + percentage / Math.max(1, topPortfolios.length);
    }
  }
  
  // Analyze each asset
  for (const symbol of allSymbols) {
    const current = currentMap.get(symbol) || 0;
    const priceData = prices[symbol];
    const avgAllocation = topAvg[symbol] || 0;
    const meta = ASSET_METADATA[symbol];
    
    if (!priceData) continue;
    
    // Rule 1: Momentum-based suggestions
    if (priceData.change24h > 5 && current < avgAllocation) {
      suggestions.push({
        id: `momentum_${symbol}`,
        type: current === 0 ? 'add' : 'increase',
        asset: symbol,
        currentAllocation: current,
        suggestedAllocation: Math.min(current + 10, avgAllocation),
        reasoning: `${symbol} is up ${priceData.change24h.toFixed(1)}% today. Top performers have avg ${avgAllocation.toFixed(0)}% allocation.`,
        confidence: Math.min(0.9, 0.5 + priceData.change24h / 20),
        riskImpact: meta?.volatility > 0.7 ? 'higher' : 'neutral',
      });
    }
    
    // Rule 2: Contrarian suggestions for drops
    if (priceData.change24h < -5 && current > 0) {
      suggestions.push({
        id: `contrarian_${symbol}`,
        type: 'decrease',
        asset: symbol,
        currentAllocation: current,
        suggestedAllocation: Math.max(0, current - 10),
        reasoning: `${symbol} is down ${Math.abs(priceData.change24h).toFixed(1)}% today. Consider reducing exposure.`,
        confidence: 0.6,
        riskImpact: 'lower',
      });
    }
    
    // Rule 3: Diversification suggestions
    if (current === 0 && avgAllocation > 15) {
      suggestions.push({
        id: `diversify_${symbol}`,
        type: 'add',
        asset: symbol,
        currentAllocation: 0,
        suggestedAllocation: Math.round(avgAllocation / 2),
        reasoning: `Consider adding ${symbol} for diversification. Top players avg ${avgAllocation.toFixed(0)}%.`,
        confidence: 0.7,
        riskImpact: meta?.volatility < 0.5 ? 'lower' : 'neutral',
      });
    }
    
    // Rule 4: Concentration warning
    if (current > 60) {
      suggestions.push({
        id: `concentration_${symbol}`,
        type: 'decrease',
        asset: symbol,
        currentAllocation: current,
        suggestedAllocation: 50,
        reasoning: `${current}% in ${symbol} is highly concentrated. Consider reducing for better risk management.`,
        confidence: 0.8,
        riskImpact: 'lower',
      });
    }
    
    // Rule 5: Stablecoin hedging
    if (symbol === 'USDC') {
      const totalVolatile = allocations
        .filter(a => ASSET_METADATA[a.symbol]?.volatility > 0.5)
        .reduce((sum, a) => sum + a.percentage, 0);
      
      if (totalVolatile > 80 && current < 10) {
        suggestions.push({
          id: 'hedge_usdc',
          type: current === 0 ? 'add' : 'increase',
          asset: 'USDC',
          currentAllocation: current,
          suggestedAllocation: 15,
          reasoning: 'Your portfolio is highly volatile. Consider adding USDC as a hedge.',
          confidence: 0.75,
          riskImpact: 'lower',
        });
      }
    }
  }
  
  // Sort by confidence
  suggestions.sort((a, b) => b.confidence - a.confidence);
  
  // Return top 3 suggestions
  return suggestions.slice(0, 3);
}

/**
 * Generate full coach analysis
 */
export function analyzePortfolio(
  allocations: Allocation[],
  prices: Record<string, PriceData>,
  leaderboard: LeaderboardEntry[]
): CoachAnalysis {
  const riskScore = calculateRiskScore(allocations);
  const diversificationScore = calculateDiversificationScore(allocations);
  const momentumAlignment = calculateMomentumAlignment(allocations, prices);
  const popularityScore = calculatePopularityScore(allocations, leaderboard);
  const suggestions = generateSuggestions(allocations, prices, leaderboard);
  
  // Generate insights
  const insights: string[] = [];
  
  if (riskScore >= 8) {
    insights.push('⚠️ High risk portfolio - consider adding stability');
  } else if (riskScore <= 3) {
    insights.push('🛡️ Conservative portfolio - lower upside potential');
  }
  
  if (diversificationScore <= 4) {
    insights.push('📊 Low diversification - spread across more assets');
  } else if (diversificationScore >= 8) {
    insights.push('✅ Well-diversified portfolio');
  }
  
  if (momentumAlignment > 0.3) {
    insights.push('📈 Aligned with current momentum');
  } else if (momentumAlignment < -0.3) {
    insights.push('📉 Against current momentum - contrarian play');
  }
  
  if (popularityScore > 0.7) {
    insights.push('👥 Similar to top performers');
  } else if (popularityScore < 0.3) {
    insights.push('🎲 Unique strategy - high variance');
  }
  
  return {
    suggestions,
    riskScore,
    diversificationScore,
    momentumAlignment,
    popularityScore,
    insights,
  };
}



