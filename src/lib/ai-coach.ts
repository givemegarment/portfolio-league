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

// Risk categories for proper assessment
type RiskCategory = 'blue-chip' | 'stablecoin' | 'alt-l1' | 'l2' | 'defi' | 'memecoin' | 'ai' | 'unknown';

// Asset metadata for analysis - COMPREHENSIVE LIST
// Volatility scale: 0.0 (no volatility) to 1.0 (extreme volatility)
const ASSET_METADATA: Record<string, { volatility: number; category: RiskCategory }> = {
  // Blue Chips - Lower volatility (0.5-0.7)
  BTC: { volatility: 0.55, category: 'blue-chip' },
  ETH: { volatility: 0.65, category: 'blue-chip' },
  
  // Stablecoins - Minimal volatility (0.01-0.05)
  USDC: { volatility: 0.01, category: 'stablecoin' },
  USDT: { volatility: 0.01, category: 'stablecoin' },
  DAI: { volatility: 0.02, category: 'stablecoin' },
  
  // Alt L1s - Higher volatility (0.75-0.85)
  SOL: { volatility: 0.78, category: 'alt-l1' },
  AVAX: { volatility: 0.80, category: 'alt-l1' },
  NEAR: { volatility: 0.82, category: 'alt-l1' },
  INJ: { volatility: 0.85, category: 'alt-l1' },
  SUI: { volatility: 0.85, category: 'alt-l1' },
  APT: { volatility: 0.83, category: 'alt-l1' },
  
  // L2 Tokens - Moderate-high volatility (0.70-0.80)
  OP: { volatility: 0.75, category: 'l2' },
  ARB: { volatility: 0.75, category: 'l2' },
  POL: { volatility: 0.72, category: 'l2' },
  
  // DeFi Blue Chips - Moderate volatility (0.65-0.78)
  LINK: { volatility: 0.68, category: 'defi' },
  UNI: { volatility: 0.72, category: 'defi' },
  AAVE: { volatility: 0.70, category: 'defi' },
  MKR: { volatility: 0.65, category: 'defi' },
  CRV: { volatility: 0.78, category: 'defi' },
  
  // Base Ecosystem - High volatility (0.85-0.95)
  AERO: { volatility: 0.85, category: 'defi' },  // DeFi on Base, slightly lower risk
  
  // MEMECOINS - HIGHEST VOLATILITY (0.90-0.98)
  // These are the riskiest assets!
  BRETT: { volatility: 0.95, category: 'memecoin' },
  TOSHI: { volatility: 0.95, category: 'memecoin' },
  DEGEN: { volatility: 0.96, category: 'memecoin' },
  HIGHER: { volatility: 0.94, category: 'memecoin' },
  PEPE: { volatility: 0.95, category: 'memecoin' },
  WIF: { volatility: 0.96, category: 'memecoin' },
  BONK: { volatility: 0.95, category: 'memecoin' },
  
  // AI Tokens - High volatility (0.82-0.88)
  RENDER: { volatility: 0.82, category: 'ai' },
  FET: { volatility: 0.85, category: 'ai' },
};

// DEFAULT for unknown tokens - assume HIGH RISK
// This prevents the bug where unknown tokens = 0 risk
const DEFAULT_METADATA: { volatility: number; category: RiskCategory } = { 
  volatility: 0.92, 
  category: 'unknown' 
};

/**
 * Get asset metadata with fallback to default (high risk)
 */
function getAssetMetadata(symbol: string): { volatility: number; category: RiskCategory } {
  return ASSET_METADATA[symbol] || DEFAULT_METADATA;
}

/**
 * Calculate portfolio risk score (1-10)
 * Higher score = higher risk
 */
export function calculateRiskScore(allocations: Allocation[]): number {
  if (allocations.length === 0) return 1;
  
  let weightedVolatility = 0;
  
  for (const { symbol, percentage } of allocations) {
    // Use getAssetMetadata which returns DEFAULT_METADATA for unknown tokens
    const meta = getAssetMetadata(symbol);
    weightedVolatility += meta.volatility * (percentage / 100);
  }
  
  // Scale to 1-10 (volatility 0.0 = 1, volatility 1.0 = 10)
  return Math.min(10, Math.max(1, Math.round(weightedVolatility * 9 + 1)));
}

/**
 * Calculate diversification score (1-10)
 * Higher score = better diversification
 * 
 * Penalizes:
 * - All assets in same category (especially memecoins)
 * - High concentration in one asset
 * - Lack of stablecoin hedge in high-risk portfolios
 */
