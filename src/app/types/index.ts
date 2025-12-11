export type Asset = 'BTC' | 'ETH' | 'SOL' | 'USDC_YIELD';

export interface AssetAllocation {
  asset: Asset;
  percentage: number; // 0-100
}

// Legacy type - use Strategy instead
export interface Portfolio {
  id: string;
  userId: string;
  leagueId: string;
  allocations: AssetAllocation[];
  submittedAt: number;
  initialValue: number;
  currentValue: number;
  returns: number;
  rank?: number;
}

// New Imitatio types
export interface Strategy {
  id: string;
  scholarId: string;
  chamberId: string;
  masterAddress: string;
  allocations: AssetAllocation[];
  submittedAt: number;
  initialValue: number;
  currentValue: number;
  returns: number;
  fidelityScore: number;
  adaptationScore: number;
  rank?: number;
}

export interface Master {
  address: string;
  alias?: string;
  category: 'defi' | 'nft' | 'yield' | 'momentum' | 'general';
  performance30d: number;
  performance7d: number;
  followers: number;
  currentHoldings: AssetAllocation[];
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  verified: boolean;
}

export interface Emulation {
  id: string;
  scholarId: string;
  masterAddress: string;
  epochId: string;
  strategy: AssetAllocation[];
  fidelityScore: number;
  adaptationScore: number;
  timingScore: number;
  finalScore: number;
  submittedAt: number;
}

// Legacy type - use Chamber instead
export interface League {
  id: string;
  season: number;
  startTime: number;
  endTime: number;
  status: 'upcoming' | 'active' | 'completed';
  prizePool: number;
  participants: number;
  topDecileThreshold: number;
}

export interface Chamber {
  id: string;
  epoch: number;
  startTime: number;
  endTime: number;
  status: 'upcoming' | 'active' | 'completed';
  treasury: number;
  scholars: number;
  topDecileThreshold: number;
  isPrivate: boolean;
  inviteCode?: string;
}

export interface ScholarEntry {
  rank: number;
  scholarId: string;
  scholarAddress: string;
  masterAddress: string;
  returns: number;
  adaptationScore: number;
  strategy: Strategy;
  title: ScholarTitle;
  isWinner: boolean;
}

export type ScholarTitle = 'Novice' | 'Apprentice' | 'Journeyman' | 'Master';

// Legacy type - use ScholarEntry instead
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  returns: number;
  portfolio: Portfolio;
  isWinner: boolean;
}

export interface PriceData {
  asset: Asset;
  price: number;
  timestamp: number;
  change24h: number;
}

// Legacy type - use ScholarBadge instead
export interface SeasonBadge {
  tokenId: number;
  season: number;
  userId: string;
  rank: number;
  returns: number;
  mintedAt: number;
  metadata: {
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
}

export interface ScholarBadge {
  tokenId: number;
  epoch: number;
  scholarId: string;
  title: ScholarTitle;
  rank: number;
  adaptationScore: number;
  returns: number;
  masterStudied: string;
  mintedAt: number;
  metadata: {
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
}

export interface ScholarStats {
  totalEpochs: number;
  wins: number;
  topDecileFinishes: number;
  timesBeatMaster: number;
  bestRank: number;
  bestAdaptationScore: number;
  bestReturns: number;
  averageReturns: number;
  currentTitle: ScholarTitle;
  badges: ScholarBadge[];
}

// Legacy type - use ScholarStats instead
export interface UserStats {
  totalSeasons: number;
  wins: number;
  topDecileFinishes: number;
  bestRank: number;
  bestReturns: number;
  averageReturns: number;
  badges: SeasonBadge[];
}

export interface MasterActivity {
  address: string;
  timestamp: number;
  type: 'swap' | 'stake' | 'unstake' | 'bridge' | 'lp_add' | 'lp_remove' | 'transfer';
  fromAsset?: Asset;
  toAsset?: Asset;
  amount: number;
  txHash: string;
}

export interface EpochAnalysis {
  epochId: string;
  totalScholars: number;
  averageAdaptationScore: number;
  scholarsBeatMaster: number;
  topStrategies: Strategy[];
  lessons: string[];
}

export interface FrameMetadata {
  title: string;
  image: string;
  buttons: Array<{
    label: string;
    action: string;
  }>;
  postUrl: string;
}
