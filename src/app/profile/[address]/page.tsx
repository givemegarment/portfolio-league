'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Nav from '@/components/chrome/Nav';
import UserProfile from '@/components/profile/UserProfile';
import PortfolioMetrics from '@/components/portfolio/PortfolioMetrics';
import PortfolioAnalytics from '@/components/analytics/PortfolioAnalytics';
import WeeklyPerformanceStats from '@/components/analytics/WeeklyPerformanceStats';
import TransactionHistory from '@/components/portfolio/TransactionHistory';
import AchievementDetails from '@/components/achievements/AchievementDetails';

export default function ProfilePage() {
  const params = useParams();
  const address = params.address as string;
  const [currentUserAddress, setCurrentUserAddress] = useState<string | undefined>();
  const [portfolio, setPortfolio] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setCurrentUserAddress(accounts[0]);
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!address) return;
      
      try {
        const response = await fetch(`/api/portfolio?address=${address}`);
        if (response.ok) {
          const data = await response.json();
          setPortfolio(data.portfolio);
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      }
    };

    fetchPortfolio();
  }, [address]);

  if (!address) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-4xl px-4 pb-24 pt-8">
          <div className="text-center text-white/50">Invalid address</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Nav />
      
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-8">
        <div className="space-y-6">
          {/* Profile Header */}
          <UserProfile 
            address={address} 
            currentUserAddress={currentUserAddress}
            showFullDetails={true}
          />

          {/* Portfolio Metrics */}
          {portfolio && (
            <PortfolioMetrics
              address={address as `0x${string}`}
              allocations={portfolio.allocations || []}
              entryPrices={portfolio.entryPrices || {}}
              showHistory={true}
            />
          )}

          {/* Analytics */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Analytics</h2>
            <PortfolioAnalytics address={address} />
          </div>

          {/* Weekly Stats */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Weekly Performance</h2>
            <WeeklyPerformanceStats address={address} />
          </div>

          {/* Transaction History */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Transaction History</h2>
            <TransactionHistory address={address} />
          </div>

          {/* Achievement Details */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h2 className="text-2xl font-bold text-white mb-6">All Achievements</h2>
            <AchievementDetails address={address} />
          </div>
        </div>
        
        {/* Back to main */}
        <div className="mt-8 text-center">
          <a 
            href="/"
            className="inline-flex items-center gap-2 text-base-blue hover:text-base-blue-light transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Imitatio
          </a>
        </div>
      </main>
    </div>
  );
}