export function calculateDiversificationScore(allocations: Allocation[]): number {
  if (allocations.length === 0) return 1;
  if (allocations.length === 1) return 2;
  
  // Check category distribution
  const categoryWeights: Record<string, number> = {};
  let memecoinWeight = 0;
  let hasStablecoin = false;
  
  for (const { symbol, percentage } of allocations) {
    const meta = getAssetMetadata(symbol);
    const category = meta.category;
    categoryWeights[category] = (categoryWeights[category] || 0) + percentage;
    
    // Track memecoin exposure
    if (category === 'memecoin') {
      memecoinWeight += percentage;
    }
    if (category === 'stablecoin') {
      hasStablecoin = true;
    }
  }
  
  const categories = Object.keys(categoryWeights);
  const uniqueCategories = categories.length;
  
  // Calculate concentration (how evenly distributed across categories)
  const evenDistribution = 100 / uniqueCategories;
  let deviationSum = 0;
  for (const weight of Object.values(categoryWeights)) {
    deviationSum += Math.abs(weight - evenDistribution);
  }
  
  // Base score from variety
  let score = 5; // Start at middle
  
  // Bonus for more unique categories
  score += (uniqueCategories - 1) * 1.5;
  
  // Penalty for poor distribution
  score -= deviationSum / 40;
  
  // HEAVY penalty for all-memecoin portfolios
  if (memecoinWeight >= 100) {
    score -= 4; // All memecoins = poor diversification
  } else if (memecoinWeight >= 66) {
    score -= 2; // 2/3+ memecoins = low diversification
  }
  
  // Bonus for having stablecoin hedge in volatile portfolio
  if (hasStablecoin && memecoinWeight > 0) {
    score += 1;
  }
  
  return Math.min(10, Math.max(1, Math.round(score)));
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
    const meta = getAssetMetadata(symbol);
    
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
        riskImpact: meta.volatility > 0.7 ? 'higher' : 'neutral',
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
        riskImpact: meta.volatility < 0.5 ? 'lower' : 'neutral',
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
        .filter(a => getAssetMetadata(a.symbol).volatility > 0.5)
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
  
  // Rule 6: Memecoin risk warning
  const totalMemecoin = allocations
    .filter(a => getAssetMetadata(a.symbol).category === 'memecoin')
    .reduce((sum, a) => sum + a.percentage, 0);
  
  if (totalMemecoin >= 66 && !currentMap.has('USDC') && !currentMap.has('USDT')) {
    suggestions.push({
      id: 'memecoin_hedge',
      type: 'add',
      asset: 'USDC',
      currentAllocation: 0,
      suggestedAllocation: 15,
      reasoning: `${totalMemecoin}% in memecoins is extremely risky. Consider adding a stablecoin hedge.`,
      confidence: 0.85,
      riskImpact: 'lower',
    });
  }
  
  // Rule 7: Suggest blue chips if no stability
  const hasBlueChip = allocations.some(a => {
    const cat = getAssetMetadata(a.symbol).category;
    return cat === 'blue-chip' || cat === 'stablecoin';
  });
  
  if (!hasBlueChip && totalMemecoin > 50) {
    suggestions.push({
      id: 'add_stability',
      type: 'add',
      asset: 'ETH',
      currentAllocation: 0,
      suggestedAllocation: 20,
      reasoning: 'No blue-chip exposure. Consider adding ETH for portfolio stability.',
      confidence: 0.80,
      riskImpact: 'lower',
    });
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
  
  // Calculate memecoin exposure for specific warnings
  let memecoinPercentage = 0;
  let memecoinCount = 0;
  for (const { symbol, percentage } of allocations) {
    const meta = getAssetMetadata(symbol);
    if (meta.category === 'memecoin') {
      memecoinPercentage += percentage;
      memecoinCount++;
    }
  }
  
  // Memecoin-specific warnings (highest priority)
  if (memecoinPercentage >= 100) {
    insights.push('🎰 100% memecoin exposure - EXTREME volatility expected');
  } else if (memecoinPercentage >= 66) {
    insights.push('⚠️ Heavy memecoin allocation - high risk of major swings');
  } else if (memecoinPercentage >= 33) {
    insights.push('🎲 Significant memecoin exposure - expect high volatility');
  }
  
  // Risk level insights
  if (riskScore >= 9) {
    insights.push('🔥 Maximum risk portfolio - potential for huge gains OR losses');
  } else if (riskScore >= 7) {
    insights.push('⚠️ High risk portfolio - consider adding stability');
  } else if (riskScore <= 2) {
    insights.push('🛡️ Very conservative portfolio - lower upside potential');
  } else if (riskScore <= 4) {
    insights.push('🛡️ Conservative portfolio - lower upside potential');
  }
  
  // Diversification insights
  if (diversificationScore <= 3) {
    insights.push('📊 Very low diversification - all eggs in one basket');
  } else if (diversificationScore <= 5) {
    insights.push('📊 Low diversification - consider spreading risk');
  } else if (diversificationScore >= 8) {
    insights.push('✅ Well-diversified portfolio');
  }
  
  // Momentum insights
  if (momentumAlignment > 0.3) {
    insights.push('📈 Aligned with current momentum');
  } else if (momentumAlignment < -0.3) {
    insights.push('📉 Against current momentum - contrarian play');
  }
  
  // Similarity insights
  if (popularityScore > 0.7) {
    insights.push('👥 Similar to top performers');
  } else if (popularityScore < 0.3 && memecoinCount === 0) {
    insights.push('🎯 Unique strategy - high variance');
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



