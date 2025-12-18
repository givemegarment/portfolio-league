'use client';

import Image from 'next/image';
import { getAsset } from '@/lib/assets';

type AllocationItem = {
  symbol: string;
  percentage: number;
};

type HistoryEntry = {
  id: string;
  week: string;
  season: string;
  rank: number;
  totalParticipants: number;
  score: number;
  allocations: AllocationItem[];
  timestamp: number;
};

type Props = {
  entries: HistoryEntry[];
  className?: string;
};

function AllocationBadge({ symbol, percentage }: { symbol: string; percentage: number }) {
  const asset = getAsset(symbol);
  const color = asset?.color || '#666';

  return (
    <div
      className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs"
      style={{
        backgroundColor: `${color}15`,
        border: `1px solid ${color}30`
      }}
    >
      {asset?.logo && (
        <Image
          src={asset.logo}
          alt={symbol}
          width={12}
          height={12}
          className="rounded-full"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      )}
      <span className="font-mono" style={{ color }}>{symbol}</span>
      <span className="text-white/40">{percentage}%</span>
    </div>
  );
}

function RankDisplay({ rank, total }: { rank: number; total: number }) {
  // Handle case where rank or total is not available
  if (!rank || !total || total === 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/40">Ranking in progress...</span>
      </div>
    );
  }

  const percentile = Math.round((1 - rank / total) * 100);
  const isTopTen = percentile >= 90;
  const isTopQuarter = percentile >= 75;

  return (
    <div className="flex items-center gap-2">
      <span className={`font-mono font-bold ${
        isTopTen ? 'text-accent-amber' : isTopQuarter ? 'text-accent-emerald' : 'text-white'
      }`}>
        #{rank}
      </span>
      <span className="text-xs text-white/30">of {total}</span>
      {isTopTen && (
        <span className="rounded-full bg-accent-amber/10 px-2 py-0.5 text-xs text-accent-amber">
          Top 10%
        </span>
      )}
    </div>
  );
}

export default function PortfolioHistoryList({ entries, className = '' }: Props) {
  if (!entries || entries.length === 0) {
    return (
      <div className={`rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center ${className}`}>
        <svg className="mx-auto h-12 w-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="mt-4 text-sm text-white/40">No competition history yet</p>
        <p className="text-xs text-white/30">Enter a competition to see your history here</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {entries.map((entry) => {
        const isPositive = entry.score >= 0;

        return (
          <div
            key={entry.id}
            className="rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left: Week info and rank */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    {entry.season} Week {entry.week}
                  </span>
                  <span className="text-xs text-white/30">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-2">
                  <RankDisplay rank={entry.rank} total={entry.totalParticipants} />
                </div>
              </div>

              {/* Right: Score */}
              <div className="text-right">
                <span className={`text-lg font-bold font-mono ${
                  isPositive ? 'text-accent-emerald' : 'text-accent-rose'
                }`}>
                  {isPositive ? '+' : ''}{entry.score.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Allocations */}
            <div className="mt-3 flex flex-wrap gap-1">
              {entry.allocations.map((a, i) => (
                <AllocationBadge key={`${a.symbol}-${i}`} symbol={a.symbol} percentage={a.percentage} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}









