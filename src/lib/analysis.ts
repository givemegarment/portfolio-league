/**
 * Portfolio Analysis Utilities
 *
 * Comprehensive analysis functions for portfolio evaluation
 */

import { AllocationItem } from './scoring';
import { ASSET_CATEGORIES, getAsset } from './assets';

// ============ Types ============

export type PortfolioNarrative =
  | 'blue-chip'      // BTC/ETH heavy
  | 'degen'          // Meme-heavy
  | 'defi-maxi'      // DeFi protocols
  | 'l2-believer'    // L2 ecosystem
  | 'ai-bull'        // AI tokens
  | 'base-native'    // Base ecosystem focus
  | 'hedged'         // Has stables
  | 'balanced'       // Mixed bag
  | 'alt-l1'         // Alternative L1s
  | 'momentum';      // High-volatility plays

export type CategoryBreakdown = {
  category: string;
  percentage: number;
  assets: string[];
  color: string;
};

export type RiskGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export type PortfolioInsight = {
  type: 'positive' | 'warning' | 'suggestion';
  title: string;
  description: string;
};

export type ScenarioResult = {
  scenario: string;
  portfolioReturn: number;
  btcReturn: number;
  ethReturn: number;
  outperforms: boolean;
};

export type FullAnalysis = {
  narrative: PortfolioNarrative;
  narrativeLabel: string;
  narrativeEmoji: string;
  categoryBreakdown: CategoryBreakdown[];
  riskGrade: RiskGrade;
  riskScore: number; // 0-100
  volatilityEstimate: number;
  insights: PortfolioInsight[];
  benchmarkComparison: {
    vsBTC: number;
    vsETH: number;
    vs5050: number;
  };
  scenarios: ScenarioResult[];
};

// ============ Category Analysis ============

const CATEGORY_COLORS: Record<string, string> = {
  'Majors': '#F7931A',
  'Stablecoins': '#26A17B',
  'Base Ecosystem': '#0052FF',
  'L2 Tokens': '#FF0420',
  'DeFi': '#FF007A',
  'AI & Meme': '#9945FF',
  'Alt L1s': '#E84142',
};

