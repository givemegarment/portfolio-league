/**
 * Competition types and utilities for Portfolio League
 * 
 * Supports multiple competition durations:
 * - Daily: 24 hours
 * - 3-Day: 72 hours
 * - Weekly: Monday to Sunday
 * - Monthly: 1st to last day of month
 */

export type CompetitionType = 'daily' | 'threeDay' | 'weekly' | 'monthly';

export type CompetitionConfig = {
  id: CompetitionType;
  name: string;
  shortName: string;
  description: string;
  durationDays: number;
  prizeMultiplier: number;
  icon: string;
};

export type CompetitionWindow = {
  type: CompetitionType;
  period: string; // e.g., "2024-12-06" for daily, "2024-W49" for weekly
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
  isLocked: boolean;
  timeRemaining: number; // milliseconds
};

/**
 * Competition type configurations
 */
export const COMPETITION_CONFIGS: Record<CompetitionType, CompetitionConfig> = {
  daily: {
    id: 'daily',
    name: 'Daily Sprint',
    shortName: 'Daily',
    description: '24-hour competition, resets at midnight UTC',
    durationDays: 1,
    prizeMultiplier: 1,
    icon: '⚡',
  },
  threeDay: {
    id: 'threeDay',
    name: '3-Day Challenge',
    shortName: '3-Day',
    description: 'Runs Friday to Sunday',
    durationDays: 3,
    prizeMultiplier: 2,
    icon: '🔥',
  },
  weekly: {
    id: 'weekly',
    name: 'Weekly League',
    shortName: 'Weekly',
    description: 'Monday to Sunday competition',
    durationDays: 7,
    prizeMultiplier: 5,
    icon: '🏆',
  },
  monthly: {
    id: 'monthly',
    name: 'Monthly Marathon',
    shortName: 'Monthly',
    description: 'Full month competition',
    durationDays: 30, // Approximate, actual varies
    prizeMultiplier: 20,
    icon: '👑',
  },
};

/**
 * Get the start of UTC day
 */
