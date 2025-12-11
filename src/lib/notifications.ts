/**
 * Notification system for Portfolio League
 * 
 * Handles in-app notifications for competition events, rank changes, and achievements
 */

export type NotificationType =
  | 'competition_start'
  | 'competition_end'
  | 'rank_change'
  | 'achievement_unlocked'
  | 'friend_joined'
  | 'challenge_received'
  | 'system';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: Record<string, unknown>;
  actionUrl?: string;
};

export type NotificationPreferences = {
  competitionAlerts: boolean;
  rankChanges: boolean;
  achievements: boolean;
  social: boolean;
  email: boolean;
  push: boolean;
};

/**
 * Default notification preferences
 */
export const DEFAULT_PREFERENCES: NotificationPreferences = {
  competitionAlerts: true,
  rankChanges: true,
  achievements: true,
  social: true,
  email: false,
  push: false,
};

/**
 * Notification type metadata
 */
export const NOTIFICATION_META: Record<NotificationType, {
  icon: string;
  color: string;
  priority: 'low' | 'medium' | 'high';
}> = {
  competition_start: {
    icon: '🏁',
    color: '#3B82F6', // blue
    priority: 'high',
  },
  competition_end: {
    icon: '🏆',
    color: '#F59E0B', // amber
    priority: 'high',
  },
  rank_change: {
    icon: '📊',
    color: '#10B981', // emerald
    priority: 'medium',
  },
  achievement_unlocked: {
    icon: '⭐',
    color: '#8B5CF6', // purple
    priority: 'medium',
  },
  friend_joined: {
    icon: '👋',
    color: '#EC4899', // pink
    priority: 'low',
  },
  challenge_received: {
    icon: '⚔️',
    color: '#EF4444', // red
    priority: 'high',
  },
  system: {
    icon: '📢',
    color: '#6B7280', // gray
    priority: 'low',
  },
};

/**
 * Generate a unique notification ID
 */
export function generateNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a notification object
 */
export function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, unknown>,
  actionUrl?: string
): Notification {
  return {
    id: generateNotificationId(),
    type,
    title,
    message,
    timestamp: Date.now(),
    read: false,
    data,
    actionUrl,
  };
}

/**
 * Create preset notifications
 */
export const NotificationTemplates = {
  competitionStarted: (competitionName: string) =>
    createNotification(
      'competition_start',
      'Competition Started!',
      `${competitionName} is now live. Submit your picks!`,
      { competition: competitionName },
      '/'
    ),

  competitionEnding: (competitionName: string, hoursLeft: number) =>
    createNotification(
      'competition_start',
      'Competition Ending Soon',
      `${competitionName} ends in ${hoursLeft} hours. Make sure your picks are in!`,
      { competition: competitionName, hoursLeft },
      '/'
    ),

  competitionEnded: (competitionName: string, rank: number, total: number) =>
    createNotification(
      'competition_end',
      'Competition Results',
      `You finished #${rank} out of ${total} in ${competitionName}!`,
      { competition: competitionName, rank, total },
      '/leaderboard'
    ),

  rankUp: (oldRank: number, newRank: number) =>
    createNotification(
      'rank_change',
      'Rank Up! 📈',
      `You moved from #${oldRank} to #${newRank}!`,
      { oldRank, newRank, direction: 'up' }
    ),

  rankDown: (oldRank: number, newRank: number) =>
    createNotification(
      'rank_change',
      'Rank Changed',
      `You moved from #${oldRank} to #${newRank}`,
      { oldRank, newRank, direction: 'down' }
    ),

  achievementUnlocked: (achievementName: string, description: string) =>
    createNotification(
      'achievement_unlocked',
      'Achievement Unlocked!',
      `${achievementName}: ${description}`,
      { achievement: achievementName },
      '/profile'
    ),

  friendJoined: (friendAddress: string) =>
    createNotification(
      'friend_joined',
      'Friend Joined',
      `${friendAddress.slice(0, 6)}...${friendAddress.slice(-4)} joined Portfolio League!`,
      { friendAddress },
      `/profile/${friendAddress}`
    ),

  challengeReceived: (challengerAddress: string) =>
    createNotification(
      'challenge_received',
      'Challenge Received!',
      `${challengerAddress.slice(0, 6)}...${challengerAddress.slice(-4)} challenged you!`,
      { challengerAddress },
      '/'
    ),
};

/**
 * Storage keys for localStorage
 */
const STORAGE_KEYS = {
  notifications: 'portfolio_league_notifications',
  preferences: 'portfolio_league_notification_prefs',
  lastRead: 'portfolio_league_last_read',
};

/**
 * Get notifications from localStorage
 */
export function getStoredNotifications(): Notification[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.notifications);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Store notifications to localStorage
 */
export function storeNotifications(notifications: Notification[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Keep only last 50 notifications
    const limited = notifications.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(limited));
  } catch (error) {
    console.error('Error storing notifications:', error);
  }
}

/**
 * Add a notification
 */
export function addNotification(notification: Notification): Notification[] {
  const current = getStoredNotifications();
  const updated = [notification, ...current];
  storeNotifications(updated);
  return updated;
}

/**
 * Mark notification as read
 */
export function markAsRead(notificationId: string): Notification[] {
  const notifications = getStoredNotifications();
  const updated = notifications.map(n =>
    n.id === notificationId ? { ...n, read: true } : n
  );
  storeNotifications(updated);
  return updated;
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead(): Notification[] {
  const notifications = getStoredNotifications();
  const updated = notifications.map(n => ({ ...n, read: true }));
  storeNotifications(updated);
  return updated;
}

/**
 * Get unread count
 */
export function getUnreadCount(): number {
  const notifications = getStoredNotifications();
  return notifications.filter(n => !n.read).length;
}

/**
 * Clear all notifications
 */
export function clearNotifications(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.notifications);
}

/**
 * Get notification preferences
 */
export function getPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.preferences);
    return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Update notification preferences
 */
export function updatePreferences(prefs: Partial<NotificationPreferences>): NotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  
  const current = getPreferences();
  const updated = { ...current, ...prefs };
  
  try {
    localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(updated));
  } catch (error) {
    console.error('Error storing preferences:', error);
  }
  
  return updated;
}

/**
 * Format notification timestamp for display
 */
export function formatNotificationTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return new Date(timestamp).toLocaleDateString();
}



