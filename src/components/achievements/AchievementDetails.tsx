'use client';

import { useState, useEffect } from 'react';
import {
  type Achievement,
  type AchievementDefinition,
  ACHIEVEMENT_DEFINITIONS,
  getRarityColor,
  getRarityBackground,
} from '@/lib/achievements';

type Props = {
  address: string;
  className?: string;
};

type AchievementProgress = {
  definition: AchievementDefinition;
  earned: boolean;
  progress?: number; // 0-100
  progressText?: string;
  earnedAt?: number;
  week?: number;
  season?: string;
};

export default function AchievementDetails({ address, className = '' }: Props) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progressData, setProgressData] = useState<AchievementProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchAchievements = async () => {
      setLoading(true);

      try {
        const response = await fetch(`/api/user/${address}/achievements`);
        
        if (response.ok) {
          const data = await response.json();
          setAchievements(data.achievements || []);
        }
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      fetchAchievements();
    }
  }, [address]);

  // Calculate progress for each achievement
  useEffect(() => {
    const calculateProgress = async () => {
      const progress: AchievementProgress[] = [];

      // Get earned achievements by type
      const earnedByType = new Map<string, Achievement>();
      for (const achievement of achievements) {
        if (!earnedByType.has(achievement.type) ||
            achievement.earnedAt > (earnedByType.get(achievement.type)?.earnedAt || 0)) {
          earnedByType.set(achievement.type, achievement);
        }
      }

      // For each achievement definition, calculate progress
      for (const definition of Object.values(ACHIEVEMENT_DEFINITIONS)) {
        const earned = earnedByType.get(definition.type);
        
        if (earned) {
          progress.push({
            definition,
            earned: true,
            progress: 100,
            progressText: 'Earned',
            earnedAt: earned.earnedAt,
            week: earned.week,
            season: earned.season,
          });
        } else {
          // Calculate progress based on achievement type
          // This is simplified - in a real app, fetch actual progress data
          let progressValue = 0;
          let progressText = 'Not started';

          // Example progress calculations (would need actual data from API)
          switch (definition.type) {
            case 'consistent':
              // Would check consecutive weeks
              progressValue = 0; // Placeholder
              progressText = '0/4 weeks';
              break;
            case 'hot_streak':
              progressValue = 0; // Placeholder
              progressText = '0/3 weeks';
              break;
            case 'top_10_percent':
              progressValue = 0; // Placeholder
              progressText = 'Not achieved';
              break;
            default:
              progressValue = 0;
              progressText = 'Not started';
          }

          progress.push({
            definition,
            earned: false,
            progress: progressValue,
            progressText,
          });
        }
      }

      // Sort: earned first, then by rarity
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
      progress.sort((a, b) => {
        if (a.earned !== b.earned) return a.earned ? -1 : 1;
        return rarityOrder[a.definition.rarity] - rarityOrder[b.definition.rarity];
      });

      setProgressData(progress);
    };

    if (achievements.length > 0 || address) {
      calculateProgress();
    }
  }, [achievements, address]);

  const categories = ['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'];
  const filteredProgress = selectedCategory === 'all'
    ? progressData
    : progressData.filter(p => p.definition.rarity === selectedCategory);

  if (loading) {
    return (
      <div className={`rounded-2xl border border-white/5 bg-white/[0.02] p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <svg className="h-8 w-8 animate-spin text-base-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              selectedCategory === category
                ? 'bg-base-blue text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Achievement List */}
      <div className="space-y-4">
        {filteredProgress.map((item) => {
          const color = getRarityColor(item.definition.rarity);
          const background = getRarityBackground(item.definition.rarity);

          return (
            <div
              key={item.definition.type}
              className={`
                rounded-xl border p-4 transition-all
                ${item.earned
                  ? 'border-white/10 bg-white/[0.02]'
                  : 'border-white/5 bg-white/[0.01] opacity-60'
                }
              `}
              style={{
                borderColor: item.earned ? `${color}30` : undefined,
              }}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`
                    flex h-16 w-16 items-center justify-center rounded-xl text-3xl
                    ${item.earned ? '' : 'grayscale opacity-50'}
                  `}
                  style={{
                    backgroundColor: item.earned ? background : 'rgba(255,255,255,0.02)',
                    border: `2px solid ${item.earned ? color : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  {item.definition.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className="text-lg font-bold"
                      style={{ color: item.earned ? 'white' : 'rgba(255,255,255,0.5)' }}
                    >
                      {item.definition.name}
                    </h3>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold uppercase"
                      style={{
                        backgroundColor: background,
                        color,
                      }}
                    >
                      {item.definition.rarity}
                    </span>
                    {item.earned && (
                      <span className="text-xs text-accent-emerald">✓ Earned</span>
                    )}
                  </div>

                  <p className="text-sm text-white/60 mb-3">
                    {item.definition.description}
                  </p>

                  {/* Progress Bar */}
                  {!item.earned && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-white/40">Progress</span>
                        <span className="text-white/60">{item.progressText}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${item.progress || 0}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Criteria */}
                  <div className="rounded-lg bg-white/5 p-2 mt-2">
                    <span className="text-xs text-white/40">How to unlock: </span>
                    <span className="text-xs text-white/80">{item.definition.criteria}</span>
                  </div>

                  {/* Earned Info */}
                  {item.earned && item.earnedAt && (
                    <div className="mt-2 text-xs text-white/40">
                      Earned {item.week ? `Week ${item.week}` : ''} •{' '}
                      {new Date(item.earnedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          {categories.slice(1).map((category) => {
            const count = progressData.filter(
              p => p.definition.rarity === category && p.earned
            ).length;
            const total = progressData.filter(
              p => p.definition.rarity === category
            ).length;

            return (
              <div key={category}>
                <div className="text-2xl font-bold text-white">{count}/{total}</div>
                <div className="text-xs text-white/40 capitalize">{category}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
