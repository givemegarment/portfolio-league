'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import Nav from '@/components/chrome/Nav';
import MasterHoldings from '@/components/masters/MasterHoldings';
import MasterPerformance from '@/components/masters/MasterPerformance';
import PerformanceChart from '@/components/portfolio/PerformanceChart';
import { Master, getTierColor, getTierLabel } from '@/lib/masters';
import { getNarrative, getRiskLevelColor, getRiskLevelLabel } from '@/lib/narratives';
import { createEmulationTemplate } from '@/lib/adaptation';
import { formatScore } from '@/lib/scoring';

export default function MasterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address: userAddress, isConnected } = useAccount();
  const [master, setMaster] = useState<Master | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const address = params.address as string;

  // Load master data and follow status
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        setLoading(true);
        const [masterRes, followRes] = await Promise.all([
          fetch(`/api/masters/${address}`),
          userAddress ? fetch(`/api/masters/${address}/follow?userAddress=${userAddress}`) : null,
        ]);

        if (!masterRes.ok) {
          throw new Error('Failed to fetch master');
        }
        const masterData = await masterRes.json();
        setMaster(masterData);

        if (followRes && followRes.ok) {
          const followData = await followRes.json();
          setIsFollowing(followData.following || false);
        }
      } catch (error) {
        console.error('Error fetching master:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaster();
  }, [address, userAddress]);

  const narrative = master ? getNarrative(master.primaryNarrative) : null;
  const tierColor = master ? getTierColor(master.tier) : '#71717A';

  const handleEmulate = () => {
    if (!master) return;
    
    // Store emulation data in sessionStorage for the portfolio builder
    const template = createEmulationTemplate(master);
    sessionStorage.setItem('emulation_template', JSON.stringify({
      masterAddress: master.address,
      masterName: master.name,
      allocations: template,
    }));
    
    router.push('/');
  };

  const handleFollow = async () => {
    if (!userAddress || !master) return;
    
    try {
      setFollowLoading(true);
      const response = await fetch(`/api/masters/${master.address}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress,
          action: isFollowing ? 'unfollow' : 'follow',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update follow status');
      }

      const data = await response.json();
      if (data.success) {
        setIsFollowing(data.following);
        // Update master's follower count locally
        if (master) {
          setMaster({
            ...master,
            followerCount: data.following
              ? master.followerCount + 1
              : Math.max(0, master.followerCount - 1),
          });
        }
      }
    } catch (error) {
      console.error('Follow error:', error);
      // Optionally show error toast/notification
    } finally {
      setFollowLoading(false);
    }
  };

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

  if (!master) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <div className="rounded-2xl border border-white/5 bg-surface-2 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">
              😕
            </div>
            <h2 className="text-xl font-bold text-white">Master Not Found</h2>
            <p className="mt-2 text-sm text-white/60">
              This master doesn&apos;t exist or may have been removed
            </p>
            <button
              onClick={() => router.push('/masters')}
              className="mt-6 btn-primary"
            >
              Browse Masters
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.push('/masters')}
          className="mb-6 flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Masters
        </button>

        {/* Hero section */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/5 bg-surface-2 p-8">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl opacity-20"
              style={{ backgroundColor: narrative?.color }}
            />
          </div>

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            {/* Master info */}
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div
                className="flex h-20 w-20 items-center justify-center rounded-2xl text-4xl"
                style={{ backgroundColor: `${tierColor}20` }}
              >
                {narrative?.icon}
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">
                    {master.name}
                  </h1>
                  {master.isVerified && (
                    <svg
                      className="h-6 w-6 text-base-blue"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>

                <div className="mt-1 flex items-center gap-3">
                  <span
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: `${tierColor}20`,
                      color: tierColor,
                    }}
                  >
                    {getTierLabel(master.tier)}
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: narrative?.color }}
                  >
                    {narrative?.name}
                  </span>
                </div>

                {master.description && (
                  <p className="mt-3 max-w-lg text-sm text-white/60">
                    {master.description}
                  </p>
                )}

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {master.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/40"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Address */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="font-mono text-xs text-white/30">
                    {master.address.slice(0, 8)}...{master.address.slice(-6)}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(master.address)}
                    className="text-white/30 hover:text-white/60"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleFollow}
                disabled={!userAddress || followLoading}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isFollowing
                    ? 'bg-base-blue text-white'
                    : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {isFollowing ? (
                  <>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Following
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Follow
                  </>
                )}
              </button>
              
              <button
                onClick={handleEmulate}
                className="btn-primary flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Emulate Strategy
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <QuickStat
              label="Followers"
              value={master.followerCount.toLocaleString()}
            />
            <QuickStat
              label="Emulators"
              value={master.emulatorCount.toLocaleString()}
            />
            <QuickStat
              label="7D Return"
              value={formatScore(master.performance.return7D)}
              isReturn
              returnValue={master.performance.return7D}
            />
            <QuickStat
              label="Sharpe Ratio"
              value={master.performance.sharpeRatio.toFixed(2)}
            />
            <QuickStat
              label="Risk Level"
              value={getRiskLevelLabel(narrative?.riskLevel || 'medium')}
              color={getRiskLevelColor(narrative?.riskLevel || 'medium')}
            />
          </div>
        </div>

        {/* Content grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Portfolio Performance Chart */}
            <PerformanceChart address={master.address} height={250} />
            
            <MasterPerformance performance={master.performance} />
            
            {/* Strategy insights */}
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
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Strategy Insights
              </h3>
              
              <div className="space-y-4">
                <InsightCard
                  title="Portfolio Composition"
                  description={`${master.name} holds ${master.holdings.length} assets with ${master.holdings[0]?.symbol} as the dominant position at ${master.holdings[0]?.percentage}%.`}
                />
                <InsightCard
                  title="Trading Style"
                  description={`With a ${master.performance.winRate}% win rate and average holding period of ${master.performance.avgHoldingPeriod} days, this master favors ${master.performance.avgHoldingPeriod > 14 ? 'longer-term positions' : 'active trading'}.`}
                />
                <InsightCard
                  title="Risk Profile"
                  description={`Maximum drawdown of ${master.performance.maxDrawdown.toFixed(1)}% indicates ${master.performance.maxDrawdown > 40 ? 'aggressive' : master.performance.maxDrawdown > 20 ? 'moderate' : 'conservative'} risk tolerance. Volatility is ${master.performance.volatility > 60 ? 'high' : master.performance.volatility > 30 ? 'moderate' : 'low'} at ${master.performance.volatility.toFixed(0)}%.`}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <MasterHoldings holdings={master.holdings} />
            
            {/* Emulate CTA */}
            <div className="rounded-2xl border border-base-blue/20 bg-gradient-to-br from-base-blue/10 to-purple-600/10 p-6 text-center">
              <h3 className="text-lg font-bold text-white">
                Ready to Learn?
              </h3>
              <p className="mt-2 text-sm text-white/60">
                Start with this master&apos;s strategy as a template
              </p>
              <button
                onClick={handleEmulate}
                className="mt-4 w-full btn-primary"
              >
                Emulate This Strategy
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function QuickStat({
  label,
  value,
  isReturn = false,
  returnValue,
  color,
}: {
  label: string;
  value: string;
  isReturn?: boolean;
  returnValue?: number;
  color?: string;
}) {
  const textColor = color
    ? color
    : isReturn && returnValue !== undefined
    ? returnValue >= 0
      ? '#10B981'
      : '#EF4444'
    : '#FFFFFF';

  return (
    <div className="rounded-xl bg-white/[0.03] p-3 text-center">
      <div className="text-xs text-white/40">{label}</div>
      <div className="mt-1 text-lg font-bold" style={{ color: textColor }}>
        {value}
      </div>
    </div>
  );
}

function InsightCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.03] p-4">
      <h4 className="font-medium text-white">{title}</h4>
      <p className="mt-1 text-sm text-white/50">{description}</p>
    </div>
  );
}




