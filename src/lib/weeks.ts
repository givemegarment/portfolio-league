/**
 * Week schedule utilities for Portfolio League
 * 
 * Schedule:
 * - Picks open: Monday 00:00 UTC
 * - Picks lock: Sunday 23:59:59 UTC
 * - Week runs Monday to Sunday
 */

// Season 1 starts on this date (first Monday)
// Adjust this to your actual launch date
const SEASON_1_START = new Date('2024-12-02T00:00:00Z'); // Monday, Dec 2, 2024

export type WeekInfo = {
  season: string;
  week: number;
  startsAt: Date;
  endsAt: Date;
  isLocked: boolean;
};

/**
 * Get the Monday 00:00 UTC of the week containing the given date
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  
  // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = d.getUTCDay();
  
  // Calculate days to subtract to get to Monday
  // If Sunday (0), go back 6 days
  // If Monday (1), go back 0 days
  // If Tuesday (2), go back 1 day, etc.
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  d.setUTCDate(d.getUTCDate() - daysToSubtract);
  return d;
}

/**
 * Get the Sunday 23:59:59 UTC of the week containing the given date
 */
function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6); // Sunday
  weekEnd.setUTCHours(23, 59, 59, 999);
  return weekEnd;
}

/**
 * Calculate the week number since season start
 */
function calculateWeekNumber(date: Date, seasonStart: Date): number {
  const weekStart = getWeekStart(date);
  const seasonWeekStart = getWeekStart(seasonStart);
  
  const diffMs = weekStart.getTime() - seasonWeekStart.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  
  return Math.max(1, diffWeeks + 1);
}

/**
 * Get current week information
 */
export function getCurrentWeek(): WeekInfo {
  const now = new Date();
  return getWeekForDate(now);
}

/**
 * Get week information for a specific date
 */
export function getWeekForDate(date: Date): WeekInfo {
  const startsAt = getWeekStart(date);
  const endsAt = getWeekEnd(date);
  const week = calculateWeekNumber(date, SEASON_1_START);
  const isLocked = date > endsAt;
  
  return {
    season: 's1',
    week,
    startsAt,
    endsAt,
    isLocked,
  };
}

/**
 * Check if picks are currently locked for the current week
 * Picks lock at Sunday 23:59:59 UTC
 */
export function isLocked(): boolean {
  const now = new Date();
  const weekEnd = getWeekEnd(now);
  return now > weekEnd;
}

/**
 * Check if a specific timestamp is within the pick window for a given week
 */
export function isWithinPickWindow(timestamp: Date, weekInfo: WeekInfo): boolean {
  return timestamp >= weekInfo.startsAt && timestamp <= weekInfo.endsAt;
}

/**
 * Get Redis key for portfolio storage
 */
export function getWeekKey(season: string, week: number): string {
  return `portfolio:${season}:${week}`;
}

/**
 * Get Redis key for current week's portfolios
 */
export function getCurrentWeekKey(): string {
  const { season, week } = getCurrentWeek();
  return getWeekKey(season, week);
}

/**
 * Get time remaining until picks lock
 */
export function getTimeUntilLock(): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
} {
  const now = new Date();
  const { endsAt } = getCurrentWeek();
  const totalMs = Math.max(0, endsAt.getTime() - now.getTime());
  
  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds, totalMs };
}

/**
 * Format week info for display
 */
export function formatWeekDisplay(weekInfo: WeekInfo): string {
  return `Season ${weekInfo.season.replace('s', '')} • Week ${weekInfo.week}`;
}

