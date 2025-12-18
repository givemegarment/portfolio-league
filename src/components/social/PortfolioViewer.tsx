'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAsset } from '@/lib/assets';
import FollowButton from './FollowButton';
import CopyTradeButton from './CopyTradeButton';

type Props = {
  address: string;
  currentUserAddress?: string;
  className?: string;
};

type PortfolioData = {
  allocations: Array<{ symbol: string; percentage: number }>;
  entryPrices: Record<string, number>;
  timestamp: number;
  score?: number;
  rank?: number;
};

export default function PortfolioViewer({
  address,
  currentUserAddress,
  className = '',
}: Props) {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/portfolio?address=${address}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio');
        }

        const data = await response.json();
        if (data.portfolio) {
          setPortfolio(data.portfolio);
        }
      } catch (err) {
        console.error('Error fetching portfolio:', err);
        setError(err instanceof Error ? err.message : 'Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      fetchPortfolio();
    }
  }, [address]);

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

  if (error || !portfolio) {
    return (
      <div className={`rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center ${className}`}>
        <p className="text-sm text-white/60">{error || 'No portfolio found'}</p>
      </div>
    );
  }

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className={`rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-gradient-to-br from-base-blue/10 to-purple-600/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Link
              href={`/profile/${address}`}
              className="font-mono text-lg font-bold text-white hover:text-base-blue transition-colors"
            >
              {shortAddress}
            </Link>
            {portfolio.rank && (
              <div className="text-sm text-white/60 mt-1">
                Rank: #{portfolio.rank}
              </div>
            )}
          </div>
          
          {currentUserAddress && (
            <div className="flex items-center gap-2">
              <FollowButton
                address={currentUserAddress}
                targetAddress={address}
              />
              <CopyTradeButton
                fromAddress={address}
                toAddress={currentUserAddress}
              />
            </div>
          )}
        </div>

        {portfolio.score !== undefined && (
          <div className={`text-2xl font-bold font-mono ${portfolio.score >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
            {portfolio.score >= 0 ? '+' : ''}{portfolio.score.toFixed(2)}%
          </div>
        )}
      </div>

      {/* Portfolio Allocations */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Portfolio Allocations</h3>
        <div className="space-y-2">
          {portfolio.allocations.map((allocation) => {
            const asset = getAsset(allocation.symbol);
            const entryPrice = portfolio.entryPrices[allocation.symbol] || 0;

            return (
              <div
                key={allocation.symbol}
                className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5"
              >
                <div className="flex items-center gap-3">
                  {asset?.logo && (
                    <Image
                      src={asset.logo}
                      alt={allocation.symbol}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <div className="font-mono font-bold text-white">{allocation.symbol}</div>
                    {entryPrice > 0 && (
                      <div className="text-xs text-white/40 font-mono">
                        Entry: ${entryPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-white">
                    {allocation.percentage}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
