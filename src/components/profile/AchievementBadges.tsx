'use client';

import { useState } from 'react';
import { 
  type Achievement, 
  getRarityColor, 
  getRarityBackground,
  ACHIEVEMENT_DEFINITIONS,
  type AchievementDefinition,
} from '@/lib/achievements';

type Props = {
  achievements: Achievement[];
  showAll?: boolean; // Show all possible achievements (greyed out if not earned)
};

function AchievementBadge({ 
  achievement, 
  earned = true,
  onClick,
}: { 
  achievement: Achievement | AchievementDefinition;
  earned?: boolean;
  onClick?: () => void;
}) {
  const color = getRarityColor(achievement.rarity);
  const background = getRarityBackground(achievement.rarity);

  return (
    <button
      onClick={onClick}
      className={`
        group relative flex flex-col items-center gap-2 rounded-xl p-4 transition-all
        ${earned 
          ? 'cursor-pointer hover:scale-105' 
          : 'cursor-default opacity-40 grayscale'
        }
      `}
      style={{ 
        backgroundColor: earned ? background : 'rgba(255,255,255,0.02)',
        border: `1px solid ${earned ? `${color}30` : 'rgba(255,255,255,0.05)'}`,
      }}
    >
      {/* Icon */}
      <div 
        className="text-3xl transition-transform group-hover:scale-110"
        style={{ filter: earned ? 'none' : 'grayscale(100%)' }}
      >
        {achievement.icon}
      </div>

      {/* Name */}
      <span 
        className="text-xs font-semibold text-center"
        style={{ color: earned ? color : 'rgba(255,255,255,0.3)' }}
      >
        {achievement.name}
      </span>

      {/* Rarity indicator */}
      {earned && (
        <div 
          className="absolute -top-1 -right-1 h-3 w-3 rounded-full animate-pulse"
          style={{ backgroundColor: color }}
        />
      )}
    </button>
  );
}

function AchievementModal({ 
  achievement, 
  earned,
  onClose 
}: { 
  achievement: Achievement | AchievementDefinition;
  earned: boolean;
  onClose: () => void;
}) {
  const color = getRarityColor(achievement.rarity);
  const background = getRarityBackground(achievement.rarity);
  const earnedAchievement = earned ? achievement as Achievement : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-surface-2 p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div 
            className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl text-5xl"
            style={{ 
              backgroundColor: earned ? background : 'rgba(255,255,255,0.05)',
              border: `2px solid ${earned ? color : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            {achievement.icon}
          </div>

          {/* Name */}
          <h3 
            className="text-xl font-bold"
            style={{ color: earned ? 'white' : 'rgba(255,255,255,0.5)' }}
          >
            {achievement.name}
          </h3>

          {/* Rarity */}
          <span 
            className="mt-1 rounded-full px-3 py-0.5 text-xs font-semibold uppercase"
            style={{ 
              backgroundColor: background,
              color,
            }}
          >
            {achievement.rarity}
          </span>

          {/* Description */}
          <p className="mt-4 text-sm text-white/60">
            {achievement.description}
          </p>

          {/* Criteria */}
          {'criteria' in achievement && (
            <div className="mt-4 w-full rounded-lg bg-white/5 p-3">
              <span className="text-xs text-white/40">How to earn:</span>
              <p className="mt-1 text-sm text-white/80">
                {(achievement as AchievementDefinition).criteria}
              </p>
            </div>
          )}

          {/* Earned info */}
          {earnedAchievement && (
            <div className="mt-4 w-full rounded-lg bg-accent-emerald/10 p-3">
              <div className="flex items-center justify-center gap-2 text-accent-emerald">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">
                  Earned {earnedAchievement.week ? `Week ${earnedAchievement.week}` : ''}
                </span>
              </div>
              <p className="mt-1 text-xs text-white/40">
                {new Date(earnedAchievement.earnedAt).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Not earned info */}
          {!earned && (
            <div className="mt-4 w-full rounded-lg bg-white/5 p-3">
              <div className="flex items-center justify-center gap-2 text-white/40">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm font-medium">Not yet earned</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function AchievementBadges({ achievements, showAll = false }: Props) {
  const [selectedAchievement, setSelectedAchievement] = useState<{
    achievement: Achievement | AchievementDefinition;
    earned: boolean;
  } | null>(null);

  // Create a map of earned achievements by type
  const earnedByType = new Map<string, Achievement>();
  for (const achievement of achievements) {
    // Keep the most recent one of each type
    if (!earnedByType.has(achievement.type) || 
        achievement.earnedAt > (earnedByType.get(achievement.type)?.earnedAt || 0)) {
      earnedByType.set(achievement.type, achievement);
    }
  }

  // If showing all, merge with definitions
  const displayItems: Array<{ achievement: Achievement | AchievementDefinition; earned: boolean }> = [];
  
  if (showAll) {
    for (const def of Object.values(ACHIEVEMENT_DEFINITIONS)) {
      const earned = earnedByType.get(def.type);
      displayItems.push({
        achievement: earned || def,
        earned: !!earned,
      });
    }
  } else {
    for (const achievement of Array.from(earnedByType.values())) {
      displayItems.push({ achievement, earned: true });
    }
  }

  // Sort by rarity (legendary first) then by earned status
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
  displayItems.sort((a, b) => {
    if (a.earned !== b.earned) return a.earned ? -1 : 1;
    return rarityOrder[a.achievement.rarity] - rarityOrder[b.achievement.rarity];
  });

  if (displayItems.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">🎯</div>
        <p className="text-white/40">No achievements yet</p>
        <p className="text-xs text-white/30 mt-1">Keep playing to unlock badges!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {displayItems.map(({ achievement, earned }) => (
          <AchievementBadge
            key={`${achievement.type || achievement.name}`}
            achievement={achievement}
            earned={earned}
            onClick={() => setSelectedAchievement({ achievement, earned })}
          />
        ))}
      </div>

      {/* Modal */}
      {selectedAchievement && (
        <AchievementModal
          achievement={selectedAchievement.achievement}
          earned={selectedAchievement.earned}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </>
  );
}


