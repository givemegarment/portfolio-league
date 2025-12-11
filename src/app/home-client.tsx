'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import PortfolioBuilder from '@/components/portfolio/PortfolioBuilder';
import LeaderboardPreview from '@/components/leaderboard/LeaderboardPreview';
import Nav from '@/components/chrome/Nav';
import TutorialModal from '@/components/onboarding/TutorialModal';
import HomePageSkeleton from '@/components/home/HomePageSkeleton';
import CountdownTimer from '@/components/home/CountdownTimer';
import PastWinners from '@/components/home/PastWinners';
import ErrorBoundary from '@/components/ErrorBoundary';

type Stats = {
  totalPlayers: number;
  prizePool: number;
  weekNumber: number;
  season: number;
};

function StatCard({
  label,
  value,
  icon,
  delay,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  delay: number;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-base-blue/10 text-base-blue">
        {icon}
      </div>
      <div>
        <div className="text-lg font-bold text-white">{value}</div>
        <div className="text-xs text-white/40">{label}</div>
      </div>
    </div>
  );
}

function HowItWorksStep({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="relative">
      {step < 4 && (
        <div className="absolute left-6 top-14 h-full w-px bg-gradient-to-b from-white/10 to-transparent hidden sm:block" />
      )}

      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-base-blue to-purple-600 text-lg font-bold text-white shadow-lg shadow-base-blue/20">
          {step}
        </div>
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-white/50">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomeClient() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalPlayers: 0,
    prizePool: 1000,
    weekNumber: 1,
    season: 1,
  });
  const { address, isConnected } = useAccount();

  // Store referral code from URL parameter
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
      // Store in localStorage for later tracking
      localStorage.setItem('imitatio_ref', refCode);
      
      // Clean URL without losing other params
      urlParams.delete('ref');
      const newUrl = urlParams.toString() 
        ? `${window.location.pathname}?${urlParams.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    
    // Fetch dynamic stats
    const fetchStats = async () => {
      try {
        // Fetch all data in parallel
        const [leaderboardRes, portfolioRes, configRes] = await Promise.all([
          fetch('/api/leaderboard?limit=100'),
          fetch('/api/portfolio?address=0x0000000000000000000000000000000000000000'),
          fetch('/api/config'),
        ]);
        
        const [leaderboardData, portfolioData, configData] = await Promise.all([
          leaderboardRes.json(),
          portfolioRes.json(),
          configRes.json(),
        ]);
        
        setStats(prev => ({
          ...prev,
          totalPlayers: Array.isArray(leaderboardData) ? leaderboardData.length : 0,
          weekNumber: portfolioData.weekInfo?.week || prev.weekNumber,
          season: parseInt(portfolioData.weekInfo?.season?.replace('s', '') || '1'),
          prizePool: configData.calculatedPrizePool || prev.prizePool,
        }));
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  if (!mounted) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="min-h-screen">
      <ErrorBoundary name="Nav">
        <Nav />
      </ErrorBoundary>
      <TutorialModal />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero Section */}
        <section className="relative mb-12 overflow-hidden rounded-3xl border border-white/5 bg-surface-2 p-8 sm:p-12">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-base-blue/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-base-blue/10 px-3 py-1 text-xs font-medium text-base-blue animate-fade-in-down">
              <div className="h-1.5 w-1.5 rounded-full bg-base-blue animate-pulse" />
              Season {stats.season} • Week {stats.weekNumber} Live
            </div>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl animate-fade-in-up">
              Pick. Compete.{' '}
              <span className="text-gradient">Win.</span>
            </h1>

            <p
              className="mt-4 max-w-xl text-lg text-white/60 animate-fade-in-up"
              style={{ animationDelay: '100ms' }}
            >
              Select 3 crypto assets each week. Compete against other traders.
              Top 10% share the prize pool.
            </p>

            {/* Connection Status */}
            {isConnected && address && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-emerald/10 px-3 py-1.5 border border-accent-emerald/20 animate-fade-in">
                <div className="h-2 w-2 rounded-full bg-accent-emerald" />
                <span className="text-xs font-medium text-accent-emerald">
                  Connected: {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
            )}

            {/* Stats Grid */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="Players"
                value={stats.totalPlayers.toString()}
                delay={200}
                icon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                }
              />
              <StatCard
                label="Prize Pool"
                value={`$${stats.prizePool.toLocaleString()}`}
                delay={300}
                icon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
              <StatCard
                label="Top 10% Win"
                value={stats.totalPlayers > 0 ? `${Math.max(1, Math.ceil(stats.totalPlayers * 0.1))}+` : '—'}
                delay={400}
                icon={
                  <svg
                    className="h-5 w-5"
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
                }
              />
              <StatCard
                label="Assets"
                value="29"
                delay={500}
                icon={
                  <svg
                    className="h-5 w-5"
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
                }
              />
            </div>
          </div>
        </section>

        {/* Countdown Timer */}
        <section className="mb-8 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <ErrorBoundary name="CountdownTimer">
            <CountdownTimer />
          </ErrorBoundary>
        </section>

        {/* Past Winners */}
        <section className="mb-8 animate-fade-in-up" style={{ animationDelay: '175ms' }}>
          <ErrorBoundary name="PastWinners">
            <PastWinners />
          </ErrorBoundary>
        </section>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Portfolio Builder - Takes 2 columns */}
          <section
            className="lg:col-span-2 animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
              <ErrorBoundary name="PortfolioBuilder">
                <PortfolioBuilder address={address} />
              </ErrorBoundary>
            </div>
          </section>

          {/* Sidebar */}
          <aside
            className="space-y-6 animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            {/* Leaderboard */}
            <ErrorBoundary name="LeaderboardPreview">
              <LeaderboardPreview />
            </ErrorBoundary>

            {/* How It Works */}
            <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                How It Works
              </h3>

              <div className="space-y-6">
                <HowItWorksStep
                  step={1}
                  title="Pick Your Assets"
                  description="Choose from 25+ tokens including BTC, ETH, SOL, and Base ecosystem favorites"
                />
                <HowItWorksStep
                  step={2}
                  title="Lock In Picks"
                  description="Submit before Sunday 23:59 UTC"
                />
                <HowItWorksStep
                  step={3}
                  title="Track Performance"
                  description="Watch your ranking update with real prices"
                />
                <HowItWorksStep
                  step={4}
                  title="Win Prizes"
                  description="Top 10% split the weekly prize pool"
                />
              </div>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer
          className="mt-16 border-t border-white/5 pt-8 animate-fade-in"
          style={{ animationDelay: '400ms' }}
        >
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/40">Built on</span>
              <div className="flex items-center gap-1 rounded-full bg-base-blue/10 px-3 py-1 text-xs font-medium text-base-blue">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Base
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-white/30">
              <a href="/how-to-play" className="hover:text-white/60 transition-colors">
                How to Play
              </a>
              <a href="/faq" className="hover:text-white/60 transition-colors">
                FAQ
              </a>
              <a href="/terms" className="hover:text-white/60 transition-colors">
                Terms
              </a>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-white/20">
            © 2025 Imitatio. All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
}
