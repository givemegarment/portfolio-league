'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useLivePrices, type PriceData } from '@/hooks/useLivePrices';
import { SUPPORTED_ASSETS, getAsset } from '@/lib/assets';

type MoverItem = {
  symbol: string;
  name: string;
  logo: string;
  color: string;
  price: number;
  change24h: number;
  sparklineData: number[];
};

type TabType = 'gainers' | 'losers';

// Generate mock sparkline data based on the 24h change direction
function generateSparklineData(change24h: number): number[] {
  const points = 12;
  const data: number[] = [];
  const trend = change24h >= 0 ? 1 : -1;
  let value = 50;

  for (let i = 0; i < points; i++) {
    // Add some randomness but follow the trend
    const noise = (Math.random() - 0.5) * 20;
    const trendFactor = trend * (i / points) * Math.abs(change24h) * 0.5;
    value = Math.max(10, Math.min(90, 50 + trendFactor + noise));
    data.push(value);
  }

  return data;
}

// Mini sparkline SVG component
function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const width = 60;
  const height = 24;
  const padding = 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const strokeColor = positive ? '#10B981' : '#EF4444';
  const fillId = `sparkline-gradient-${positive ? 'up' : 'down'}`;

  // Create area path for gradient fill
  const firstPoint = data[0];
  const lastPoint = data[data.length - 1];
  const areaPoints = `${padding},${height} ${points} ${width - padding},${height}`;

  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <defs>
        <linearGradient id={fillId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${fillId})`} />
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Skeleton loader for individual items
function MoverItemSkeleton() {
  return (
    <div className="flex items-center justify-between py-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-white/10" />
        <div>
          <div className="h-4 w-12 rounded bg-white/10 mb-1" />
          <div className="h-3 w-16 rounded bg-white/5" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-6 w-[60px] rounded bg-white/5" />
        <div className="text-right">
          <div className="h-4 w-16 rounded bg-white/10 mb-1" />
          <div className="h-3 w-12 rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}

// Individual mover item component
function MoverItemRow({ item, rank }: { item: MoverItem; rank: number }) {
  const isPositive = item.change24h >= 0;

  return (
    <div className="group flex items-center justify-between py-3 transition-colors hover:bg-white/[0.02] rounded-lg px-2 -mx-2">
      <div className="flex items-center gap-3">
        {/* Rank indicator */}
        <div className="w-5 text-center">
          <span className="text-xs font-mono text-white/40">{rank}</span>
        </div>

        {/* Coin logo */}
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: `${item.color}20` }}
        >
          <Image
            src={item.logo}
            alt={item.symbol}
            width={20}
            height={20}
            className="rounded-full"
          />
        </div>

        {/* Symbol and name */}
        <div>
          <div className="font-mono font-semibold text-white text-sm">
            {item.symbol}
          </div>
          <div className="text-xs text-white/40 truncate max-w-[80px]">
            {item.name}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Sparkline */}
        <MiniSparkline data={item.sparklineData} positive={isPositive} />

        {/* Price and change */}
        <div className="text-right min-w-[80px]">
          <div className="font-mono text-sm text-white">
            ${item.price < 0.01
              ? item.price.toExponential(2)
              : item.price < 1
                ? item.price.toFixed(4)
                : item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })
            }
          </div>
          <div className={`text-xs font-mono font-medium ${isPositive ? 'text-accent-emerald' : 'text-accent-rose'}`}>
            {isPositive ? '+' : ''}{item.change24h.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TopMoversWidget({ className = '' }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<TabType>('gainers');
  const { prices, isLoading, lastUpdated, error } = useLivePrices({ interval: 30000 });

  // Process prices to get top movers
  const { gainers, losers } = useMemo(() => {
    if (!prices || Object.keys(prices).length === 0) {
      return { gainers: [], losers: [] };
    }

    const movers: MoverItem[] = SUPPORTED_ASSETS
      .filter(asset => {
        const priceData = prices[asset.symbol];
        // Filter out stablecoins and assets without price data
        return priceData &&
               priceData.price > 0 &&
               !['USDC', 'USDT', 'DAI'].includes(asset.symbol);
      })
      .map(asset => {
        const priceData = prices[asset.symbol];
        return {
          symbol: asset.symbol,
          name: asset.name,
          logo: asset.logo,
          color: asset.color,
          price: priceData.price,
          change24h: priceData.change24h,
          sparklineData: generateSparklineData(priceData.change24h),
        };
      });

    // Sort and get top gainers
    const sortedGainers = [...movers]
      .sort((a, b) => b.change24h - a.change24h)
      .slice(0, 5);

    // Sort and get top losers
    const sortedLosers = [...movers]
      .sort((a, b) => a.change24h - b.change24h)
      .slice(0, 5);

    return { gainers: sortedGainers, losers: sortedLosers };
  }, [prices]);

  const activeMovers = activeTab === 'gainers' ? gainers : losers;

  return (
    <div className={`rounded-2xl border border-white/5 bg-surface-2 backdrop-blur-sm overflow-hidden ${className}`}>
      {/* Glass effect background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-base-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h3 className="text-lg font-bold text-white">Top Movers</h3>
          </div>

          {/* Live indicator */}
          {lastUpdated && !isLoading && (
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <div className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-emerald opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-emerald"></span>
              </div>
              Live
            </div>
          )}
        </div>

        {/* Tab selector */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] mb-4">
          <button
            onClick={() => setActiveTab('gainers')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'gainers'
                ? 'bg-accent-emerald/20 text-accent-emerald'
                : 'text-white/50 hover:text-white/70 hover:bg-white/[0.03]'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Gainers
          </button>
          <button
            onClick={() => setActiveTab('losers')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'losers'
                ? 'bg-accent-rose/20 text-accent-rose'
                : 'text-white/50 hover:text-white/70 hover:bg-white/[0.03]'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            Losers
          </button>
        </div>

        {/* Content */}
        <div className="space-y-1">
          {isLoading ? (
            // Loading skeletons
            <>
              <MoverItemSkeleton />
              <MoverItemSkeleton />
              <MoverItemSkeleton />
              <MoverItemSkeleton />
              <MoverItemSkeleton />
            </>
          ) : error ? (
            // Error state
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg className="h-10 w-10 text-white/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-white/50 text-sm">Failed to load prices</p>
              <p className="text-white/30 text-xs mt-1">Please try again later</p>
            </div>
          ) : activeMovers.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg className="h-10 w-10 text-white/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-white/50 text-sm">No data available</p>
            </div>
          ) : (
            // Mover items
            activeMovers.map((item, index) => (
              <MoverItemRow key={item.symbol} item={item} rank={index + 1} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
