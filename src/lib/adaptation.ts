/**
 * Adaptation Scoring System for Imitatio
 * 
 * Measures how well a user's portfolio adapts a Master's strategy
 * and tracks performance relative to the Master.
 */

import { MasterHolding, Master } from './masters';
import { AllocationItem, ScoreResult, calculateScore, StoredPortfolio, PriceData } from './scoring';

export type AdaptationMetrics = {
  similarityScore: number;      // 0-100: How close to Master's allocation
  deviationScore: number;       // 0-100: Strategic deviation (can be intentional)
  performanceVsMaster: number;  // % difference in returns
  riskAdjustedAlpha: number;    // Outperformance adjusted for risk
  adaptationType: AdaptationType;
};

export type AdaptationType = 
  | 'mirror'      // Near-identical to Master
  | 'inspired'    // Similar structure with tweaks
  | 'variant'     // Significant deviation
  | 'original';   // Mostly different

export type EmulationEntry = {
  id: string;
  userAddress: string;
  masterAddress: string;
  masterName: string;
  userAllocations: AllocationItem[];
  masterAllocations: AllocationItem[];
  entryPrices: Record<string, number>;
  createdAt: number;
  competitionType: string;
  competitionPeriod: string;
};

export type EmulationResult = EmulationEntry & {
  userScore: number;
  masterScore: number;
  adaptationMetrics: AdaptationMetrics;
  finalRank?: number;
};

// ============ Similarity Calculations ============

/**
 * Calculate similarity score between user portfolio and Master portfolio
 * Uses cosine similarity on allocation vectors
 */
export function calculateSimilarityScore(
  userAllocations: AllocationItem[],
  masterHoldings: MasterHolding[]
): number {
  // Get all unique symbols
  const allSymbols = Array.from(new Set([
    ...userAllocations.map(a => a.symbol),
    ...masterHoldings.map(h => h.symbol),
  ]));

  // Create allocation vectors
  const userVector: number[] = [];
  const masterVector: number[] = [];

  for (const symbol of allSymbols) {
    const userAlloc = userAllocations.find(a => a.symbol === symbol)?.percentage || 0;
    const masterAlloc = masterHoldings.find(h => h.symbol === symbol)?.percentage || 0;
    userVector.push(userAlloc);
    masterVector.push(masterAlloc);
  }

  // Calculate cosine similarity
  const dotProduct = userVector.reduce((sum, val, i) => sum + val * masterVector[i], 0);
  const userMagnitude = Math.sqrt(userVector.reduce((sum, val) => sum + val * val, 0));
  const masterMagnitude = Math.sqrt(masterVector.reduce((sum, val) => sum + val * val, 0));

  if (userMagnitude === 0 || masterMagnitude === 0) return 0;

  const cosineSimilarity = dotProduct / (userMagnitude * masterMagnitude);
  
  // Convert to 0-100 scale
  return Math.round(cosineSimilarity * 100);
}

/**
 * Calculate deviation score (inverse of similarity but weighted differently)
 * High deviation isn't necessarily bad - it could indicate strategic adaptation
 */
export function calculateDeviationScore(
  userAllocations: AllocationItem[],
  masterHoldings: MasterHolding[]
): number {
  let totalDeviation = 0;
  let overlapCount = 0;

  // Check user's allocations against master
  for (const userAlloc of userAllocations) {
    const masterHolding = masterHoldings.find(h => h.symbol === userAlloc.symbol);
    if (masterHolding) {
      const diff = Math.abs(userAlloc.percentage - masterHolding.percentage);
      totalDeviation += diff;
      overlapCount++;
    } else {
      // Asset not in Master's portfolio - full deviation
      totalDeviation += userAlloc.percentage;
    }
  }

  // Check master's allocations not in user's
  for (const masterHolding of masterHoldings) {
    const userAlloc = userAllocations.find(a => a.symbol === masterHolding.symbol);
    if (!userAlloc) {
      totalDeviation += masterHolding.percentage;
    }
  }

  // Normalize: max possible deviation is 200 (completely different portfolios)
  const normalizedDeviation = Math.min(totalDeviation / 200, 1);
  
  return Math.round(normalizedDeviation * 100);
}

/**
 * Determine adaptation type based on similarity score
 */
export function getAdaptationType(similarityScore: number): AdaptationType {
  if (similarityScore >= 90) return 'mirror';
  if (similarityScore >= 70) return 'inspired';
  if (similarityScore >= 40) return 'variant';
  return 'original';
}

/**
 * Get adaptation type display info
 */
export function getAdaptationTypeInfo(type: AdaptationType): {
  name: string;
  description: string;
  color: string;
  icon: string;
} {
  switch (type) {
    case 'mirror':
      return {
        name: 'Mirror',
        description: 'Near-identical to Master strategy',
        color: '#10B981',
        icon: '🪞',
      };
    case 'inspired':
      return {
        name: 'Inspired',
        description: 'Similar structure with personal tweaks',
        color: '#0052FF',
        icon: '💡',
      };
    case 'variant':
      return {
        name: 'Variant',
        description: 'Significant deviation from Master',
        color: '#F59E0B',
        icon: '🔀',
      };
    case 'original':
      return {
        name: 'Original',
        description: 'Mostly independent strategy',
        color: '#9945FF',
        icon: '✨',
      };
  }
}

// ============ Performance Comparison ============

/**
 * Calculate performance comparison between user and Master
 */
export function calculatePerformanceVsMaster(
  userScore: number,
  masterScore: number
): number {
  return userScore - masterScore;
}

/**
 * Calculate risk-adjusted alpha
 * Measures outperformance considering the deviation from Master
 */
