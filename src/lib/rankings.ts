/**
 * Ranking System for Imitatio
 * 
 * Implements tiered ranking system with season-over-season progression
 */

export type RankTier = 
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'grandmaster';

export type RankDivision = 1 | 2 | 3 | 4;

export type PlayerRank = {
  tier: RankTier;
  division: RankDivision;
  points: number;
  peakTier: RankTier;
  peakDivision: RankDivision;
  seasonWins: number;
  totalWins: number;
  currentStreak: number;
  bestStreak: number;
  lastUpdated: number;
};

export type RankTierInfo = {
  tier: RankTier;
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  backgroundColor: string;
  icon: string;
  description: string;
};

// ============ Rank Tier Configuration ============

export const RANK_TIERS: RankTierInfo[] = [
  {
    tier: 'bronze',
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 499,
    color: '#CD7F32',
    backgroundColor: 'rgba(205, 127, 50, 0.15)',
    icon: '🥉',
    description: 'Beginning your journey',
  },
  {
    tier: 'silver',
    name: 'Silver',
    minPoints: 500,
    maxPoints: 999,
    color: '#C0C0C0',
    backgroundColor: 'rgba(192, 192, 192, 0.15)',
    icon: '🥈',
    description: 'Developing your skills',
  },
  {
    tier: 'gold',
    name: 'Gold',
    minPoints: 1000,
    maxPoints: 1499,
    color: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    icon: '🥇',
    description: 'Proven performer',
  },
  {
    tier: 'platinum',
    name: 'Platinum',
    minPoints: 1500,
    maxPoints: 1999,
    color: '#E5E4E2',
    backgroundColor: 'rgba(229, 228, 226, 0.15)',
    icon: '💿',
    description: 'Elite trader',
  },
  {
    tier: 'diamond',
    name: 'Diamond',
    minPoints: 2000,
    maxPoints: 2499,
    color: '#B9F2FF',
    backgroundColor: 'rgba(185, 242, 255, 0.15)',
    icon: '💎',
    description: 'Top 5% of players',
  },
  {
    tier: 'master',
    name: 'Master',
    minPoints: 2500,
    maxPoints: 2999,
    color: '#9945FF',
    backgroundColor: 'rgba(153, 69, 255, 0.15)',
    icon: '👑',
    description: 'Top 1% of players',
  },
  {
    tier: 'grandmaster',
    name: 'Grandmaster',
    minPoints: 3000,
    maxPoints: Infinity,
    color: '#F7931A',
    backgroundColor: 'rgba(247, 147, 26, 0.15)',
    icon: '🏆',
    description: 'The absolute elite',
  },
];

// Points per division within each tier
const POINTS_PER_DIVISION = 125;

// ============ Rank Calculations ============

/**
 * Get tier info by tier name
 */
export function getTierInfo(tier: RankTier): RankTierInfo {
  return RANK_TIERS.find(t => t.tier === tier) || RANK_TIERS[0];
}

/**
 * Calculate rank from points
 */
export function calculateRank(points: number): { tier: RankTier; division: RankDivision } {
  // Find the appropriate tier
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    const tierInfo = RANK_TIERS[i];
    if (points >= tierInfo.minPoints) {
      // Calculate division within tier
      const pointsInTier = points - tierInfo.minPoints;
      const tierRange = tierInfo.maxPoints - tierInfo.minPoints;
      
      // Division 1 is highest, 4 is lowest
      let division: RankDivision;
      if (tierInfo.tier === 'grandmaster') {
        division = 1; // Grandmaster only has division 1
      } else {
        const divisionIndex = Math.floor(pointsInTier / POINTS_PER_DIVISION);
        division = (4 - Math.min(divisionIndex, 3)) as RankDivision;
      }
      
      return { tier: tierInfo.tier, division };
    }
  }
  
  return { tier: 'bronze', division: 4 };
}

/**
 * Get display string for rank
 */
export function getRankDisplay(tier: RankTier, division: RankDivision): string {
  const tierInfo = getTierInfo(tier);
  if (tier === 'grandmaster') {
    return tierInfo.name;
  }
  return `${tierInfo.name} ${division}`;
}

/**
 * Get points needed for next rank
 */
export function getPointsToNextRank(points: number): number {
  const currentRank = calculateRank(points);
  const tierInfo = getTierInfo(currentRank.tier);
  
  if (currentRank.tier === 'grandmaster') {
    return 0; // Already at max
  }
  
  // Calculate points to next division or tier
  const pointsInTier = points - tierInfo.minPoints;
  const currentDivisionIndex = 4 - currentRank.division;
  const nextDivisionThreshold = (currentDivisionIndex + 1) * POINTS_PER_DIVISION;
  
  if (currentRank.division === 1) {
    // Next is new tier
    return tierInfo.maxPoints - points + 1;
  }
  
  return nextDivisionThreshold - pointsInTier;
}

/**
 * Get progress percentage within current division
 */
