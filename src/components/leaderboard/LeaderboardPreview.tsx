'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type AllocationItem = {
  symbol: string;
  percentage: number;
};

type Row = { 
  rank: number; 
  user: string; 
  score: number; 
  allocations: AllocationItem[];
  entryPrices?: Record<string, number>;
};

const ASSET_COLORS: Record<string, string> = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  SOL: '#9945FF',
  USDC: '#2775CA',
};

function addressToColor(address: string): string {
  const colors = [
    '#F7931A', '#627EEA', '#9945FF', '#2775CA', 
    '#00D395', '#FF6B6B', '#4ECDC4', '#FFE66D',
    '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'
  ];
  const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function addressToInitials(address: string): string {
  return address.slice(2, 4).toUpperCase();
}

function shortenAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function AllocationBadge({ symbol, percentage }: { symbol: string; percentage?: number }) {
  const color = ASSET_COLORS[symbol] || '#666';
  
  return (
    <div 
      className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-mono"
      style={{ 
        backgroundColor: `${color}15`,
        border: `1px solid ${color}30`
      }}
    >
      <Image
        src={`/coins/${symbol.toLowerCase()}.svg`}
        alt={symbol}
        width={14}
        height={14}
        className="rounded-full"
      />
      <span style={{ color }}>{symbol}</span>
      {percentage !== undefined && percentage > 0 && (
        <span className="text-white/40">{percentage}%</span>
      )}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-xs sm:text-sm font-bold text-black shadow-lg shadow-amber-500/30">
        1
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-400 text-xs sm:text-sm font-bold text-black">
        2
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-xs sm:text-sm font-bold text-white">
        3
      </div>
    );
  }
  return (
    <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/5 text-xs sm:text-sm font-medium text-white/60">
      {rank}
    </div>
  );
}

function Avatar({ address }: { address: string }) {
  const color = addressToColor(address);
  const initials = addressToInitials(address);
  
  return (
    <div 
      className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold text-white shrink-0"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      <td className="px-4 py-4">
        <div className="h-8 w-8 rounded-full shimmer" />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full shimmer" />
          <div className="h-4 w-32 rounded shimmer" />
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-16 rounded shimmer" />
      </td>
      <td className="px-4 py-4">
        <div className="flex gap-1">
          <div className="h-5 w-16 rounded shimmer" />
          <div className="h-5 w-16 rounded shimmer" />
        </div>
      </td>
    </tr>
  );
}

export default function LeaderboardPreview() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    
    const fetchLeaderboard = async () => {
      try {
        console.log('[LeaderboardPreview] Fetching leaderboard...');
        const response = await fetch('/api/leaderboard?limit=10');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[LeaderboardPreview] API error:', response.status, errorData);
          if (alive) setErr(`Failed to load leaderboard (${response.status})`);
          return;
        }
        
        const data = await response.json();
        console.log('[LeaderboardPreview] Received data:', Array.isArray(data) ? `${data.length} rows` : 'not an array');
        
        if (alive) {
          if (Array.isArray(data)) {
            setRows(data);
          } else if (data.error) {
            setErr(data.error);
          } else {
            setRows([]);
          }
        }
      } catch (error) {
        console.error('[LeaderboardPreview] Fetch error:', error);
        if (alive) setErr('Failed to load leaderboard');
      }
    };

    fetchLeaderboard();
    
    // Refresh leaderboard every 60 seconds (prices update, scores change)
    const interval = setInterval(fetchLeaderboard, 60000);
    
    return () => { 
      alive = false; 
      clearInterval(interval);
    };
  }, []);

  if (err) {
    return (
      <div className="rounded-2xl border border-accent-rose/20 bg-accent-rose/5 p-6 text-center">
        <svg className="mx-auto mb-3 h-10 w-10 text-accent-rose/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-sm text-accent-rose">{err}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-3 text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface-2">
      {/* Header */}
      <div className="border-b border-white/5 bg-surface-3/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-base-blue/20">
              <svg className="h-3.5 w-3.5 text-base-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">Top Performers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-accent-emerald animate-pulse" />
            <span className="text-xs text-white/40">Live</span>
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs font-medium uppercase tracking-wider text-white/40">
              <th className="px-2 sm:px-4 py-3 w-12 sm:w-16">Rank</th>
              <th className="px-2 sm:px-4 py-3">Player</th>
              <th className="px-2 sm:px-4 py-3 w-20 sm:w-24">Return</th>
              <th className="px-2 sm:px-4 py-3 hidden md:table-cell">Portfolio</th>
            </tr>
          </thead>
          <tbody className="stagger-children">
            {rows === null && (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            )}
            
            {rows !== null && rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                    <svg className="h-8 w-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="font-medium text-white/60">No entries yet</p>
                  <p className="mt-1 text-xs text-white/30">Be the first to submit your picks!</p>
                </td>
              </tr>
            )}
            
            {rows?.map((r, idx) => {
              const isTopThree = r.rank <= 3;
              const scoreValue = typeof r.score === 'number' ? r.score : 0;
              const isPositive = scoreValue >= 0;
              
              return (
                <tr 
                  key={`${r.user}-${r.rank}`} 
                  className={`
                    border-b border-white/5 transition-colors duration-200
                    ${isTopThree ? 'bg-white/[0.02]' : ''}
                    hover:bg-white/[0.04]
                  `}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <td className="px-2 sm:px-4 py-3">
                    <RankBadge rank={r.rank} />
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Avatar address={r.user} />
                      <div className="min-w-0">
                        <div className="font-mono text-xs sm:text-sm font-medium text-white truncate">
                          {shortenAddress(r.user)}
                        </div>
                        {isTopThree && (
                          <div className="text-xs text-white/30 hidden sm:block">
                            {r.rank === 1 ? 'Leading' : r.rank === 2 ? '2nd Place' : '3rd Place'}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className={`font-mono text-sm sm:text-base font-semibold ${isPositive ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                      {isPositive ? '+' : ''}{scoreValue.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {r.allocations?.map((a, i) => (
                        <AllocationBadge 
                          key={`${a.symbol}-${i}`} 
                          symbol={a.symbol} 
                          percentage={a.percentage}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Footer */}
      {rows && rows.length > 0 && (
        <div className="border-t border-white/5 bg-surface-3/30 px-4 py-3">
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>Showing top {rows.length} players</span>
            <button className="flex items-center gap-1 text-base-blue hover:text-base-blue-light transition-colors">
              View full leaderboard
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
