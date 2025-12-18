'use client';

import { MasterPerformance as PerformanceType } from '@/lib/masters';
import { formatScore } from '@/lib/scoring';

type MasterPerformanceProps = {
  performance: PerformanceType;
};

export default function MasterPerformance({ performance }: MasterPerformanceProps) {
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
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
        Performance Metrics
      </h3>

      {/* Returns grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          label="24H"
          value={performance.return1D}
          isReturn
        />
        <MetricCard
          label="7D"
          value={performance.return7D}
          isReturn
        />
        <MetricCard
          label="30D"
          value={performance.return30D}
          isReturn
        />
        <MetricCard
          label="1Y"
          value={performance.return1Y}
          isReturn
        />
      </div>

      {/* Risk metrics */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white/60">Risk Metrics</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <svg
                className="h-4 w-4"
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
              Sharpe Ratio
            </div>
            <div className="mt-2 text-lg font-bold text-white">
              {performance.sharpeRatio.toFixed(2)}
            </div>
            <div className="text-xs text-white/40">
              {performance.sharpeRatio >= 2
                ? 'Excellent'
                : performance.sharpeRatio >= 1
                ? 'Good'
                : performance.sharpeRatio >= 0.5
                ? 'Average'
                : 'Below Average'}
            </div>
          </div>

          <div className="rounded-xl bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                />
              </svg>
              Max Drawdown
            </div>
            <div className="mt-2 text-lg font-bold text-accent-rose">
              -{performance.maxDrawdown.toFixed(1)}%
            </div>
            <div className="text-xs text-white/40">Peak to trough</div>
          </div>

          <div className="rounded-xl bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
              Volatility
            </div>
            <div className="mt-2 text-lg font-bold text-white">
              {performance.volatility.toFixed(1)}%
            </div>
            <div className="text-xs text-white/40">Annualized</div>
          </div>

          <div className="rounded-xl bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Win Rate
            </div>
            <div className="mt-2 text-lg font-bold text-white">
              {performance.winRate}%
            </div>
            <div className="text-xs text-white/40">
              {performance.tradeCount} trades
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  isReturn = false,
}: {
  label: string;
  value: number;
  isReturn?: boolean;
}) {
  const colorClass = isReturn
    ? value >= 0
      ? 'text-accent-emerald'
      : 'text-accent-rose'
    : 'text-white';

  return (
    <div className="rounded-xl bg-white/[0.03] p-3 text-center">
      <div className="text-xs text-white/40">{label}</div>
      <div className={`mt-1 text-lg font-bold ${colorClass}`}>
        {isReturn ? formatScore(value) : value.toFixed(2)}
      </div>
    </div>
  );
}