export function getDivisionProgress(points: number): number {
  const currentRank = calculateRank(points);
  const tierInfo = getTierInfo(currentRank.tier);
  
  if (currentRank.tier === 'grandmaster') {
    return 100;
  }
  
  const pointsInTier = points - tierInfo.minPoints;
  const currentDivisionIndex = 4 - currentRank.division;
  const divisionStart = currentDivisionIndex * POINTS_PER_DIVISION;
  const divisionEnd = (currentDivisionIndex + 1) * POINTS_PER_DIVISION;
  const pointsInDivision = pointsInTier - divisionStart;
  
  return Math.min(100, (pointsInDivision / (divisionEnd - divisionStart)) * 100);
}

// ============ Point Calculations ============

/**
 * Calculate points gained from a competition result
 */
export function calculatePointsGained(
  rank: number,
  totalPlayers: number,
  competitionType: 'daily' | 'weekly' | 'monthly'
): number {
  if (totalPlayers === 0) return 0;
  
  const percentile = ((totalPlayers - rank) / totalPlayers) * 100;
  
  // Base multiplier by competition type
  const typeMultiplier = {
    daily: 1,
    weekly: 3,
    monthly: 10,
  }[competitionType];
  
  // Points based on percentile
  let basePoints = 0;
  if (rank === 1) {
    basePoints = 50; // Winner bonus
  } else if (rank <= 3) {
    basePoints = 35; // Podium
  } else if (percentile >= 90) {
    basePoints = 25; // Top 10%
  } else if (percentile >= 75) {
    basePoints = 15; // Top 25%
  } else if (percentile >= 50) {
    basePoints = 10; // Top 50%
  } else {
    basePoints = 5; // Participation
  }
  
  return Math.round(basePoints * typeMultiplier);
}

/**
 * Calculate points lost (decay or demotion)
 */
export function calculatePointsLost(
  currentPoints: number,
  weeksInactive: number
): number {
  // 2% decay per week of inactivity, minimum 1 point
  const decayRate = 0.02;
  const decay = Math.max(1, Math.floor(currentPoints * decayRate * weeksInactive));
  
  // Can't go below 0
  return Math.min(decay, currentPoints);
}

// ============ Streak Tracking ============

/**
 * Update streak based on competition result
 */
export function updateStreak(
  currentStreak: number,
  bestStreak: number,
  isWin: boolean
): { currentStreak: number; bestStreak: number } {
  if (isWin) {
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      bestStreak: Math.max(bestStreak, newStreak),
    };
  }
  
  return {
    currentStreak: 0,
    bestStreak,
  };
}

/**
 * Get streak bonus points
 */
export function getStreakBonus(streak: number): number {
  if (streak >= 10) return 25;
  if (streak >= 7) return 15;
  if (streak >= 5) return 10;
  if (streak >= 3) return 5;
  return 0;
}

// ============ Season Reset ============

/**
 * Calculate soft reset for new season
 * Players keep a portion of their points based on tier
 */
export function calculateSeasonReset(points: number): number {
  const rank = calculateRank(points);
  
  // Higher tiers keep more points
  const retentionRates: Record<RankTier, number> = {
    bronze: 0.5,
    silver: 0.55,
    gold: 0.6,
    platinum: 0.65,
    diamond: 0.7,
    master: 0.75,
    grandmaster: 0.8,
  };
  
  return Math.round(points * retentionRates[rank.tier]);
}

// ============ Leaderboard Position ============

/**
 * Compare two players for leaderboard sorting
 */
export function compareRanks(a: PlayerRank, b: PlayerRank): number {
  // First compare by points
  if (a.points !== b.points) {
    return b.points - a.points;
  }
  
  // Then by total wins
  if (a.totalWins !== b.totalWins) {
    return b.totalWins - a.totalWins;
  }
  
  // Then by best streak
  return b.bestStreak - a.bestStreak;
}

/**
 * Create default player rank
 */
export function createDefaultRank(): PlayerRank {
  return {
    tier: 'bronze',
    division: 4,
    points: 0,
    peakTier: 'bronze',
    peakDivision: 4,
    seasonWins: 0,
    totalWins: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastUpdated: Date.now(),
  };
}

/**
 * Update player rank after competition
 */
export function updatePlayerRank(
  current: PlayerRank,
  pointsGained: number,
  isWin: boolean
): PlayerRank {
  const newPoints = current.points + pointsGained;
  const newRank = calculateRank(newPoints);
  const streaks = updateStreak(current.currentStreak, current.bestStreak, isWin);
  
  // Check if this is a new peak
  const currentTierIndex = RANK_TIERS.findIndex(t => t.tier === current.peakTier);
  const newTierIndex = RANK_TIERS.findIndex(t => t.tier === newRank.tier);
  
  let peakTier = current.peakTier;
  let peakDivision = current.peakDivision;
  
  if (newTierIndex > currentTierIndex || 
      (newTierIndex === currentTierIndex && newRank.division < current.peakDivision)) {
    peakTier = newRank.tier;
    peakDivision = newRank.division;
  }
  
  return {
    tier: newRank.tier,
    division: newRank.division,
    points: newPoints,
    peakTier,
    peakDivision,
    seasonWins: isWin ? current.seasonWins + 1 : current.seasonWins,
    totalWins: isWin ? current.totalWins + 1 : current.totalWins,
    currentStreak: streaks.currentStreak,
    bestStreak: streaks.bestStreak,
    lastUpdated: Date.now(),
  };
}