export function calculateRiskAdjustedAlpha(
  userScore: number,
  masterScore: number,
  deviationScore: number
): number {
  const rawAlpha = userScore - masterScore;
  
  // Higher deviation should require higher alpha to be considered successful
  // If deviation is low (mirror), small alpha is still meaningful
  // If deviation is high (variant), need larger alpha
  const deviationFactor = 1 + (deviationScore / 200);
  
  return rawAlpha / deviationFactor;
}

/**
 * Calculate complete adaptation metrics
 */
export function calculateAdaptationMetrics(
  userAllocations: AllocationItem[],
  masterHoldings: MasterHolding[],
  userScore: number,
  masterScore: number
): AdaptationMetrics {
  const similarityScore = calculateSimilarityScore(userAllocations, masterHoldings);
  const deviationScore = calculateDeviationScore(userAllocations, masterHoldings);
  const performanceVsMaster = calculatePerformanceVsMaster(userScore, masterScore);
  const riskAdjustedAlpha = calculateRiskAdjustedAlpha(userScore, masterScore, deviationScore);
  const adaptationType = getAdaptationType(similarityScore);

  return {
    similarityScore,
    deviationScore,
    performanceVsMaster,
    riskAdjustedAlpha,
    adaptationType,
  };
}

// ============ Emulation Templates ============

/**
 * Create portfolio template from Master's holdings
 */
export function createEmulationTemplate(master: Master): AllocationItem[] {
  return master.holdings.map(h => ({
    symbol: h.symbol,
    percentage: h.percentage,
  }));
}

/**
 * Adjust template to fit user preferences
 * Allows slight modifications while maintaining Master's general strategy
 */
export function adjustTemplate(
  template: AllocationItem[],
  adjustments: Partial<Record<string, number>>
): AllocationItem[] {
  const adjusted = template.map(item => ({
    ...item,
    percentage: adjustments[item.symbol] ?? item.percentage,
  }));

  // Normalize to 100%
  const total = adjusted.reduce((sum, item) => sum + item.percentage, 0);
  if (total === 0) return adjusted;

  return adjusted.map(item => ({
    ...item,
    percentage: Math.round((item.percentage / total) * 100),
  }));
}

/**
 * Add new asset to template
 */
export function addAssetToTemplate(
  template: AllocationItem[],
  symbol: string,
  percentage: number
): AllocationItem[] {
  // Remove percentage from existing assets proportionally
  const scaleFactor = (100 - percentage) / 100;
  
  const adjusted = template.map(item => ({
    ...item,
    percentage: Math.round(item.percentage * scaleFactor),
  }));

  adjusted.push({ symbol, percentage });

  return adjusted;
}

/**
 * Remove asset from template
 */
export function removeAssetFromTemplate(
  template: AllocationItem[],
  symbol: string
): AllocationItem[] {
  const filtered = template.filter(item => item.symbol !== symbol);
  
  // Normalize remaining to 100%
  const total = filtered.reduce((sum, item) => sum + item.percentage, 0);
  if (total === 0) return filtered;

  return filtered.map(item => ({
    ...item,
    percentage: Math.round((item.percentage / total) * 100),
  }));
}

// ============ League Types ============

export type LeagueType = 
  | 'open'           // Anyone can join
  | 'narrative'      // Specific to a DeFi narrative  
  | 'master-follow'  // All emulating same Master
  | 'risk-tier'      // Grouped by risk tolerance
  | 'invite';        // Private leagues

export type League = {
  id: string;
  name: string;
  type: LeagueType;
  description: string;
  createdBy: string;
  masterAddress?: string;  // For master-follow leagues
  narrative?: string;      // For narrative leagues
  riskTier?: 'conservative' | 'moderate' | 'aggressive'; // For risk-tier leagues
  inviteCode?: string;     // For invite leagues
  playerCount: number;
  prizePool: number;
  startsAt: number;
  endsAt: number;
  createdAt: number;
};

/**
 * Get league type info
 */
export function getLeagueTypeInfo(type: LeagueType): {
  name: string;
  description: string;
  icon: string;
} {
  switch (type) {
    case 'open':
      return {
        name: 'Open League',
        description: 'Anyone can join this competition',
        icon: '🌐',
      };
    case 'narrative':
      return {
        name: 'Narrative League',
        description: 'Competition focused on a specific DeFi narrative',
        icon: '📖',
      };
    case 'master-follow':
      return {
        name: 'Master League',
        description: 'All players emulate the same Master',
        icon: '👑',
      };
    case 'risk-tier':
      return {
        name: 'Risk-Tier League',
        description: 'Players grouped by risk tolerance',
        icon: '📊',
      };
    case 'invite':
      return {
        name: 'Private League',
        description: 'Invite-only competition',
        icon: '🔒',
      };
  }
}

// ============ Scoring Bonuses ============

/**
 * Calculate adaptation bonus for leaderboard
 * Players who successfully adapt Master strategies get bonus points
 */
export function calculateAdaptationBonus(metrics: AdaptationMetrics): number {
  let bonus = 0;

  // Bonus for beating the Master
  if (metrics.performanceVsMaster > 0) {
    bonus += Math.min(metrics.performanceVsMaster * 0.1, 5); // Max 5% bonus
  }

  // Bonus for high similarity + good performance
  if (metrics.similarityScore >= 80 && metrics.performanceVsMaster >= 0) {
    bonus += 2; // 2% bonus for faithful emulation
  }

  // Bonus for creative adaptation that works
  if (metrics.adaptationType === 'variant' && metrics.riskAdjustedAlpha > 0) {
    bonus += 3; // 3% bonus for successful variant
  }

  return bonus;
}




