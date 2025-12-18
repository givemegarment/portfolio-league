'use client';

import { useState, useEffect } from 'react';
import LivePortfolioChart from './LivePortfolioChart';
import PlayerStatsCard from './PlayerStatsCard';
import PerformanceChart from './PerformanceChart';
import PortfolioHistory from './PortfolioHistory';
import AssetPerformanceChart from './AssetPerformanceChart';
import TransactionHistory from './TransactionHistory';
import PortfolioAnalytics from '@/components/analytics/PortfolioAnalytics';
import WeeklyPerformanceStats from '@/components/analytics/WeeklyPerformanceStats';

type Allocation = {
  symbol: string;
  percentage: number;
};

type Props = {
  address?: `0x${string}`;
  allocations?: Allocation[];
  entryPrices?: Record<string, number>;
  showHistory?: boolean;
};

type Tab = 'overview' | 'performance' | 'assets' | 'analytics' | 'weekly' | 'transactions' | 'history';

export default function PortfolioMetrics({ 
  address, 
  allocations = [], 
  entryPrices = {},
  showHistory = true,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: { id: Tab; label: string; icon: JSX.Element }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
    },
    {
      id: 'assets',
      label: 'Assets',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'weekly',
      label: 'Weekly',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'history',
      label: 'History',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-white/[0.02] border border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === tab.id 
                ? 'bg-base-blue text-white shadow-lg shadow-base-blue/20' 
                : 'text-white/50 hover:text-white hover:bg-white/5'
              }
            `}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Live Portfolio Chart */}
            <LivePortfolioChart 
              allocations={allocations}
              entryPrices={entryPrices}
              animated
            />
            
            {/* Player Stats */}
            {address && (
              <PlayerStatsCard address={address} />
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Performance Chart */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <h3 className="text-lg font-bold text-white">Portfolio Performance</h3>
                <p className="text-xs text-white/40">Track your returns over time with benchmark comparison</p>
              </div>
              <div className="p-6">
                <PerformanceChart 
                  address={address}
                  height={300}
                  showAxis
                  showTooltip
                  showGradient
                  showTimeRange
                  showBenchmark
                />
              </div>
            </div>

            {/* Quick Stats */}
            {address && (
              <PlayerStatsCard address={address} compact />
            )}
          </div>
        )}

        {activeTab === 'assets' && (
          <AssetPerformanceChart
            allocations={allocations}
            entryPrices={entryPrices}
          />
        )}

        {activeTab === 'analytics' && address && (
          <PortfolioAnalytics address={address} />
        )}

        {activeTab === 'weekly' && address && (
          <WeeklyPerformanceStats address={address} />
        )}

        {activeTab === 'transactions' && address && (
          <TransactionHistory address={address} />
        )}

        {activeTab === 'history' && showHistory && (
          <PortfolioHistory address={address} />
        )}
      </div>
    </div>
  );
}




