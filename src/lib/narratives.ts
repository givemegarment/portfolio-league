/**
 * DeFi Narrative Categorization for Imitatio
 * 
 * Defines the narrative categories that Masters can be classified into
 * based on their portfolio composition and trading behavior.
 */

export type NarrativeType =
  | 'yield_farming'      // DeFi Blue Chips, Yield strategies
  | 'nft_trading'        // NFT collectors and traders
  | 'memecoin'           // Meme token specialists
  | 'l2_ecosystem'       // L2 chain focused strategies
  | 'rwa_stables'        // Real World Assets & Stablecoins
  | 'degen'              // High risk, high reward plays
  | 'ai_depin'           // AI and DePIN focused
  | 'blue_chip'          // Major crypto holdings
  | 'multi_chain';       // Cross-chain strategies

export type Narrative = {
  id: NarrativeType;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  typicalAssets: string[];
};

/**
 * Narrative definitions
 */
export const NARRATIVES: Record<NarrativeType, Narrative> = {
  yield_farming: {
    id: 'yield_farming',
    name: 'Yield Farming',
    shortName: 'Yield',
    description: 'DeFi protocols, liquidity provision, and yield optimization strategies',
    icon: '🌾',
    color: '#10B981',
    riskLevel: 'medium',
    typicalAssets: ['AAVE', 'UNI', 'CRV', 'MKR', 'LINK', 'AERO'],
  },
  nft_trading: {
    id: 'nft_trading',
    name: 'NFT Trading',
    shortName: 'NFT',
    description: 'NFT collection strategies and blue-chip NFT exposure',
    icon: '🖼️',
    color: '#8B5CF6',
    riskLevel: 'high',
    typicalAssets: ['ETH', 'BLUR', 'APE'],
  },
  memecoin: {
    id: 'memecoin',
    name: 'Memecoin Alpha',
    shortName: 'Meme',
    description: 'Meme token specialists with high-risk, high-reward strategies',
    icon: '🐸',
    color: '#4ADE80',
    riskLevel: 'extreme',
    typicalAssets: ['PEPE', 'WIF', 'BONK', 'DEGEN', 'BRETT', 'TOSHI', 'HIGHER'],
  },
  l2_ecosystem: {
    id: 'l2_ecosystem',
    name: 'L2 Ecosystem',
    shortName: 'L2',
    description: 'Focus on Layer 2 scaling solutions and their native tokens',
    icon: '⚡',
    color: '#0052FF',
    riskLevel: 'medium',
    typicalAssets: ['OP', 'ARB', 'POL', 'AERO'],
  },
  rwa_stables: {
    id: 'rwa_stables',
    name: 'RWA & Stables',
    shortName: 'RWA',
    description: 'Conservative strategies with stablecoins and real-world assets',
    icon: '🏦',
    color: '#3B82F6',
    riskLevel: 'low',
    typicalAssets: ['USDC', 'USDT', 'DAI', 'MKR'],
  },
  degen: {
    id: 'degen',
    name: 'Degen Plays',
    shortName: 'Degen',
    description: 'High-risk strategies with leveraged or volatile positions',
    icon: '🎰',
    color: '#F97316',
    riskLevel: 'extreme',
    typicalAssets: ['PEPE', 'WIF', 'BONK', 'DEGEN'],
  },
  ai_depin: {
    id: 'ai_depin',
    name: 'AI & DePIN',
    shortName: 'AI',
    description: 'Artificial intelligence and decentralized infrastructure plays',
    icon: '🤖',
    color: '#06B6D4',
    riskLevel: 'high',
    typicalAssets: ['RENDER', 'FET', 'NEAR'],
  },
  blue_chip: {
    id: 'blue_chip',
    name: 'Blue Chip Crypto',
    shortName: 'Blue Chip',
    description: 'Major cryptocurrency holdings with established track records',
    icon: '💎',
    color: '#F7931A',
    riskLevel: 'medium',
    typicalAssets: ['BTC', 'ETH', 'SOL'],
  },
  multi_chain: {
    id: 'multi_chain',
    name: 'Multi-Chain',
    shortName: 'Multi',
    description: 'Cross-chain strategies across multiple ecosystems',
    icon: '🌐',
    color: '#A855F7',
    riskLevel: 'medium',
    typicalAssets: ['ETH', 'SOL', 'AVAX', 'NEAR', 'SUI', 'APT', 'INJ'],
  },
};

/**
 * Get narrative by ID
 */
export function getNarrative(id: NarrativeType): Narrative {
  return NARRATIVES[id];
}

/**
 * Get all narratives
 */
export function getAllNarratives(): Narrative[] {
  return Object.values(NARRATIVES);
}

/**
 * Auto-detect narrative from portfolio holdings
 * Returns the primary narrative based on asset composition
 */
export function detectNarrative(holdings: { symbol: string; percentage: number }[]): NarrativeType {
  const narrativeScores: Record<NarrativeType, number> = {
    yield_farming: 0,
    nft_trading: 0,
    memecoin: 0,
    l2_ecosystem: 0,
    rwa_stables: 0,
    degen: 0,
    ai_depin: 0,
    blue_chip: 0,
    multi_chain: 0,
  };

  for (const holding of holdings) {
    const { symbol, percentage } = holding;
    
    // Score each narrative based on typical assets
    for (const [narrativeId, narrative] of Object.entries(NARRATIVES)) {
      if (narrative.typicalAssets.includes(symbol)) {
        narrativeScores[narrativeId as NarrativeType] += percentage;
      }
    }
  }

  // Find the narrative with highest score
  let maxScore = 0;
  let detectedNarrative: NarrativeType = 'blue_chip';

  for (const [narrativeId, score] of Object.entries(narrativeScores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedNarrative = narrativeId as NarrativeType;
    }
  }

  // If holdings span many categories, classify as multi-chain
  const narrativesWithScore = Object.values(narrativeScores).filter(s => s > 0).length;
  if (narrativesWithScore >= 3 && maxScore < 50) {
    detectedNarrative = 'multi_chain';
  }

  return detectedNarrative;
}

/**
 * Get risk level color
 */
export function getRiskLevelColor(level: Narrative['riskLevel']): string {
  switch (level) {
    case 'low':
      return '#10B981';
    case 'medium':
      return '#F59E0B';
    case 'high':
      return '#F97316';
    case 'extreme':
      return '#EF4444';
  }
}

/**
 * Get risk level label
 */
export function getRiskLevelLabel(level: Narrative['riskLevel']): string {
  switch (level) {
    case 'low':
      return 'Conservative';
    case 'medium':
      return 'Moderate';
    case 'high':
      return 'Aggressive';
    case 'extreme':
      return 'Degen';
  }
}

/**
 * Get narratives sorted by risk level
 */
export function getNarrativesByRisk(): Narrative[] {
  const riskOrder = { low: 0, medium: 1, high: 2, extreme: 3 };
  return getAllNarratives().sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);
}




