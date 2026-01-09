'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { getAsset } from '@/lib/assets';
import { COMPETITION_CONFIGS, type CompetitionType } from '@/lib/competitions';
import { PerformanceSparkline } from '@/components/portfolio/PerformanceChart';
import { UserAvatar, UserName } from '@/components/UserIdentity';

type AllocationItem = {
  symbol: string;
  percentage: number;
};

type LeaderboardRow = {
  rank: number;
  user: string;
  score: number;
  allocations: AllocationItem[];
  entryPrices?: Record<string, number>;
  winRate?: number;
  totalCompetitions?: number;
  portfolioValue?: number;
  change24h?: number;
};

type FilterType = 'all' | 'top10' | 'top50';
type SortKey = 'rank' | 'score' | 'change24h' | 'portfolioValue';
type SortDirection = 'asc' | 'desc';
type DensityMode = 'compact' | 'comfortable';

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
  const asset = getAsset(symbol);
  const color = asset?.color || '#666';

  return (
    <div
      className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-mono"
      style={{
        backgroundColor: `${color}15`,
        border: `1px solid ${color}30`
      }}
    >
      {asset?.logo && (
        <Image
          src={asset.logo}
          alt={symbol}
          width={14}
          height={14}
          className="rounded-full"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      )}
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
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-bold text-black shadow-lg shadow-amber-500/30">
        1
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-400 text-sm font-bold text-black">
        2
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-sm font-bold text-white">
        3
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-sm font-medium text-white/60">
      {rank}
    </div>
  );
}

