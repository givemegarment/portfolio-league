'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type AllocationItem = {
  symbol: string;
  percentage: number;
};

type Winner = {
  rank: number;
  address: string;
  score: number;
  allocations: AllocationItem[];
  week: number;
  season: string;
};

type WinnersResponse = {
  winners: Winner[];
  week: number;
  season: string;
  totalParticipants?: number;
  message?: string;
};

const RANK_STYLES = {
  1: {
    bg: 'bg-gradient-to-br from-amber-400 to-amber-600',
    text: 'text-black',
    shadow: 'shadow-lg shadow-amber-500/30',
    label: '1st Place',
    icon: '🥇',
  },
  2: {
    bg: 'bg-gradient-to-br from-gray-300 to-gray-400',
    text: 'text-black',
    shadow: '',
    label: '2nd Place',
    icon: '🥈',
  },
  3: {
    bg: 'bg-gradient-to-br from-amber-600 to-amber-800',
    text: 'text-white',
    shadow: '',
    label: '3rd Place',
    icon: '🥉',
  },
};

function addressToColor(address: string): string {
  const colors = [
    '#F7931A', '#627EEA', '#9945FF', '#2775CA',
    '#00D395', '#FF6B6B', '#4ECDC4', '#FFE66D',
  ];
  const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function shortenAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function WinnerCard({ winner }: { winner: Winner }) {
  const style = RANK_STYLES[winner.rank as keyof typeof RANK_STYLES] || RANK_STYLES[3];
  const avatarColor = addressToColor(winner.address);
  const isPositive = winner.score >= 0;

  return (
    <div className="relative rounded-xl border border-white/10 bg-surface-2/80 p-3 sm:p-4 transition-all hover:border-white/20 hover:bg-surface-3/80">
      {/* Rank badge */}
      <div className="absolute -top-2.5 sm:-top-3 left-3 sm:left-4">
        <div className={`flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full ${style.bg} ${style.text} ${style.shadow} text-xs sm:text-sm font-bold`}>
          {winner.rank}
        </div>
      </div>

      <div className="mt-1 sm:mt-2 flex items-center gap-2 sm:gap-3">
        {/* Avatar */}
        <div
          className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-bold text-white"
          style={{ backgroundColor: avatarColor }}
        >
          {winner.address.slice(2, 4).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-mono text-xs sm:text-sm font-medium text-white truncate">
            {shortenAddress(winner.address)}
          </div>
          <div className="text-xs text-white/40">{style.label}</div>
        </div>

        {/* Score */}
        <div className={`font-mono text-base sm:text-lg font-bold ${isPositive ? 'text-accent-emerald' : 'text-accent-rose'}`}>
          {isPositive ? '+' : ''}{winner.score.toFixed(2)}%
        </div>
      </div>

      {/* Portfolio - hidden on very small screens */}
      <div className="mt-2 sm:mt-3 flex flex-wrap gap-1 sm:gap-1.5">
        {winner.allocations.map((alloc, idx) => (
          <div
            key={`${alloc.symbol}-${idx}`}
            className="flex items-center gap-1 rounded-md bg-white/5 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs"
          >
            <Image
              src={`/coins/${alloc.symbol.toLowerCase()}.svg`}
              alt={alloc.symbol}
              width={12}
              height={12}
              className="rounded-full sm:w-[14px] sm:h-[14px]"
            />
            <span className="text-white/70">{alloc.symbol}</span>
            <span className="text-white/40 hidden sm:inline">{alloc.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-white/5 bg-surface-2 p-4">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 rounded shimmer" />
          <div className="h-3 w-16 rounded shimmer" />
        </div>
        <div className="h-6 w-20 rounded shimmer" />
      </div>
      <div className="mt-3 flex gap-1.5">
        <div className="h-6 w-16 rounded shimmer" />
        <div className="h-6 w-16 rounded shimmer" />
        <div className="h-6 w-16 rounded shimmer" />
      </div>
    </div>
  );
}

export default function PastWinners() {
  const [data, setData] = useState<WinnersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const response = await fetch('/api/winners');
        if (!response.ok) {
          throw new Error('Failed to fetch winners');
        }
        const result: WinnersResponse = await response.json();
        setData(result);
      } catch (err) {
        console.error('[PastWinners] Error:', err);
        setError('Failed to load past winners');
      } finally {
        setLoading(false);
      }
    };

    fetchWinners();
  }, []);

  // Don't show section if there are no winners (first week)
  if (!loading && (!data?.winners || data.winners.length === 0)) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-2/50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-amber/20">
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
          </div>
          <div>
            <h3 className="font-semibold text-white">Last Week&apos;s Winners</h3>
            {data && (
              <p className="text-xs text-white/40">
                Season {data.season.replace('s', '')} Week {data.week}
                {data.totalParticipants && ` • ${data.totalParticipants} participants`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl bg-accent-rose/10 p-4 text-center text-sm text-accent-rose">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Winners list */}
      {!loading && !error && data?.winners && (
        <div className="space-y-4">
          {data.winners.map((winner) => (
            <WinnerCard key={winner.address} winner={winner} />
          ))}
        </div>
      )}
    </div>
  );
}
