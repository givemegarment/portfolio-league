'use client';

import { useMemo } from 'react';

type Allocation = {
  symbol: string;
  percentage: number;
};

type PriceData = {
  price: number;
  change24h: number;
};

type PortfolioMetricsProps = {
  allocations: Allocation[];
  entryPrices: Record<string, number>;
  prices?: Record<string, PriceData>;
};

// Estimated annualized volatility based on asset type
// In production, these would come from historical data
const VOLATILITY_ESTIMATES: Record<string, number> = {
  // Majors - lower volatility
  BTC: 45,
  ETH: 55,

  // L1s - moderate-high volatility
  SOL: 65,
  AVAX: 60,
  NEAR: 65,

  // Memes - very high volatility
  PEPE: 120,
  WIF: 130,
  BONK: 125,
  DEGEN: 110,
  BRETT: 115,
  MOCHI: 120,
  TOSHI: 115,
  HIGHER: 110,

  // Base ecosystem
  AERO: 75,

  // DeFi
  LINK: 55,
  UNI: 60,
  AAVE: 55,

  // L2s
  OP: 65,
  ARB: 65,

  // Stables
  USDC: 0.5,
  USDT: 0.5,
  DAI: 0.5,
};

function getAssetVolatility(symbol: string, prices?: Record<string, PriceData>): number {
  const baseVolatility = VOLATILITY_ESTIMATES[symbol] || 70;

  // If we have live price data, adjust volatility based on 24h change magnitude
  if (prices && prices[symbol]) {
    const change24h = Math.abs(prices[symbol].change24h);
    // If 24h change is higher than expected, increase volatility estimate
    const dailyExpected = baseVolatility / Math.sqrt(365);
    if (change24h > dailyExpected * 2) {
      return baseVolatility * 1.2; // 20% higher
    } else if (change24h > dailyExpected) {
      return baseVolatility * 1.1; // 10% higher
    }
  }

  return baseVolatility;
}

/**
 * Displays portfolio metrics and statistics
 */
export default function PortfolioMetrics({
  allocations,
  entryPrices,
  prices,
}: PortfolioMetricsProps) {
  const metrics = useMemo(() => {
    if (!allocations || allocations.length === 0) {
      return {
        diversityScore: 0,
        topConcentration: 0,
        top3Concentration: 0,
        assetCount: 0,
        trackedAssets: 0,
        sortedAllocations: [],
        portfolioVolatility: 0,
        hasLiveData: false,
      };
    }

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
    const trackedAssets = Object.keys(entryPrices || {}).length;

    // Calculate portfolio volatility (weighted average of asset volatilities)
    // Using simplified calculation (ignores correlations for simplicity)
    let portfolioVolatility = 0;
    for (const allocation of allocations) {
      const assetVol = getAssetVolatility(allocation.symbol, prices);
      portfolioVolatility += (allocation.percentage / 100) * assetVol;
    }

    const hasLiveData = prices && Object.keys(prices).length > 0;

    return {
      diversityScore,
      topConcentration,
      top3Concentration,
      assetCount,
      trackedAssets,
      sortedAllocations,
      portfolioVolatility,
      hasLiveData,
    };
  }, [allocations, entryPrices, prices]);

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

  if (metrics.assetCount === 0) {
    return null;
  }

  const getVolatilityColor = (vol: number) => {
    if (vol <= 40) return '#10B981'; // Green - low volatility
    if (vol <= 70) return '#F59E0B'; // Amber - moderate
    return '#EF4444'; // Red - high volatility
  };

  const getVolatilityLabel = (vol: number) => {
    if (vol <= 40) return 'Low';
    if (vol <= 70) return 'Moderate';
    return 'High';
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-white">
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
        {metrics.hasLiveData && (
          <div className="flex items-center gap-1.5 rounded-full bg-accent-emerald/10 px-2 py-1 text-xs font-medium text-accent-emerald">
            <div className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-emerald opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-emerald"></span>
            </div>
            Live Data
          </div>
        )}
      </div>

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

        {/* Volatility */}
        <div className="rounded-xl bg-white/[0.03] p-4">
          <div className="text-xs text-white/40">Est. Volatility</div>
          <div
            className="mt-1 text-2xl font-bold"
            style={{ color: getVolatilityColor(metrics.portfolioVolatility) }}
          >
            {metrics.portfolioVolatility.toFixed(0)}%
          </div>
          <div
            className="mt-1 text-xs font-medium"
            style={{ color: getVolatilityColor(metrics.portfolioVolatility) }}
          >
            {getVolatilityLabel(metrics.portfolioVolatility)}
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







