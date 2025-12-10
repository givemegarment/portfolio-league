'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getAsset } from '@/lib/assets';

type Allocation = {
  symbol: string;
  percentage: number;
};

type Portfolio = {
  user: string;
  score: number;
  rank: number;
  allocations: Allocation[];
};

type Props = {
  yourAddress?: string;
  compareAddress: string;
  onClose?: () => void;
};

function shortenAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function AllocationBar({ allocations, label }: { allocations: Allocation[]; label: string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">{label}</p>
      <div className="h-10 rounded-xl overflow-hidden flex">
        {allocations
          .filter(a => a.percentage > 0)
          .map((a, idx) => {
            const asset = getAsset(a.symbol);
            return (
              <div
                key={a.symbol}
                className="h-full flex items-center justify-center text-xs font-bold text-white transition-all"
                style={{
                  width: `${a.percentage}%`,
                  backgroundColor: asset?.color || '#666',
                  marginLeft: idx > 0 ? '2px' : 0,
                }}
              >
                {a.percentage >= 20 && a.symbol}
              </div>
            );
          })}
      </div>
    </div>
  );
}

function AllocationList({ allocations }: { allocations: Allocation[] }) {
  return (
    <div className="space-y-2">
      {allocations.map((a) => {
        const asset = getAsset(a.symbol);
        return (
          <div
            key={a.symbol}
            className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: `${asset?.color}20` }}
            >
              {asset?.logo && (
                <Image
                  src={asset.logo}
                  alt={a.symbol}
                  width={20}
                  height={20}
                  className="rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}
            </div>
            <div className="flex-1">
              <span className="font-mono font-medium text-white">{a.symbol}</span>
              <span className="ml-2 text-white/40">{asset?.name}</span>
            </div>
            <span className="font-mono font-bold text-white">{a.percentage}%</span>
          </div>
        );
      })}
    </div>
  );
}

