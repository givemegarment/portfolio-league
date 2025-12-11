/**
 * Achievement System for Portfolio League
 * 
 * Tracks and awards badges based on user performance
 */

export type AchievementType = 
  | 'weekly_winner'
  | 'hot_streak'
  | 'perfect_pick'
  | 'giant_slayer'
  | 'early_adopter'
  | 'contrarian'
  | 'consistent'
  | 'top_10_percent';

export type Achievement = {
  id: string;
  type: AchievementType;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  earnedAt: number;
  season?: string;
  week?: number;
  metadata?: Record<string, unknown>;
};

export type AchievementDefinition = {
  type: AchievementType;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  criteria: string;
};

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS: Record<AchievementType, AchievementDefinition> = {
  weekly_winner: {
    type: 'weekly_winner',
    name: 'Weekly Champion',
    description: 'Finished #1 in a weekly competition',
    icon: '🥇',
    rarity: 'epic',
    criteria: 'Rank #1 at the end of any week',
  },
  hot_streak: {
    type: 'hot_streak',
    name: 'Hot Streak',
    description: 'Finished in the top 10% for 3 consecutive weeks',
    icon: '🔥',
    rarity: 'rare',
    criteria: 'Top 10% for 3+ weeks in a row',
  },
  perfect_pick: {
    type: 'perfect_pick',
    name: 'Perfect Pick',
    description: 'Achieved 100%+ portfolio return in a single week',
    icon: '🎯',
    rarity: 'rare',
    criteria: 'Portfolio return >= 100% in one week',
  },
  giant_slayer: {
    type: 'giant_slayer',
    name: 'Giant Slayer',
    description: 'Beat a top 50 player in a direct challenge',
    icon: '⚔️',
    rarity: 'uncommon',
    criteria: 'Win a challenge against a top 50 ranked player',
  },
  early_adopter: {
    type: 'early_adopter',
    name: 'Early Adopter',
    description: 'Participated in Season 1 of Portfolio League',
    icon: '🌱',
    rarity: 'legendary',
    criteria: 'Submit at least one portfolio in Season 1',
  },
  contrarian: {
    type: 'contrarian',
    name: 'Contrarian',
    description: 'Won while betting against the crowd',
    icon: '🎲',
    rarity: 'epic',
    criteria: 'Finish top 10% with the least popular asset allocation',
  },
  consistent: {
    type: 'consistent',
    name: 'Consistent Player',
    description: 'Submitted portfolios for 4 consecutive weeks',
    icon: '📅',
    rarity: 'common',
    criteria: 'Submit portfolio 4+ weeks in a row',
  },
  top_10_percent: {
    type: 'top_10_percent',
    name: 'Top Performer',
    description: 'Finished in the top 10% of players',
    icon: '⭐',
    rarity: 'uncommon',
    criteria: 'Rank in top 10% at week end',
  },
};

/**
 * Check if user qualifies for weekly winner achievement
 */
export function checkWeeklyWinner(rank: number): boolean {
  return rank === 1;
}

/**
 * Check if user qualifies for top 10% achievement
 */
export function checkTop10Percent(rank: number, totalPlayers: number): boolean {
  if (totalPlayers === 0) return false;
  const percentile = (rank / totalPlayers) * 100;
  return percentile <= 10;
}

/**
 * Check if user qualifies for perfect pick achievement
 */
export function checkPerfectPick(score: number): boolean {
  return score >= 100;
}

/**
 * Check for hot streak (needs historical data)
 */
export function checkHotStreak(
  weeklyResults: Array<{ week: number; rank: number; totalPlayers: number }>
): boolean {
  if (weeklyResults.length < 3) return false;
  
  // Sort by week descending
  const sorted = [...weeklyResults].sort((a, b) => b.week - a.week);
  
  // Check last 3 weeks
  let consecutiveTopPerformances = 0;
  for (let i = 0; i < sorted.length && consecutiveTopPerformances < 3; i++) {
    const { rank, totalPlayers } = sorted[i];
    if (checkTop10Percent(rank, totalPlayers)) {
      consecutiveTopPerformances++;
    } else {
      break;
    }
  }
  
  return consecutiveTopPerformances >= 3;
}

/**
 * Check for consistent player achievement
 */
export function checkConsistent(
  participationWeeks: number[],
  currentWeek: number
): boolean {
  if (participationWeeks.length < 4) return false;
  
  // Check for 4 consecutive weeks ending at current week
  const sorted = [...participationWeeks].sort((a, b) => b - a);
  
  for (let i = 0; i < sorted.length - 3; i++) {
    const sequence = [sorted[i], sorted[i + 1], sorted[i + 2], sorted[i + 3]];
    const isConsecutive = sequence.every((week, idx) => 
      idx === 0 || sequence[idx - 1] - week === 1
    );
    if (isConsecutive) return true;
  }
  
  return false;
}

/**
 * Check for early adopter (Season 1 participation)
 */
export function checkEarlyAdopter(season: string): boolean {
  return season === 's1';
}

/**
 * Check for giant slayer (beat top 50 in challenge)
 */
export function checkGiantSlayer(
  opponentRank: number,
  userWon: boolean
): boolean {
  return userWon && opponentRank <= 50;
}

/**
 * Create an achievement object
 */
export function createAchievement(
  type: AchievementType,
  season?: string,
  week?: number,
  metadata?: Record<string, unknown>
): Achievement {
  const definition = ACHIEVEMENT_DEFINITIONS[type];
  
  return {
    id: `${type}_${season || 'all'}_${week || 'all'}_${Date.now()}`,
    type,
    name: definition.name,
    description: definition.description,
    icon: definition.icon,
    rarity: definition.rarity,
    earnedAt: Date.now(),
    season,
    week,
    metadata,
  };
}

/**
 * Get rarity color for UI
 */
export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'legendary':
      return '#F7931A'; // Gold
    case 'epic':
      return '#9945FF'; // Purple
    case 'rare':
      return '#0052FF'; // Blue
    case 'uncommon':
      return '#10b981'; // Green
    case 'common':
    default:
      return '#71717a'; // Gray
  }
}

/**
 * Get rarity background for UI
 */
export function getRarityBackground(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'legendary':
      return 'rgba(247, 147, 26, 0.15)';
    case 'epic':
      return 'rgba(153, 69, 255, 0.15)';
    case 'rare':
      return 'rgba(0, 82, 255, 0.15)';
    case 'uncommon':
      return 'rgba(16, 185, 129, 0.15)';
    case 'common':
    default:
      return 'rgba(113, 113, 122, 0.15)';
  }
}

/**
 * Get all achievement definitions as array
 */
export function getAllAchievementDefinitions(): AchievementDefinition[] {
  return Object.values(ACHIEVEMENT_DEFINITIONS);
}






