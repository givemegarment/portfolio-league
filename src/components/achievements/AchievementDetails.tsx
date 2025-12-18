'use client';

import { Achievement, getRarityColor, getRarityBackground, ACHIEVEMENT_DEFINITIONS } from '@/lib/achievements';

type AchievementDetailsProps = {
  achievement: Achievement | {
    type: string;
    season?: string;
    week?: number;
    timestamp?: number;
    metadata?: Record<string, any>;
  };
};

export default function AchievementDetails({ achievement }: AchievementDetailsProps) {
  // Get achievement definition if we only have type
  let achievementData: Achievement;
  
  if ('name' in achievement && 'icon' in achievement) {
    // It's already a full Achievement object
    achievementData = achievement as Achievement;
  } else {
    // It's a partial achievement from API, get definition
    const def = ACHIEVEMENT_DEFINITIONS[achievement.type as keyof typeof ACHIEVEMENT_DEFINITIONS];
    if (!def) {
      // Fallback for unknown achievement types
      return (
        <div className="rounded-xl bg-white/[0.03] p-3">
          <div className="text-sm text-white/60">Unknown Achievement</div>
        </div>
      );
    }
    
    // Create a full achievement object
    achievementData = {
      id: `${achievement.type}-${achievement.season || ''}-${achievement.week || ''}`,
      type: achievement.type as any,
      name: def.name,
      description: def.description,
      icon: def.icon,
      rarity: def.rarity,
      earnedAt: achievement.timestamp || Date.now(),
      season: achievement.season,
      week: achievement.week,
      metadata: achievement.metadata,
    };
  }

  const color = getRarityColor(achievementData.rarity);
  const background = getRarityBackground(achievementData.rarity);

  return (
    <div
      className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3"
      style={{
        border: `1px solid ${color}30`,
      }}
    >
      {/* Icon */}
      <div
        className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
        style={{
          backgroundColor: background,
        }}
      >
        {achievementData.icon}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white">{achievementData.name}</div>
        <div className="text-xs text-white/50 line-clamp-1">
          {achievementData.description}
        </div>
        {achievementData.week && achievementData.season && (
          <div className="mt-1 text-xs text-white/40">
            S{achievementData.season.replace('s', '')}W{achievementData.week}
          </div>
        )}
      </div>

      {/* Rarity indicator */}
      <div
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