export function getCategoryBreakdown(allocations: AllocationItem[]): CategoryBreakdown[] {
  const categoryMap = new Map<string, { percentage: number; assets: string[] }>();

  for (const alloc of allocations) {
    // Find which category this asset belongs to
    for (const [category, symbols] of Object.entries(ASSET_CATEGORIES)) {
      if (category === 'All') continue;
      if ((symbols as readonly string[]).includes(alloc.symbol)) {
        const existing = categoryMap.get(category) || { percentage: 0, assets: [] };
        existing.percentage += alloc.percentage;
        existing.assets.push(alloc.symbol);
        categoryMap.set(category, existing);
        break;
      }
    }
  }

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      percentage: Math.round(data.percentage * 10) / 10,
      assets: data.assets,
      color: CATEGORY_COLORS[category] || '#6366F1',
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

// ============ Narrative Detection ============

const NARRATIVE_CONFIG: Record<PortfolioNarrative, { label: string; emoji: string }> = {
  'blue-chip': { label: 'Blue Chip Believer', emoji: '🏦' },
  'degen': { label: 'Full Degen', emoji: '🎰' },
  'defi-maxi': { label: 'DeFi Maximalist', emoji: '🦄' },
  'l2-believer': { label: 'L2 Believer', emoji: '⚡' },
  'ai-bull': { label: 'AI Bull', emoji: '🤖' },
  'base-native': { label: 'Base Native', emoji: '🔵' },
  'hedged': { label: 'Hedged Player', emoji: '🛡️' },
  'balanced': { label: 'Balanced Builder', emoji: '⚖️' },
  'alt-l1': { label: 'Alt L1 Explorer', emoji: '🌐' },
  'momentum': { label: 'Momentum Chaser', emoji: '🚀' },
};

export function detectNarrative(allocations: AllocationItem[]): PortfolioNarrative {
  const breakdown = getCategoryBreakdown(allocations);
  const categoryPercentages = Object.fromEntries(
    breakdown.map(b => [b.category, b.percentage])
  );

  const majors = categoryPercentages['Majors'] || 0;
  const stables = categoryPercentages['Stablecoins'] || 0;
  const base = categoryPercentages['Base Ecosystem'] || 0;
  const l2 = categoryPercentages['L2 Tokens'] || 0;
  const defi = categoryPercentages['DeFi'] || 0;
  const aiMeme = categoryPercentages['AI & Meme'] || 0;
  const altL1 = categoryPercentages['Alt L1s'] || 0;

  // Check for dominant narratives
  if (majors >= 70) return 'blue-chip';
  if (aiMeme >= 50) return 'degen';
  if (defi >= 50) return 'defi-maxi';
  if (l2 >= 40) return 'l2-believer';
  if (base >= 40) return 'base-native';
  if (altL1 >= 40) return 'alt-l1';
  if (stables >= 30) return 'hedged';
  if (aiMeme >= 30 && majors < 30) return 'momentum';

  // Check for AI-specific allocation
  const aiTokens = ['RENDER', 'FET'];
  const aiAllocation = allocations
    .filter(a => aiTokens.includes(a.symbol))
    .reduce((sum, a) => sum + a.percentage, 0);
  if (aiAllocation >= 30) return 'ai-bull';

  return 'balanced';
}

export function getNarrativeConfig(narrative: PortfolioNarrative) {
  return NARRATIVE_CONFIG[narrative];
}

// ============ Risk Scoring ============

// Volatility estimates (annualized, rough estimates)
const ASSET_VOLATILITY: Record<string, number> = {
  // Stables
  USDC: 0.5, USDT: 0.5, DAI: 0.5,
  // Majors
  BTC: 45, ETH: 55, SOL: 75,
  // L2
  OP: 80, ARB: 80, POL: 70,
  // DeFi
  LINK: 65, UNI: 75, AAVE: 70, MKR: 65, CRV: 85,
  // Base
  AERO: 120, DEGEN: 150, BRETT: 150, TOSHI: 140, HIGHER: 140,
  // Memes
  PEPE: 160, WIF: 170, BONK: 160,
  // AI
  RENDER: 90, FET: 95,
  // Alt L1s
  AVAX: 70, NEAR: 80, INJ: 90, SUI: 85, APT: 80,
};

export function estimatePortfolioVolatility(allocations: AllocationItem[]): number {
  let weightedVol = 0;

  for (const alloc of allocations) {
    const vol = ASSET_VOLATILITY[alloc.symbol] || 80;
    weightedVol += vol * (alloc.percentage / 100);
  }

  // Apply diversification benefit (rough estimate)
  const diversificationFactor = Math.max(0.7, 1 - (allocations.length - 1) * 0.05);

  return Math.round(weightedVol * diversificationFactor);
}

export function calculateRiskScore(allocations: AllocationItem[]): number {
  const volatility = estimatePortfolioVolatility(allocations);

  // Normalize to 0-100 scale
  // 0 vol = 100 score (safe), 150+ vol = 0 score (extreme risk)
  const score = Math.max(0, Math.min(100, 100 - (volatility / 1.5)));

  return Math.round(score);
}

export function getRiskGrade(riskScore: number): RiskGrade {
  if (riskScore >= 80) return 'A';
  if (riskScore >= 60) return 'B';
  if (riskScore >= 40) return 'C';
  if (riskScore >= 20) return 'D';
  return 'F';
}

export function getRiskGradeColor(grade: RiskGrade): string {
  switch (grade) {
    case 'A': return '#10B981';
    case 'B': return '#22C55E';
    case 'C': return '#F59E0B';
    case 'D': return '#F97316';
    case 'F': return '#EF4444';
  }
}

// ============ Insights Generation ============

export function generateInsights(
  allocations: AllocationItem[],
  categoryBreakdown: CategoryBreakdown[],
  riskScore: number,
  narrative: PortfolioNarrative
): PortfolioInsight[] {
  const insights: PortfolioInsight[] = [];

  // Check concentration
  const topAllocation = Math.max(...allocations.map(a => a.percentage));
  if (topAllocation > 60) {
    insights.push({
      type: 'warning',
      title: 'High Concentration',
      description: `${topAllocation}% in one asset. Consider diversifying to reduce single-asset risk.`,
    });
  }

  // Check for no stables
  const hasStables = allocations.some(a => ['USDC', 'USDT', 'DAI'].includes(a.symbol));
  if (!hasStables && riskScore < 50) {
    insights.push({
      type: 'suggestion',
      title: 'No Hedge Position',
      description: 'Adding 10-20% stables can protect gains during volatility.',
    });
  }

  // Meme concentration warning
  const memeAllocation = categoryBreakdown.find(c => c.category === 'AI & Meme')?.percentage || 0;
  if (memeAllocation > 50) {
    insights.push({
      type: 'warning',
      title: 'High Meme Exposure',
      description: 'Over 50% in volatile meme coins. High risk/reward profile.',
    });
  }

  // Good diversification
  if (allocations.length >= 3 && topAllocation <= 40) {
    insights.push({
      type: 'positive',
      title: 'Well Diversified',
      description: 'Good spread across multiple assets reduces concentration risk.',
    });
  }

  // Blue chip anchor
  const majorAllocation = categoryBreakdown.find(c => c.category === 'Majors')?.percentage || 0;
  if (majorAllocation >= 30 && majorAllocation < 70) {
    insights.push({
      type: 'positive',
      title: 'Solid Foundation',
      description: 'BTC/ETH/SOL provide stability while leaving room for alpha.',
    });
  }

  // Base ecosystem play
  const baseAllocation = categoryBreakdown.find(c => c.category === 'Base Ecosystem')?.percentage || 0;
  if (baseAllocation >= 20) {
    insights.push({
      type: 'positive',
      title: 'Base Native Play',
      description: 'Positioned for Base ecosystem growth with native tokens.',
    });
  }

  // Risk score insights
  if (riskScore >= 70) {
    insights.push({
      type: 'positive',
      title: 'Conservative Profile',
      description: 'Lower volatility portfolio suited for steady gains.',
    });
  } else if (riskScore < 30) {
    insights.push({
      type: 'warning',
      title: 'Extreme Risk Profile',
      description: 'Very high volatility. Prepare for significant swings.',
    });
  }

  return insights.slice(0, 4); // Max 4 insights
}

// ============ Scenario Testing ============

// Historical scenario multipliers (rough estimates)
const SCENARIOS: Record<string, Record<string, number>> = {
  'Bull Run (+30% BTC)': {
    BTC: 1.30, ETH: 1.40, SOL: 1.60,
    USDC: 1.0, USDT: 1.0, DAI: 1.0,
    AERO: 1.80, DEGEN: 2.20, BRETT: 2.00, TOSHI: 1.90, HIGHER: 2.10,
    OP: 1.50, ARB: 1.55, POL: 1.45,
    LINK: 1.35, UNI: 1.45, AAVE: 1.40, MKR: 1.35, CRV: 1.50,
    PEPE: 2.50, WIF: 2.80, BONK: 2.40,
    RENDER: 1.70, FET: 1.75,
    AVAX: 1.50, NEAR: 1.55, INJ: 1.60, SUI: 1.65, APT: 1.55,
  },
  'Bear Drop (-25% BTC)': {
    BTC: 0.75, ETH: 0.70, SOL: 0.60,
    USDC: 1.0, USDT: 1.0, DAI: 1.0,
    AERO: 0.50, DEGEN: 0.40, BRETT: 0.45, TOSHI: 0.45, HIGHER: 0.42,
    OP: 0.60, ARB: 0.58, POL: 0.62,
    LINK: 0.65, UNI: 0.60, AAVE: 0.62, MKR: 0.65, CRV: 0.55,
    PEPE: 0.35, WIF: 0.30, BONK: 0.35,
    RENDER: 0.55, FET: 0.52,
    AVAX: 0.60, NEAR: 0.58, INJ: 0.55, SUI: 0.55, APT: 0.58,
  },
  'ETH Flip (ETH +50%)': {
    BTC: 1.05, ETH: 1.50, SOL: 1.30,
    USDC: 1.0, USDT: 1.0, DAI: 1.0,
    AERO: 1.40, DEGEN: 1.35, BRETT: 1.30, TOSHI: 1.32, HIGHER: 1.35,
    OP: 1.55, ARB: 1.50, POL: 1.45,
    LINK: 1.30, UNI: 1.60, AAVE: 1.55, MKR: 1.45, CRV: 1.50,
    PEPE: 1.40, WIF: 1.35, BONK: 1.38,
    RENDER: 1.35, FET: 1.40,
    AVAX: 1.25, NEAR: 1.30, INJ: 1.35, SUI: 1.38, APT: 1.32,
  },
  'Meme Season (PEPE 3x)': {
    BTC: 1.10, ETH: 1.15, SOL: 1.40,
    USDC: 1.0, USDT: 1.0, DAI: 1.0,
    AERO: 1.60, DEGEN: 2.80, BRETT: 2.50, TOSHI: 2.40, HIGHER: 2.60,
    OP: 1.20, ARB: 1.18, POL: 1.15,
    LINK: 1.12, UNI: 1.18, AAVE: 1.15, MKR: 1.10, CRV: 1.20,
    PEPE: 3.00, WIF: 3.20, BONK: 2.90,
    RENDER: 1.30, FET: 1.25,
    AVAX: 1.18, NEAR: 1.22, INJ: 1.25, SUI: 1.28, APT: 1.20,
  },
};

export function runScenarios(allocations: AllocationItem[]): ScenarioResult[] {
  return Object.entries(SCENARIOS).map(([name, multipliers]) => {
    let portfolioValue = 0;

    for (const alloc of allocations) {
      const multiplier = multipliers[alloc.symbol] || 1.0;
      portfolioValue += alloc.percentage * multiplier;
    }

    const portfolioReturn = ((portfolioValue / 100) - 1) * 100;
    const btcReturn = ((multipliers['BTC'] || 1) - 1) * 100;
    const ethReturn = ((multipliers['ETH'] || 1) - 1) * 100;

    return {
      scenario: name,
      portfolioReturn: Math.round(portfolioReturn * 10) / 10,
      btcReturn: Math.round(btcReturn * 10) / 10,
      ethReturn: Math.round(ethReturn * 10) / 10,
      outperforms: portfolioReturn > btcReturn,
    };
  });
}

// ============ Benchmark Comparison ============

export function calculateBenchmarkComparison(
  portfolioReturn: number,
  btcReturn: number,
  ethReturn: number
): { vsBTC: number; vsETH: number; vs5050: number } {
  const fiftyFiftyReturn = (btcReturn + ethReturn) / 2;

  return {
    vsBTC: Math.round((portfolioReturn - btcReturn) * 100) / 100,
    vsETH: Math.round((portfolioReturn - ethReturn) * 100) / 100,
    vs5050: Math.round((portfolioReturn - fiftyFiftyReturn) * 100) / 100,
  };
}

// ============ Full Analysis ============

export function analyzePortfolio(
  allocations: AllocationItem[],
  currentReturn: number = 0,
  btcReturn: number = 0,
  ethReturn: number = 0
): FullAnalysis {
  const categoryBreakdown = getCategoryBreakdown(allocations);
  const narrative = detectNarrative(allocations);
  const { label, emoji } = getNarrativeConfig(narrative);
  const riskScore = calculateRiskScore(allocations);
  const riskGrade = getRiskGrade(riskScore);
  const volatility = estimatePortfolioVolatility(allocations);
  const insights = generateInsights(allocations, categoryBreakdown, riskScore, narrative);
  const scenarios = runScenarios(allocations);
  const benchmarkComparison = calculateBenchmarkComparison(currentReturn, btcReturn, ethReturn);

  return {
    narrative,
    narrativeLabel: label,
    narrativeEmoji: emoji,
    categoryBreakdown,
    riskGrade,
    riskScore,
    volatilityEstimate: volatility,
    insights,
    benchmarkComparison,
    scenarios,
  };
}
