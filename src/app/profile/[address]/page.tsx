'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import Nav from '@/components/chrome/Nav';
import PerformanceChart from '@/components/portfolio/PerformanceChart';
import PortfolioMetrics from '@/components/portfolio/PortfolioMetrics';
import AchievementDetails from '@/components/achievements/AchievementDetails';

type PortfolioData = {
  portfolio: {
    allocations: Array<{ symbol: string; percentage: number }>;
    entryPrices: Record<string, number>;
    timestamp: number;
  } | null;
  basket: string[] | null;
  season: string;
  week: number;
  isLocked: boolean;
};

type Achievement = {
  type: string;
  season: string;
  week?: number;
  timestamp: number;
  metadata?: Record<string, any>;
};

type AchievementsData = {
  achievements: Achievement[];
  stats: {
    totalAchievements: number;
    weeksParticipated: number;
    bestRank: number | null;
  };
};

export default function ProfilePage() {
  const params = useParams();
  const { address: connectedAddress } = useAccount();
  const address = (params.address as string) || connectedAddress;
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [achievements, setAchievements] = useState<AchievementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [portfolioRes, achievementsRes] = await Promise.all([
          fetch(`/api/portfolio?address=${address}`),
          fetch(`/api/user/${address}/achievements`),
        ]);

        if (!portfolioRes.ok) {
          throw new Error('Failed to fetch portfolio');
        }

        const portfolioData: PortfolioData = await portfolioRes.json();
        setPortfolio(portfolioData);

        if (achievementsRes.ok) {
          const achievementsData: AchievementsData = await achievementsRes.json();
          setAchievements(achievementsData);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-48 rounded-2xl bg-white/5" />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 rounded-2xl bg-white/5" />
              </div>
              <div className="h-96 rounded-2xl bg-white/5" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !address) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <div className="rounded-2xl border border-white/5 bg-surface-2 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">
              😕
            </div>
            <h2 className="text-xl font-bold text-white">Profile Not Found</h2>
            <p className="mt-2 text-sm text-white/60">
              {error || 'Please connect your wallet or provide a valid address'}
            </p>
          </div>
        </main>
      </div>
    );
  }

  const isOwnProfile = connectedAddress?.toLowerCase() === address.toLowerCase();
  const displayAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-base-blue/10 px-4 py-2">
            <span className="text-lg">👤</span>
            <span className="text-sm font-medium text-base-blue">
              {isOwnProfile ? 'Your Profile' : 'User Profile'}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {isOwnProfile ? 'Your Portfolio' : `${displayAddress}'s Portfolio`}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/60">
            {isOwnProfile
              ? 'Track your performance, achievements, and portfolio history'
              : `View ${displayAddress}'s portfolio performance and achievements`}
          </p>
        </div>

        {/* Stats Cards */}
        {achievements && (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="Achievements"
              value={achievements.stats.totalAchievements.toString()}
              icon="🏆"
            />
            <StatCard
              label="Weeks Played"
              value={achievements.stats.weeksParticipated.toString()}
              icon="📅"
            />
            <StatCard
              label="Best Rank"
              value={
                achievements.stats.bestRank
                  ? `#${achievements.stats.bestRank}`
                  : '—'
              }
              icon="⭐"
            />
            <StatCard
              label="Current Week"
              value={portfolio ? `S${portfolio.season.replace('s', '')}W${portfolio.week}` : '—'}
              icon="📊"
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Portfolio Performance Chart */}
            <PerformanceChart address={address} height={300} />

            {/* Current Portfolio */}
            {portfolio?.portfolio && (
              <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                  <svg
                    className="h-5 w-5 text-base-blue"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  Current Portfolio
                </h3>
                <div className="space-y-3">
                  {portfolio.portfolio.allocations.map((allocation) => (
                    <div
                      key={allocation.symbol}
                      className="flex items-center justify-between rounded-xl bg-white/[0.03] p-3"
                    >
                      <div className="font-medium text-white">{allocation.symbol}</div>
                      <div className="font-mono font-bold text-white">
                        {allocation.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Metrics */}
            {portfolio?.portfolio && (
              <PortfolioMetrics
                allocations={portfolio.portfolio.allocations}
                entryPrices={portfolio.portfolio.entryPrices}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            {achievements && achievements.achievements.length > 0 && (
              <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                  <svg
                    className="h-5 w-5 text-accent-amber"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                  Achievements
                </h3>
                <div className="space-y-3">
                  {achievements.achievements.slice(0, 5).map((achievement, idx) => (
                    <AchievementDetails key={idx} achievement={achievement} />
                  ))}
                  {achievements.achievements.length > 5 && (
                    <div className="text-center text-sm text-white/40">
                      +{achievements.achievements.length - 5} more achievements
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Address Info */}
            <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
              <h3 className="mb-4 text-sm font-medium text-white/60">Wallet Address</h3>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-sm text-white/80 break-all">
                  {address}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(address)}
                  className="rounded-lg bg-white/5 p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                  title="Copy address"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-surface-2 p-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-white/40">{label}</span>
      </div>
      <div className="mt-2 text-xl font-bold text-white">{value}</div>
    </div>
  );
}
