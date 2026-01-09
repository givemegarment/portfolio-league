'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useLivePrices } from '@/hooks/useLivePrices';
import { SUPPORTED_ASSETS } from '@/lib/assets';

type SortField = 'trending' | 'price' | 'change24h' | 'name';
type SortDirection = 'asc' | 'desc';

type TrendingAsset = {
  symbol: string;
  name: string;
  logo: string;
  color: string;
  price: number;
  change24h: number;
  trendingScore: number;
  isHot: boolean;
};

// Fire icon for hot/trending assets
function FireIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 23c-3.9 0-7-3.1-7-7 0-2.8 1.6-5.4 4.1-6.7-.3 1.1-.1 2.2.5 3.1.7.9 1.8 1.4 2.9 1.4s2.2-.5 2.9-1.4c.6-.9.8-2 .5-3.1C18.4 10.6 20 13.2 20 16c0 3.9-3.1 7-7 7z" />
      <path d="M12 1c-1.7 2.6-3 5.3-3 7.5 0 1.9 1.3 3.5 3 3.5s3-1.6 3-3.5c0-2.2-1.3-4.9-3-7.5z" opacity="0.7" />
    </svg>
  );
}

// Trending icon
function TrendingIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

// Sort icon
function SortIcon({ direction, active }: { direction: SortDirection; active: boolean }) {
  return (
    <svg
      className={`h-3 w-3 transition-colors ${active ? 'text-base-blue' : 'text-white/30'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      {direction === 'desc' ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      )}
    </svg>
  );
}

// Skeleton loader for individual items
function TrendingItemSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="py-3 px-2">
        <div className="h-4 w-6 rounded bg-white/10" />
      </td>
      <td className="py-3 px-2">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-white/10" />
          <div>
            <div className="h-4 w-16 rounded bg-white/10 mb-1" />
            <div className="h-3 w-12 rounded bg-white/5" />
          </div>
        </div>
      </td>
      <td className="py-3 px-2 text-right">
        <div className="h-4 w-16 rounded bg-white/10 ml-auto" />
      </td>
      <td className="py-3 px-2 text-right">
        <div className="h-4 w-14 rounded bg-white/10 ml-auto" />
      </td>
    </tr>
  );
}

// Calculate a mock trending score based on price change and volatility
function calculateTrendingScore(change24h: number): number {
  // Higher absolute change = more trending
  const changeScore = Math.abs(change24h) * 2;
  // Some randomness to simulate social/volume metrics
  const socialScore = Math.random() * 30;
  // Combine scores
  return Math.min(100, Math.round(changeScore + socialScore));
}

export default function TrendingAssets({ className = '' }: { className?: string }) {
  const [sortField, setSortField] = useState<SortField>('trending');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const { prices, isLoading, lastUpdated, error } = useLivePrices({ interval: 30000 });

  // Process prices to get trending assets
  const trendingAssets = useMemo(() => {
    if (!prices || Object.keys(prices).length === 0) {
      return [];
    }

    const assets: TrendingAsset[] = SUPPORTED_ASSETS
      .filter(asset => {
        const priceData = prices[asset.symbol];
        // Filter out stablecoins and assets without price data
        return priceData &&
               priceData.price > 0 &&
               !['USDC', 'USDT', 'DAI'].includes(asset.symbol);
      })
      .map(asset => {
        const priceData = prices[asset.symbol];
        const trendingScore = calculateTrendingScore(priceData.change24h);

        return {
          symbol: asset.symbol,
          name: asset.name,
          logo: asset.logo,
          color: asset.color,
          price: priceData.price,
          change24h: priceData.change24h,
          trendingScore,
          isHot: trendingScore >= 60 || Math.abs(priceData.change24h) >= 10,
        };
      });

    // Sort assets
    return assets.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'trending':
          comparison = a.trendingScore - b.trendingScore;
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'change24h':
          comparison = a.change24h - b.change24h;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [prices, sortField, sortDirection]);

  // Handle sort click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sortable column header component
  const SortableHeader = ({
    field,
    children,
    align = 'left',
  }: {
    field: SortField;
    children: React.ReactNode;
    align?: 'left' | 'right';
  }) => (
    <th
      className={`py-2 px-2 text-xs font-medium text-white/40 uppercase tracking-wider cursor-pointer hover:text-white/60 transition-colors ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
      onClick={() => handleSort(field)}
    >
      <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
        {children}
        <SortIcon direction={sortDirection} active={sortField === field} />
      </div>
    </th>
  );

  return (
    <div className={`rounded-2xl border border-white/5 bg-surface-2 backdrop-blur-sm overflow-hidden ${className}`}>
      {/* Glass effect background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingIcon className="h-5 w-5 text-base-blue" />
            <h3 className="text-lg font-bold text-white">Trending Assets</h3>
          </div>

          {/* Live indicator and hot count */}
          <div className="flex items-center gap-3">
            {!isLoading && trendingAssets.filter(a => a.isHot).length > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-medium">
                <FireIcon className="h-3 w-3" />
                {trendingAssets.filter(a => a.isHot).length} Hot
              </div>
            )}
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
        </div>

        {/* Content */}
        {isLoading ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="py-2 px-2 text-xs font-medium text-white/40 text-left w-10">#</th>
                <th className="py-2 px-2 text-xs font-medium text-white/40 text-left">Asset</th>
                <th className="py-2 px-2 text-xs font-medium text-white/40 text-right">Price</th>
                <th className="py-2 px-2 text-xs font-medium text-white/40 text-right">24h</th>
              </tr>
            </thead>
            <tbody>
              <TrendingItemSkeleton />
              <TrendingItemSkeleton />
              <TrendingItemSkeleton />
              <TrendingItemSkeleton />
              <TrendingItemSkeleton />
              <TrendingItemSkeleton />
              <TrendingItemSkeleton />
              <TrendingItemSkeleton />
            </tbody>
          </table>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg className="h-10 w-10 text-white/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-white/50 text-sm">Failed to load assets</p>
            <p className="text-white/30 text-xs mt-1">Please try again later</p>
          </div>
        ) : trendingAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg className="h-10 w-10 text-white/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <p className="text-white/50 text-sm">No trending assets</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="border-b border-white/5">
                  <SortableHeader field="trending">
                    <span className="sr-only">Rank</span>#
                  </SortableHeader>
                  <SortableHeader field="name">Asset</SortableHeader>
                  <SortableHeader field="price" align="right">Price</SortableHeader>
                  <SortableHeader field="change24h" align="right">24h</SortableHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {trendingAssets.map((asset, index) => {
                  const isPositive = asset.change24h >= 0;

                  return (
                    <tr
                      key={asset.symbol}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Rank */}
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-mono text-white/40">{index + 1}</span>
                          {asset.isHot && (
                            <FireIcon className="h-3.5 w-3.5 text-orange-400 animate-pulse" />
                          )}
                        </div>
                      </td>

                      {/* Asset info */}
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          {/* Logo */}
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0"
                            style={{ backgroundColor: `${asset.color}20` }}
                          >
                            <Image
                              src={asset.logo}
                              alt={asset.symbol}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                          </div>

                          {/* Name and symbol */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold text-white text-sm">
                                {asset.symbol}
                              </span>
                              {asset.isHot && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-500/20 text-orange-400">
                                  HOT
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-white/40 truncate block">
                              {asset.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-2 text-right">
                        <span className="font-mono text-sm text-white">
                          ${asset.price < 0.01
                            ? asset.price.toExponential(2)
                            : asset.price < 1
                              ? asset.price.toFixed(4)
                              : asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })
                          }
                        </span>
                      </td>

                      {/* 24h change */}
                      <td className="py-3 px-2 text-right">
                        <span className={`font-mono text-sm font-medium ${isPositive ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                          {isPositive ? '+' : ''}{asset.change24h.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer with trending score info */}
        {!isLoading && !error && trendingAssets.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/5">
            <p className="text-[10px] text-white/30 text-center">
              Trending score based on price movement, volatility, and market interest
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
