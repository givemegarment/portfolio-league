export type Asset = 'BTC' | 'ETH' | 'SOL' | 'USDC_YIELD';

export interface AssetAllocation {
  asset: Asset;
  percentage: number; // 0-100
}

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

export interface UserStats {
  totalSeasons: number;
  wins: number;
  topDecileFinishes: number;
  bestRank: number;
  bestReturns: number;
  averageReturns: number;
  badges: SeasonBadge[];
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
