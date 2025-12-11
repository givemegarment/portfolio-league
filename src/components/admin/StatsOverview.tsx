'use client';

import { type AdminStats } from '@/lib/admin';

type Props = {
  stats: AdminStats | null;
  loading: boolean;
};

function StatCard({ 
  label, 
  value, 
  icon, 
  trend,
  color = 'blue',
}: { 
  label: string; 
  value: string | number; 
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color?: 'blue' | 'emerald' | 'amber' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-base-blue/20 text-base-blue',
    emerald: 'bg-accent-emerald/20 text-accent-emerald',
    amber: 'bg-accent-amber/20 text-accent-amber',
    purple: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/50">{label}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {trend && (
            <p className={`mt-1 text-sm ${trend.isPositive ? 'text-accent-emerald' : 'text-accent-rose'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}% from last week
            </p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-4 w-24 rounded shimmer mb-3" />
          <div className="h-8 w-16 rounded shimmer" />
        </div>
        <div className="h-12 w-12 rounded-xl shimmer" />
      </div>
    </div>
  );
}

export default function StatsOverview({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-2xl border border-accent-rose/20 bg-accent-rose/5 p-6 text-center">
        <p className="text-accent-rose">Failed to load stats</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Players"
          value={stats.totalPlayers}
          color="blue"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          label="Active This Week"
          value={stats.activePlayers}
          color="emerald"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Prize Pool"
          value={`$${stats.prizePool.toLocaleString()}`}
          color="amber"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Avg Return"
          value={`${stats.averageScore >= 0 ? '+' : ''}${stats.averageScore.toFixed(2)}%`}
          color="purple"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>

      {/* Top Performers */}
      {stats.topPerformers.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Top Performers</h3>
          <div className="space-y-3">
            {stats.topPerformers.slice(0, 5).map((performer, index) => (
              <div
                key={performer.address}
                className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold
                    ${index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black' : 
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-black' :
                      index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                      'bg-white/10 text-white/60'}
                  `}>
                    {performer.rank}
                  </div>
                  <span className="font-mono text-sm text-white">
                    {performer.address.slice(0, 6)}...{performer.address.slice(-4)}
                  </span>
                </div>
                <span className={`font-mono font-bold ${performer.score >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                  {performer.score >= 0 ? '+' : ''}{performer.score.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