function getUTCDayStart(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of UTC day
 */
function getUTCDayEnd(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

/**
 * Get Monday 00:00 UTC of the week containing the date
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const dayOfWeek = d.getUTCDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  d.setUTCDate(d.getUTCDate() - daysToSubtract);
  return d;
}

/**
 * Get Sunday 23:59:59 UTC of the week containing the date
 */
function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  weekEnd.setUTCHours(23, 59, 59, 999);
  return weekEnd;
}

/**
 * Get first day of month 00:00 UTC
 */
function getMonthStart(date: Date): Date {
  const d = new Date(date);
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Get last day of month 23:59:59 UTC
 */
function getMonthEnd(date: Date): Date {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + 1, 0);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

/**
 * Get Friday 00:00 UTC for 3-day competition
 */
function getThreeDayStart(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const dayOfWeek = d.getUTCDay();
  
  // Find the Friday of the current or previous 3-day window
  let daysToFriday: number;
  if (dayOfWeek === 0) {
    // Sunday - current window started 2 days ago
    daysToFriday = 2;
  } else if (dayOfWeek >= 5) {
    // Friday or Saturday - current window started on Friday
    daysToFriday = dayOfWeek - 5;
  } else {
    // Monday to Thursday - go back to last Friday
    daysToFriday = dayOfWeek + 2;
  }
  
  d.setUTCDate(d.getUTCDate() - daysToFriday);
  return d;
}

/**
 * Get Sunday 23:59:59 UTC for 3-day competition
 */
function getThreeDayEnd(date: Date): Date {
  const start = getThreeDayStart(date);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 2);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}

/**
 * Format period string for Redis keys
 */
function formatPeriod(type: CompetitionType, date: Date): string {
  switch (type) {
    case 'daily':
      return date.toISOString().split('T')[0]; // 2024-12-06
    case 'threeDay': {
      const start = getThreeDayStart(date);
      return start.toISOString().split('T')[0]; // 2024-12-06 (Friday)
    }
    case 'weekly': {
      const weekStart = getWeekStart(date);
      const year = weekStart.getUTCFullYear();
      const startOfYear = new Date(Date.UTC(year, 0, 1));
      const weekNum = Math.ceil(((weekStart.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getUTCDay() + 1) / 7);
      return `${year}-W${weekNum.toString().padStart(2, '0')}`; // 2024-W49
    }
    case 'monthly': {
      const year = date.getUTCFullYear();
      const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
      return `${year}-${month}`; // 2024-12
    }
  }
}

/**
 * Get competition window for a specific type and date
 */
export function getCompetitionWindow(type: CompetitionType, date: Date = new Date()): CompetitionWindow {
  let startsAt: Date;
  let endsAt: Date;

  switch (type) {
    case 'daily':
      startsAt = getUTCDayStart(date);
      endsAt = getUTCDayEnd(date);
      break;
    case 'threeDay':
      startsAt = getThreeDayStart(date);
      endsAt = getThreeDayEnd(date);
      break;
    case 'weekly':
      startsAt = getWeekStart(date);
      endsAt = getWeekEnd(date);
      break;
    case 'monthly':
      startsAt = getMonthStart(date);
      endsAt = getMonthEnd(date);
      break;
  }

  const now = date.getTime();
  const isActive = now >= startsAt.getTime() && now <= endsAt.getTime();
  const isLocked = now > endsAt.getTime();
  const timeRemaining = Math.max(0, endsAt.getTime() - now);

  return {
    type,
    period: formatPeriod(type, date),
    startsAt,
    endsAt,
    isActive,
    isLocked,
    timeRemaining,
  };
}

/**
 * Get all active competitions
 */
export function getActiveCompetitions(date: Date = new Date()): CompetitionWindow[] {
  const types: CompetitionType[] = ['daily', 'threeDay', 'weekly', 'monthly'];
  return types
    .map(type => getCompetitionWindow(type, date))
    .filter(window => window.isActive);
}

/**
 * Get Redis key for portfolio storage
 */
export function getCompetitionKey(type: CompetitionType, period: string): string {
  return `competition:${type}:${period}`;
}

/**
 * Get Redis key for current competition portfolios
 */
export function getCurrentCompetitionKey(type: CompetitionType): string {
  const window = getCompetitionWindow(type);
  return getCompetitionKey(type, window.period);
}

/**
 * Format time remaining for display
 */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Ended';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Get competition display info
 */
export function getCompetitionDisplayInfo(type: CompetitionType): CompetitionConfig {
  return COMPETITION_CONFIGS[type];
}

/**
 * Check if a type is a valid competition type
 */
export function isValidCompetitionType(type: string): type is CompetitionType {
  return ['daily', 'threeDay', 'weekly', 'monthly'].includes(type);
}

// ============ League System ============

export type LeagueType = 
  | 'open'           // Anyone can join
  | 'narrative'      // Specific to a DeFi narrative  
  | 'master-follow'  // All emulating same Master
  | 'risk-tier'      // Grouped by risk tolerance
  | 'invite';        // Private leagues

export type RiskTier = 'conservative' | 'moderate' | 'aggressive';

export type League = {
  id: string;
  name: string;
  type: LeagueType;
  description: string;
  createdBy: string;
  masterAddress?: string;      // For master-follow leagues
  narrative?: string;          // For narrative leagues
  riskTier?: RiskTier;         // For risk-tier leagues
  inviteCode?: string;         // For invite leagues
  competitionType: CompetitionType;
  playerCount: number;
  maxPlayers: number;
  prizePool: number;
  entryFee: number;
  startsAt: number;
  endsAt: number;
  createdAt: number;
  isActive: boolean;
  isFeatured: boolean;
};

export type LeagueEntry = {
  leagueId: string;
  address: string;
  joinedAt: number;
  currentRank?: number;
  currentScore?: number;
};

/**
 * League type configurations
 */
export const LEAGUE_TYPE_CONFIGS: Record<LeagueType, {
  name: string;
  description: string;
  icon: string;
  color: string;
}> = {
  open: {
    name: 'Open League',
    description: 'Anyone can join this competition',
    icon: '🌐',
    color: '#10B981',
  },
  narrative: {
    name: 'Narrative League',
    description: 'Competition focused on a specific DeFi narrative',
    icon: '📖',
    color: '#0052FF',
  },
  'master-follow': {
    name: 'Master League',
    description: 'All players emulate the same Master',
    icon: '👑',
    color: '#F7931A',
  },
  'risk-tier': {
    name: 'Risk-Tier League',
    description: 'Players grouped by risk tolerance',
    icon: '📊',
    color: '#9945FF',
  },
  invite: {
    name: 'Private League',
    description: 'Invite-only competition',
    icon: '🔒',
    color: '#EF4444',
  },
};

/**
 * Risk tier configurations
 */
export const RISK_TIER_CONFIGS: Record<RiskTier, {
  name: string;
  description: string;
  maxVolatility: number;
  allowedHighRiskPercentage: number;
  color: string;
}> = {
  conservative: {
    name: 'Conservative',
    description: 'Low risk strategies with stable assets',
    maxVolatility: 30,
    allowedHighRiskPercentage: 10,
    color: '#10B981',
  },
  moderate: {
    name: 'Moderate',
    description: 'Balanced risk with diversified holdings',
    maxVolatility: 60,
    allowedHighRiskPercentage: 40,
    color: '#F59E0B',
  },
  aggressive: {
    name: 'Aggressive',
    description: 'High risk tolerance with volatile assets',
    maxVolatility: 100,
    allowedHighRiskPercentage: 100,
    color: '#EF4444',
  },
};

/**
 * Get league type config
 */
export function getLeagueTypeConfig(type: LeagueType) {
  return LEAGUE_TYPE_CONFIGS[type];
}

/**
 * Get risk tier config
 */
export function getRiskTierConfig(tier: RiskTier) {
  return RISK_TIER_CONFIGS[tier];
}

/**
 * Generate unique league ID
 */
export function generateLeagueId(): string {
  return `league_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate invite code for private leagues
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a new league
 */
export function createLeague(params: {
  name: string;
  type: LeagueType;
  description: string;
  createdBy: string;
  competitionType: CompetitionType;
  maxPlayers?: number;
  prizePool?: number;
  entryFee?: number;
  masterAddress?: string;
  narrative?: string;
  riskTier?: RiskTier;
}): League {
  const now = Date.now();
  const window = getCompetitionWindow(params.competitionType);
  
  return {
    id: generateLeagueId(),
    name: params.name,
    type: params.type,
    description: params.description,
    createdBy: params.createdBy,
    masterAddress: params.masterAddress,
    narrative: params.narrative,
    riskTier: params.riskTier,
    inviteCode: params.type === 'invite' ? generateInviteCode() : undefined,
    competitionType: params.competitionType,
    playerCount: 0,
    maxPlayers: params.maxPlayers || 100,
    prizePool: params.prizePool || 0,
    entryFee: params.entryFee || 0,
    startsAt: window.startsAt.getTime(),
    endsAt: window.endsAt.getTime(),
    createdAt: now,
    isActive: true,
    isFeatured: false,
  };
}

/**
 * Check if portfolio meets risk tier requirements
 */
export function meetsRiskTierRequirements(
  allocations: { symbol: string; percentage: number }[],
  tier: RiskTier
): boolean {
  const config = RISK_TIER_CONFIGS[tier];
  const highRiskAssets = ['PEPE', 'WIF', 'BONK', 'DEGEN', 'BRETT', 'TOSHI', 'HIGHER'];
  
  const highRiskPercentage = allocations
    .filter(a => highRiskAssets.includes(a.symbol))
    .reduce((sum, a) => sum + a.percentage, 0);
  
  return highRiskPercentage <= config.allowedHighRiskPercentage;
}

/**
 * Create sample leagues for demo
 */
export function createSampleLeagues(): League[] {
  const now = Date.now();
  
  return [
    {
      id: 'league_open_weekly',
      name: 'Weekly Open Championship',
      type: 'open',
      description: 'The main weekly competition - open to all strategies',
      createdBy: '0x0000000000000000000000000000000000000000',
      competitionType: 'weekly',
      playerCount: 128,
      maxPlayers: 500,
      prizePool: 1000,
      entryFee: 0,
      startsAt: now - 2 * 24 * 60 * 60 * 1000,
      endsAt: now + 5 * 24 * 60 * 60 * 1000,
      createdAt: now - 7 * 24 * 60 * 60 * 1000,
      isActive: true,
      isFeatured: true,
    },
    {
      id: 'league_meme_masters',
      name: 'Memecoin Masters',
      type: 'narrative',
      description: 'For the degen meme traders - memecoins only!',
      narrative: 'memecoin',
      createdBy: '0x0000000000000000000000000000000000000000',
      competitionType: 'weekly',
      playerCount: 45,
      maxPlayers: 100,
      prizePool: 500,
      entryFee: 0,
      startsAt: now - 2 * 24 * 60 * 60 * 1000,
      endsAt: now + 5 * 24 * 60 * 60 * 1000,
      createdAt: now - 7 * 24 * 60 * 60 * 1000,
      isActive: true,
      isFeatured: true,
    },
    {
      id: 'league_blue_chip_bull',
      name: 'Blue Chip Bull Followers',
      type: 'master-follow',
      description: 'Compete while emulating Blue Chip Bull\'s strategy',
      masterAddress: '0x1234567890abcdef1234567890abcdef12345678',
      createdBy: '0x0000000000000000000000000000000000000000',
      competitionType: 'weekly',
      playerCount: 32,
      maxPlayers: 50,
      prizePool: 250,
      entryFee: 0,
      startsAt: now - 2 * 24 * 60 * 60 * 1000,
      endsAt: now + 5 * 24 * 60 * 60 * 1000,
      createdAt: now - 7 * 24 * 60 * 60 * 1000,
      isActive: true,
      isFeatured: false,
    },
    {
      id: 'league_conservative',
      name: 'Conservative Club',
      type: 'risk-tier',
      description: 'Low-risk strategies only - max 10% meme exposure',
      riskTier: 'conservative',
      createdBy: '0x0000000000000000000000000000000000000000',
      competitionType: 'monthly',
      playerCount: 22,
      maxPlayers: 100,
      prizePool: 1000,
      entryFee: 0,
      startsAt: now - 10 * 24 * 60 * 60 * 1000,
      endsAt: now + 20 * 24 * 60 * 60 * 1000,
      createdAt: now - 30 * 24 * 60 * 60 * 1000,
      isActive: true,
      isFeatured: false,
    },
  ];
}