function Avatar({ address }: { address: string }) {
  const color = addressToColor(address);
  const initials = addressToInitials(address);

  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

function SkeletonRow({ compact }: { compact?: boolean }) {
  const py = compact ? 'py-2' : 'py-4';
  return (
    <tr className="border-b border-white/5">
      <td className={`px-4 ${py}`}><div className="h-6 w-6 rounded-full shimmer" /></td>
      <td className={`px-4 ${py}`}>
        <div className="flex items-center gap-3">
          <div className={`${compact ? 'h-8 w-8' : 'h-10 w-10'} rounded-full shimmer`} />
          <div className="h-4 w-32 rounded shimmer" />
        </div>
      </td>
      <td className={`px-4 ${py}`}><div className="h-4 w-20 rounded shimmer" /></td>
      <td className={`px-4 ${py}`}><div className="h-4 w-16 rounded shimmer" /></td>
      <td className={`px-4 ${py}`}><div className="h-4 w-24 rounded shimmer" /></td>
      <td className={`px-4 ${py}`}>
        <div className="flex gap-1">
          <div className="h-5 w-14 rounded shimmer" />
          <div className="h-5 w-14 rounded shimmer" />
        </div>
      </td>
    </tr>
  );
}

// Sortable header component
function SortableHeader({
  label,
  sortKey,
  currentSort,
  currentDirection,
  onSort
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey;
  currentDirection: SortDirection;
  onSort: (key: SortKey) => void;
}) {
  const isActive = currentSort === sortKey;

  return (
    <button
      onClick={() => onSort(sortKey)}
      className="flex items-center gap-1 text-left hover:text-white/80 transition-colors group"
    >
      {label}
      <span className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
        {isActive && currentDirection === 'asc' ? (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </span>
    </button>
  );
}

type Props = {
  showFilters?: boolean;
  defaultTimeframe?: CompetitionType;
  limit?: number;
  className?: string;
};

export default function EnhancedLeaderboard({
  showFilters = true,
  defaultTimeframe = 'weekly',
  limit = 50,
  className = '',
}: Props) {
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<CompetitionType>(defaultTimeframe);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [density, setDensity] = useState<DensityMode>('comfortable');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection(key === 'rank' ? 'asc' : 'desc');
    }
  };

  useEffect(() => {
    let alive = true;

    const fetchLeaderboard = () => {
      setError(null);
      
      fetch(`/api/leaderboard?limit=${limit}&type=${timeframe}`)
        .then((r) => r.json())
        .then((data: LeaderboardRow[]) => {
          if (alive) setRows(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          if (alive) setError('Failed to load leaderboard');
        });
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 60000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [limit, timeframe]);

  // Apply filters and sorting
  const filteredRows = useMemo(() => {
    if (!rows) return null;

    let result = rows.filter((row) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!row.user.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Rank filter
      if (filter === 'top10' && row.rank > 10) return false;
      if (filter === 'top50' && row.rank > 50) return false;

      return true;
    });

    // Sort
    result = [...result].sort((a, b) => {
      let aVal: number, bVal: number;

      switch (sortKey) {
        case 'rank':
          aVal = a.rank;
          bVal = b.rank;
          break;
        case 'score':
          aVal = a.score || 0;
          bVal = b.score || 0;
          break;
        case 'change24h':
          aVal = a.change24h || a.score || 0;
          bVal = b.change24h || b.score || 0;
          break;
        case 'portfolioValue':
          aVal = a.portfolioValue || 0;
          bVal = b.portfolioValue || 0;
          break;
        default:
          aVal = a.rank;
          bVal = b.rank;
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [rows, searchQuery, filter, sortKey, sortDirection]);

  if (error) {
    return (
      <div className={`rounded-2xl border border-accent-rose/20 bg-accent-rose/5 p-6 text-center ${className}`}>
        <svg className="mx-auto mb-3 h-10 w-10 text-accent-rose/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-sm text-accent-rose">{error}</p>
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
    <div className={`overflow-hidden rounded-2xl border border-white/5 bg-surface-2 ${className}`}>
      {/* Header */}
      <div className="border-b border-white/5 bg-surface-3/50 px-4 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-base-blue/20">
              <svg className="h-4 w-4 text-base-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-semibold text-white">Leaderboard</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent-emerald animate-pulse" />
                <span className="text-xs text-white/40">Live</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Timeframe selector */}
              <div className="flex rounded-lg bg-white/5 p-1">
                {(['daily', 'weekly', 'monthly'] as CompetitionType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      timeframe === t
                        ? 'bg-base-blue text-white'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {COMPETITION_CONFIGS[t].shortName}
                  </button>
                ))}
              </div>

              {/* Rank filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white border border-white/10 focus:outline-none focus:border-base-blue"
              >
                <option value="all">All Players</option>
                <option value="top10">Top 10</option>
                <option value="top50">Top 50</option>
              </select>

              {/* Search */}
              <div className="relative">
                <svg
                  className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-40 rounded-lg bg-white/5 py-1.5 pl-7 pr-3 text-xs text-white placeholder-white/40 border border-white/10 focus:outline-none focus:border-base-blue"
                />
              </div>

              {/* Density toggle */}
              <div className="flex rounded-lg bg-white/5 p-0.5">
                <button
                  onClick={() => setDensity('compact')}
                  className={`p-1.5 rounded-md transition-colors ${
                    density === 'compact' ? 'bg-base-blue text-white' : 'text-white/40 hover:text-white/60'
                  }`}
                  title="Compact view"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setDensity('comfortable')}
                  className={`p-1.5 rounded-md transition-colors ${
                    density === 'comfortable' ? 'bg-base-blue text-white' : 'text-white/40 hover:text-white/60'
                  }`}
                  title="Comfortable view"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-surface-2">
            <tr className="border-b border-white/5 text-left text-xs font-medium uppercase tracking-wider text-white/40">
              <th className={`px-4 ${density === 'compact' ? 'py-2' : 'py-3'} w-14`}>
                <SortableHeader
                  label="#"
                  sortKey="rank"
                  currentSort={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className={`px-4 ${density === 'compact' ? 'py-2' : 'py-3'}`}>Player</th>
              <th className={`px-4 ${density === 'compact' ? 'py-2' : 'py-3'} w-24`}>
                <SortableHeader
                  label="Return"
                  sortKey="score"
                  currentSort={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className={`px-4 ${density === 'compact' ? 'py-2' : 'py-3'} w-20`}>
                <SortableHeader
                  label="24h"
                  sortKey="change24h"
                  currentSort={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className={`px-4 ${density === 'compact' ? 'py-2' : 'py-3'} w-24`}>Trend</th>
              <th className={`px-4 ${density === 'compact' ? 'py-2' : 'py-3'}`}>Portfolio</th>
            </tr>
          </thead>
          <tbody>
            {rows === null && (
              <>
                <SkeletonRow compact={density === 'compact'} />
                <SkeletonRow compact={density === 'compact'} />
                <SkeletonRow compact={density === 'compact'} />
                <SkeletonRow compact={density === 'compact'} />
                <SkeletonRow compact={density === 'compact'} />
              </>
            )}

            {filteredRows && filteredRows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                    <svg className="h-8 w-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="font-medium text-white/60">
                    {searchQuery ? 'No players found' : 'No entries yet'}
                  </p>
                  <p className="mt-1 text-xs text-white/30">
                    {searchQuery ? 'Try a different search' : 'Be the first to submit your picks!'}
                  </p>
                </td>
              </tr>
            )}

            {filteredRows?.map((r, idx) => {
              const isTopThree = r.rank <= 3;
              const scoreValue = typeof r.score === 'number' ? r.score : 0;
              const isPositive = scoreValue >= 0;
              const change24h = r.change24h ?? scoreValue; // Use score as fallback
              const is24hPositive = change24h >= 0;
              const py = density === 'compact' ? 'py-2' : 'py-3';

              return (
                <tr
                  key={`${r.user}-${r.rank}`}
                  className={`
                    border-b border-white/5 transition-colors duration-200
                    ${isTopThree ? 'bg-white/[0.02]' : ''}
                    hover:bg-white/[0.04]
                    ${density === 'compact' ? 'text-xs' : 'text-sm'}
                  `}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <td className={`px-4 ${py}`}>
                    <RankBadge rank={r.rank} />
                  </td>
                  <td className={`px-4 ${py}`}>
                    <div className="flex items-center gap-3">
                      <UserAvatar address={r.user} size={density === 'compact' ? 'sm' : 'md'} />
                      <div>
                        <div className="font-medium text-white">
                          <UserName address={r.user} />
                        </div>
                        {r.winRate !== undefined && density !== 'compact' && (
                          <div className="text-xs text-white/30">
                            {r.winRate}% win rate
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={`px-4 ${py}`}>
                    <span className={`font-mono font-semibold ${isPositive ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                      {isPositive ? '+' : ''}{scoreValue.toFixed(2)}%
                    </span>
                  </td>
                  <td className={`px-4 ${py}`}>
                    <span className={`font-mono text-xs ${is24hPositive ? 'text-accent-emerald/80' : 'text-accent-rose/80'}`}>
                      {is24hPositive ? '+' : ''}{change24h.toFixed(2)}%
                    </span>
                  </td>
                  <td className={`px-4 ${py}`}>
                    <PerformanceSparkline
                      address={r.user}
                      width={density === 'compact' ? 60 : 80}
                      height={density === 'compact' ? 18 : 24}
                    />
                  </td>
                  <td className={`px-4 ${py}`}>
                    <div className="flex flex-wrap gap-1">
                      {r.allocations?.slice(0, density === 'compact' ? 2 : 3).map((a, i) => (
                        <AllocationBadge
                          key={`${a.symbol}-${i}`}
                          symbol={a.symbol}
                          percentage={density === 'compact' ? undefined : a.percentage}
                        />
                      ))}
                      {r.allocations?.length > (density === 'compact' ? 2 : 3) && (
                        <span className="text-xs text-white/40">
                          +{r.allocations.length - (density === 'compact' ? 2 : 3)}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {filteredRows && filteredRows.length > 0 && (
        <div className="border-t border-white/5 bg-surface-3/30 px-4 py-3">
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>
              Showing {filteredRows.length} of {rows?.length || 0} players
            </span>
            <div className="flex items-center gap-2">
              <span className="text-white/30">
                {COMPETITION_CONFIGS[timeframe].icon} {COMPETITION_CONFIGS[timeframe].name}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


