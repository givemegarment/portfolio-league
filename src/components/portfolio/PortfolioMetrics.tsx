'use client';

import { useMemo } from 'react';

type Allocation = {
  symbol: string;
  percentage: number;
};

type PortfolioMetricsProps = {
  allocations: Allocation[];
  entryPrices: Record<string, number>;
};

/**
 * Displays portfolio metrics and statistics
 */
export default function PortfolioMetrics({
  allocations,
  entryPrices,
}: PortfolioMetricsProps) {
  const metrics = useMemo(() => {
    // Calculate diversity score (0-100 based on how evenly distributed allocations are)
    const maxDiversity = 100 / allocations.length;
    const diversitySum = allocations.reduce((sum, a) => {
      return sum + Math.min(a.percentage, maxDiversity);
    }, 0);
    const diversityScore = Math.round((diversitySum / 100) * 100);

    // Calculate concentration - how much is in top asset
    const sortedAllocations = [...allocations].sort((a, b) => b.percentage - a.percentage);
    const topConcentration = sortedAllocations[0]?.percentage || 0;
    const top3Concentration = sortedAllocations.slice(0, 3).reduce((sum, a) => sum + a.percentage, 0);

    // Number of assets
    const assetCount = allocations.length;

    // Assets with entry prices tracked
    const trackedAssets = Object.keys(entryPrices).length;

    return {
      diversityScore,
      topConcentration,
      top3Concentration,
      assetCount,
      trackedAssets,
      sortedAllocations,
    };
  }, [allocations, entryPrices]);

  const getDiversityColor = (score: number) => {
    if (score >= 70) return '#10B981'; // Green - well diversified
    if (score >= 40) return '#F59E0B'; // Amber - moderate
    return '#EF4444'; // Red - concentrated
  };

  const getDiversityLabel = (score: number) => {
    if (score >= 70) return 'Well Diversified';
    if (score >= 40) return 'Moderate';
    return 'Concentrated';
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
        <svg
          className="h-5 w-5 text-accent-emerald"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        Portfolio Metrics
      </h3>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Diversity Score */}
        <div className="rounded-xl bg-white/[0.03] p-4">
          <div className="text-xs text-white/40">Diversity Score</div>
          <div
            className="mt-1 text-2xl font-bold"
            style={{ color: getDiversityColor(metrics.diversityScore) }}
          >
            {metrics.diversityScore}
          </div>
          <div
            className="mt-1 text-xs font-medium"
            style={{ color: getDiversityColor(metrics.diversityScore) }}
          >
            {getDiversityLabel(metrics.diversityScore)}
          </div>
        </div>

        {/* Asset Count */}
        <div className="rounded-xl bg-white/[0.03] p-4">
          <div className="text-xs text-white/40">Total Assets</div>
          <div className="mt-1 text-2xl font-bold text-white">
            {metrics.assetCount}
          </div>
          <div className="mt-1 text-xs text-white/40">
            in portfolio
          </div>
        </div>

        {/* Top Concentration */}
        <div className="rounded-xl bg-white/[0.03] p-4">
          <div className="text-xs text-white/40">Top Asset</div>
          <div className="mt-1 text-2xl font-bold text-white">
            {metrics.topConcentration}%
          </div>
          <div className="mt-1 text-xs text-white/40">
            {metrics.sortedAllocations[0]?.symbol || '—'}
          </div>
        </div>

        {/* Top 3 Concentration */}
        <div className="rounded-xl bg-white/[0.03] p-4">
          <div className="text-xs text-white/40">Top 3 Assets</div>
          <div className="mt-1 text-2xl font-bold text-white">
            {metrics.top3Concentration}%
          </div>
          <div className="mt-1 text-xs text-white/40">
            of portfolio
          </div>
        </div>
      </div>

      {/* Allocation Distribution Bar */}
      <div className="mt-6">
        <div className="mb-2 text-sm font-medium text-white/60">
          Allocation Distribution
        </div>
        <div className="flex h-4 overflow-hidden rounded-full bg-white/5">
          {metrics.sortedAllocations.map((allocation, idx) => {
            const colors = [
              '#3B82F6', // Blue
              '#10B981', // Green
              '#F59E0B', // Amber
              '#8B5CF6', // Purple
              '#EC4899', // Pink
              '#6366F1', // Indigo
              '#14B8A6', // Teal
              '#F97316', // Orange
            ];
            const color = colors[idx % colors.length];
            
            return (
              <div
                key={allocation.symbol}
                className="h-full transition-all"
                style={{
                  width: `${allocation.percentage}%`,
                  backgroundColor: color,
                }}
                title={`${allocation.symbol}: ${allocation.percentage}%`}
              />
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-3">
          {metrics.sortedAllocations.slice(0, 5).map((allocation, idx) => {
            const colors = [
              '#3B82F6',
              '#10B981',
              '#F59E0B',
              '#8B5CF6',
              '#EC4899',
            ];
            const color = colors[idx % colors.length];
            
            return (
              <div key={allocation.symbol} className="flex items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-white/60">
                  {allocation.symbol} ({allocation.percentage}%)
                </span>
              </div>
            );
          })}
          {metrics.sortedAllocations.length > 5 && (
            <span className="text-xs text-white/40">
              +{metrics.sortedAllocations.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Entry Prices Info */}
      {metrics.trackedAssets > 0 && (
        <div className="mt-6 rounded-xl bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Entry Prices Tracked</div>
              <div className="text-xs text-white/40">
                {metrics.trackedAssets} of {metrics.assetCount} assets have entry price data
              </div>
            </div>
            <div className="text-2xl font-bold text-base-blue">
              {Math.round((metrics.trackedAssets / metrics.assetCount) * 100)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
