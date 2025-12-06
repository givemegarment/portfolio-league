'use client';

import { useEffect, useState } from 'react';
import { type Achievement } from '@/lib/achievements';
import AchievementBadges from './AchievementBadges';

type Props = {
  address: string;
  onClose?: () => void;
};

type UserStats = {
  totalAchievements: number;
  weeksParticipated: number;
  bestRank: number | null;
};

type LeaderboardEntry = {
  rank: number;
  user: string;
  score: number;
  allocations: { symbol: string; percentage: number }[];
};

const ASSET_COLORS: Record<string, string> = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  SOL: '#9945FF',
  USDC: '#2775CA',
};

export default function UserProfile({ address, onClose }: Props) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [leaderboardEntry, setLeaderboardEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch achievements
        const achievementsRes = await fetch(`/api/user/${address}/achievements`);
        if (achievementsRes.ok) {
          const data = await achievementsRes.json();
          setAchievements(data.achievements || []);
          setStats(data.stats || null);
        }

        // Fetch current leaderboard position
        const leaderboardRes = await fetch('/api/leaderboard?limit=100');
        if (leaderboardRes.ok) {
          const leaderboard: LeaderboardEntry[] = await leaderboardRes.json();
          const entry = leaderboard.find(
            (r) => r.user.toLowerCase() === address.toLowerCase()
          );
          if (entry) {
            setLeaderboardEntry(entry);
          }
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address]);

  // Generate avatar color from address
  const avatarColor = (() => {
    const colors = ['#F7931A', '#627EEA', '#9945FF', '#2775CA', '#10b981', '#f43f5e'];
    const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  })();

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full shimmer" />
          <div className="space-y-2">
            <div className="h-5 w-32 rounded shimmer" />
            <div className="h-4 w-24 rounded shimmer" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-20 rounded-xl shimmer" />
          <div className="h-20 rounded-xl shimmer" />
          <div className="h-20 rounded-xl shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-2 overflow-hidden">
      {/* Header */}
      <div className="relative border-b border-white/5 bg-gradient-to-br from-base-blue/10 to-purple-600/10 p-6">
        {/* Close button if modal */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg"
            style={{ backgroundColor: avatarColor }}
          >
            {address.slice(2, 4).toUpperCase()}
          </div>

          {/* Info */}
          <div>
            <h2 className="font-mono text-lg font-bold text-white">{shortAddress}</h2>
            {leaderboardEntry && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-white/50">Current Rank:</span>
                <span className="font-mono font-bold text-base-blue">#{leaderboardEntry.rank}</span>
                <span className={`font-mono text-sm ${leaderboardEntry.score >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                  {leaderboardEntry.score >= 0 ? '+' : ''}{leaderboardEntry.score.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Current portfolio */}
        {leaderboardEntry?.allocations && (
          <div className="mt-4">
            <div className="text-xs text-white/40 mb-2">Current Portfolio</div>
            <div className="flex h-6 rounded-full overflow-hidden">
              {leaderboardEntry.allocations.map((a, idx) => (
                <div
                  key={a.symbol}
                  className="h-full flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    width: `${a.percentage}%`,
                    backgroundColor: ASSET_COLORS[a.symbol] || '#666',
                    marginLeft: idx > 0 ? '2px' : 0,
                  }}
                >
                  {a.percentage >= 20 && a.symbol}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 p-4 border-b border-white/5">
        <div className="rounded-xl bg-white/[0.02] p-3 text-center">
          <div className="text-2xl font-bold text-white">
            {stats?.weeksParticipated || 0}
          </div>
          <div className="text-xs text-white/40">Weeks Played</div>
        </div>
        <div className="rounded-xl bg-white/[0.02] p-3 text-center">
          <div className="text-2xl font-bold text-white">
            {stats?.bestRank ? `#${stats.bestRank}` : '—'}
          </div>
          <div className="text-xs text-white/40">Best Rank</div>
        </div>
        <div className="rounded-xl bg-white/[0.02] p-3 text-center">
          <div className="text-2xl font-bold text-white">
            {achievements.length}
          </div>
          <div className="text-xs text-white/40">Badges</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Achievements</h3>
          <span className="text-xs text-white/40">
            {achievements.length} earned
          </span>
        </div>
        <AchievementBadges achievements={achievements} showAll />
      </div>
    </div>
  );
}