export default function PortfolioCompare({ yourAddress, compareAddress, onClose }: Props) {
  const [yourPortfolio, setYourPortfolio] = useState<Portfolio | null>(null);
  const [theirPortfolio, setTheirPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolios = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch leaderboard to get both portfolios
        const response = await fetch('/api/leaderboard?limit=200');
        if (!response.ok) throw new Error('Failed to fetch leaderboard');

        const leaderboard: Portfolio[] = await response.json();

        // Find both portfolios
        if (yourAddress) {
          const yours = leaderboard.find(
            (p) => p.user.toLowerCase() === yourAddress.toLowerCase()
          );
          if (yours) setYourPortfolio(yours);
        }

        const theirs = leaderboard.find(
          (p) => p.user.toLowerCase() === compareAddress.toLowerCase()
        );
        if (theirs) {
          setTheirPortfolio(theirs);
        } else {
          setError('Player not found in current leaderboard');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load portfolios');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, [yourAddress, compareAddress]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-surface-2 p-8">
        <div className="flex items-center justify-center gap-3">
          <svg className="h-6 w-6 animate-spin text-base-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-white/60">Loading portfolios...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-accent-rose/20 bg-accent-rose/5 p-8 text-center">
        <svg className="mx-auto h-10 w-10 text-accent-rose/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="mt-3 text-accent-rose">{error}</p>
        {onClose && (
          <button onClick={onClose} className="mt-4 text-sm text-white/40 hover:text-white/60">
            Go back
          </button>
        )}
      </div>
    );
  }

  const scoreDiff = yourPortfolio && theirPortfolio 
    ? yourPortfolio.score - theirPortfolio.score 
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Portfolio Comparison</h2>
          <p className="text-sm text-white/50">See how your picks stack up</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Score Comparison */}
      <div className="grid grid-cols-3 gap-4 rounded-2xl border border-white/5 bg-surface-2 p-6">
        {/* Your Score */}
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-white/40">
            {yourPortfolio ? 'You' : 'Your Portfolio'}
          </p>
          {yourPortfolio ? (
            <>
              <p className={`mt-2 text-3xl font-bold font-mono ${yourPortfolio.score >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                {yourPortfolio.score >= 0 ? '+' : ''}{yourPortfolio.score.toFixed(2)}%
              </p>
              <p className="mt-1 text-sm text-white/40">Rank #{yourPortfolio.rank}</p>
            </>
          ) : (
            <p className="mt-2 text-lg text-white/40">Not entered</p>
          )}
        </div>

        {/* VS */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
            <span className="text-lg font-bold text-white/40">VS</span>
          </div>
          {scoreDiff !== null && (
            <p className={`mt-2 text-sm font-mono font-medium ${scoreDiff > 0 ? 'text-accent-emerald' : scoreDiff < 0 ? 'text-accent-rose' : 'text-white/40'}`}>
              {scoreDiff > 0 ? '+' : ''}{scoreDiff.toFixed(2)}%
            </p>
          )}
        </div>

        {/* Their Score */}
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-white/40">
            {shortenAddress(compareAddress)}
          </p>
          {theirPortfolio ? (
            <>
              <p className={`mt-2 text-3xl font-bold font-mono ${theirPortfolio.score >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                {theirPortfolio.score >= 0 ? '+' : ''}{theirPortfolio.score.toFixed(2)}%
              </p>
              <p className="mt-1 text-sm text-white/40">Rank #{theirPortfolio.rank}</p>
            </>
          ) : (
            <p className="mt-2 text-lg text-white/40">Not found</p>
          )}
        </div>
      </div>

      {/* Allocation Comparison */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Your Allocations */}
        <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-base-blue/20 text-sm font-bold text-base-blue">
              You
            </div>
            <div>
              <p className="font-medium text-white">Your Portfolio</p>
              {yourPortfolio && (
                <p className="text-xs text-white/40">{shortenAddress(yourAddress || '')}</p>
              )}
            </div>
          </div>
          
          {yourPortfolio ? (
            <>
              <AllocationBar allocations={yourPortfolio.allocations} label="Allocation" />
              <div className="mt-4">
                <AllocationList allocations={yourPortfolio.allocations} />
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center">
              <p className="text-white/40">Connect wallet to compare your portfolio</p>
            </div>
          )}
        </div>

        {/* Their Allocations */}
        <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-sm font-bold text-purple-400">
              #
            </div>
            <div>
              <p className="font-medium text-white">Opponent Portfolio</p>
              <p className="text-xs text-white/40">{shortenAddress(compareAddress)}</p>
            </div>
          </div>

          {theirPortfolio ? (
            <>
              <AllocationBar allocations={theirPortfolio.allocations} label="Allocation" />
              <div className="mt-4">
                <AllocationList allocations={theirPortfolio.allocations} />
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center">
              <p className="text-white/40">Portfolio not found</p>
            </div>
          )}
        </div>
      </div>

      {/* Common Assets */}
      {yourPortfolio && theirPortfolio && (
        <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Analysis</h3>
          
          {(() => {
            const yourSymbols = yourPortfolio.allocations.map(a => a.symbol);
            const theirSymbols = theirPortfolio.allocations.map(a => a.symbol);
            const theirSymbolsSet = new Set(theirSymbols);
            const yourSymbolsSet = new Set(yourSymbols);
            const common = yourSymbols.filter(s => theirSymbolsSet.has(s));
            const onlyYou = yourSymbols.filter(s => !theirSymbolsSet.has(s));
            const onlyThem = theirSymbols.filter(s => !yourSymbolsSet.has(s));

            return (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-white/[0.02] p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-white/40 mb-2">Common Picks</p>
                  <div className="flex flex-wrap gap-2">
                    {common.length > 0 ? common.map(s => (
                      <span key={s} className="rounded-full bg-accent-emerald/20 px-2 py-1 text-xs font-mono text-accent-emerald">
                        {s}
                      </span>
                    )) : (
                      <span className="text-xs text-white/40">None</span>
                    )}
                  </div>
                </div>
                <div className="rounded-xl bg-white/[0.02] p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-white/40 mb-2">Only You Have</p>
                  <div className="flex flex-wrap gap-2">
                    {onlyYou.length > 0 ? onlyYou.map(s => (
                      <span key={s} className="rounded-full bg-base-blue/20 px-2 py-1 text-xs font-mono text-base-blue">
                        {s}
                      </span>
                    )) : (
                      <span className="text-xs text-white/40">None</span>
                    )}
                  </div>
                </div>
                <div className="rounded-xl bg-white/[0.02] p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-white/40 mb-2">Only They Have</p>
                  <div className="flex flex-wrap gap-2">
                    {onlyThem.length > 0 ? onlyThem.map(s => (
                      <span key={s} className="rounded-full bg-purple-600/20 px-2 py-1 text-xs font-mono text-purple-400">
                        {s}
                      </span>
                    )) : (
                      <span className="text-xs text-white/40">None</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
