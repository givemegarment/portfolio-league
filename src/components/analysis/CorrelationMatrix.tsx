'use client';

import { useMemo, useEffect, useState } from 'react';
import { AllocationItem } from '@/lib/scoring';

type PriceData = {
  price: number;
  change24h: number;
};

type CorrelationMatrixProps = {
  allocations: AllocationItem[];
  correlations?: Record<string, Record<string, number>>;
  prices?: Record<string, PriceData>;
};

// Default correlation estimates based on asset categories
// These are used when no live/historical data is available
const DEFAULT_CORRELATIONS: Record<string, Record<string, number>> = {
  // Majors tend to correlate with each other
  BTC: { ETH: 0.85, SOL: 0.75, LINK: 0.70, PEPE: 0.45, OP: 0.72, ARB: 0.70, AERO: 0.65, DEGEN: 0.40 },
  ETH: { BTC: 0.85, SOL: 0.80, LINK: 0.75, UNI: 0.70, OP: 0.78, ARB: 0.75, AERO: 0.68 },
  SOL: { BTC: 0.75, ETH: 0.80, BONK: 0.50, WIF: 0.55, JTO: 0.60, PYTH: 0.58 },

  // Memes correlate with each other
  PEPE: { WIF: 0.65, BONK: 0.70, DEGEN: 0.55, BRETT: 0.60, MOCHI: 0.62, TOSHI: 0.58 },
  WIF: { PEPE: 0.65, BONK: 0.75, SOL: 0.55, POPCAT: 0.68 },
  BONK: { PEPE: 0.70, WIF: 0.75, SOL: 0.50 },
  DEGEN: { PEPE: 0.55, BRETT: 0.70, HIGHER: 0.65, TOSHI: 0.60 },
  BRETT: { DEGEN: 0.70, PEPE: 0.60, MOCHI: 0.55 },

  // Base ecosystem
  AERO: { ETH: 0.68, OP: 0.72, DEGEN: 0.45, BRETT: 0.50 },

  // DeFi tokens correlate
  UNI: { AAVE: 0.65, CRV: 0.60, LINK: 0.55, ETH: 0.70, COMP: 0.58 },
  AAVE: { UNI: 0.65, CRV: 0.55, MKR: 0.50, ETH: 0.65, COMP: 0.60 },
  LINK: { BTC: 0.70, ETH: 0.75, UNI: 0.55, AAVE: 0.50 },

  // L2s correlate
  OP: { ARB: 0.82, ETH: 0.78, BTC: 0.72 },
  ARB: { OP: 0.82, ETH: 0.75, BTC: 0.70 },

  // Stables have low correlation with everything
  USDC: { USDT: 0.99, DAI: 0.99, BTC: 0.0, ETH: 0.0 },
  USDT: { USDC: 0.99, DAI: 0.99, BTC: 0.0, ETH: 0.0 },
  DAI: { USDC: 0.99, USDT: 0.99, BTC: 0.0, ETH: 0.0 },
};

// Calculate correlation adjustment based on live 24h changes
// Assets that move in the same direction in 24h are more correlated
function adjustCorrelationFromLiveData(
  asset1: string,
  asset2: string,
  prices: Record<string, PriceData>,
  baseCorrelation: number
): number {
  const change1 = prices[asset1]?.change24h;
  const change2 = prices[asset2]?.change24h;

  if (change1 === undefined || change2 === undefined) {
    return baseCorrelation;
  }

  // If both assets moved in the same direction, slight increase in correlation
  // If opposite directions, slight decrease
  const sameDirection = (change1 >= 0) === (change2 >= 0);
  const magnitudeSimilarity = 1 - Math.min(1, Math.abs(Math.abs(change1) - Math.abs(change2)) / 20);

  // Small adjustment based on live data (-0.1 to +0.1)
  const adjustment = sameDirection ? (magnitudeSimilarity * 0.1) : (-magnitudeSimilarity * 0.1);

  return Math.max(-1, Math.min(1, baseCorrelation + adjustment));
}

function getCorrelation(
  asset1: string,
  asset2: string,
  correlations?: Record<string, Record<string, number>>,
  prices?: Record<string, PriceData>
): number {
  if (asset1 === asset2) return 1.0;

  const data = correlations || DEFAULT_CORRELATIONS;

  // Check both directions
  let baseCorrelation = data[asset1]?.[asset2] ?? data[asset2]?.[asset1];

  // If no base correlation found, estimate based on category
  if (baseCorrelation === undefined) {
    // Stables have 0 correlation with non-stables
    const stables = ['USDC', 'USDT', 'DAI'];
    if (stables.includes(asset1) !== stables.includes(asset2)) {
      baseCorrelation = 0;
    } else if (stables.includes(asset1) && stables.includes(asset2)) {
      baseCorrelation = 0.99;
    } else {
      // Default moderate correlation for crypto assets
      baseCorrelation = 0.5;
    }
  }

  // Adjust correlation based on live price data if available
  if (prices && Object.keys(prices).length > 0) {
    return adjustCorrelationFromLiveData(asset1, asset2, prices, baseCorrelation);
  }

  return baseCorrelation;
}

function getCorrelationColor(value: number): string {
  if (value >= 0.8) return '#EF4444'; // High positive - red (concentrated risk)
  if (value >= 0.5) return '#F59E0B'; // Moderate positive - amber
  if (value >= 0.2) return '#FBBF24'; // Low positive - yellow
  if (value >= -0.2) return '#10B981'; // Near zero - green (good diversification)
  if (value >= -0.5) return '#0EA5E9'; // Negative - cyan (great diversification)
  return '#6366F1'; // High negative - indigo (hedge)
}

export default function CorrelationMatrix({
  allocations,
  correlations,
  prices
}: CorrelationMatrixProps) {
  const symbols = useMemo(() =>
    allocations.map(a => a.symbol).slice(0, 5), // Limit to 5 for readability
    [allocations]
  );

  const avgCorrelation = useMemo(() => {
    if (symbols.length < 2) return 0;

    let sum = 0;
    let count = 0;

    for (let i = 0; i < symbols.length; i++) {
      for (let j = i + 1; j < symbols.length; j++) {
        sum += getCorrelation(symbols[i], symbols[j], correlations, prices);
        count++;
      }
    }

    return count > 0 ? sum / count : 0;
  }, [symbols, correlations, prices]);

  if (allocations.length < 2) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-white">
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
              d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
            />
          </svg>
          Correlation Analysis
        </h3>
        {prices && Object.keys(prices).length > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-accent-emerald/10 px-2 py-1 text-xs font-medium text-accent-emerald">
            <div className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-emerald opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-emerald"></span>
            </div>
            Live Data
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mb-4 rounded-xl bg-white/[0.03] p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-white/60">Average Correlation</div>
            <div 
              className="mt-1 text-2xl font-bold"
              style={{ color: getCorrelationColor(avgCorrelation) }}
            >
              {avgCorrelation.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/60">Diversification</div>
            <div className={`mt-1 text-sm font-medium ${
              avgCorrelation < 0.3 ? 'text-accent-emerald' :
              avgCorrelation < 0.6 ? 'text-accent-amber' :
              'text-accent-rose'
            }`}>
              {avgCorrelation < 0.3 ? 'Excellent' :
               avgCorrelation < 0.6 ? 'Moderate' :
               'Poor'}
            </div>
          </div>
        </div>
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="p-2 text-left text-white/40" />
              {symbols.map(symbol => (
                <th key={symbol} className="p-2 text-center text-white/60">
                  {symbol}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {symbols.map((rowSymbol, i) => (
              <tr key={rowSymbol}>
                <td className="p-2 text-white/60">{rowSymbol}</td>
                {symbols.map((colSymbol, j) => {
                  const correlation = getCorrelation(rowSymbol, colSymbol, correlations, prices);
                  const isOwnCell = i === j;
                  
                  return (
                    <td 
                      key={colSymbol} 
                      className="p-2 text-center"
                    >
                      <div
                        className={`mx-auto flex h-10 w-10 items-center justify-center rounded-lg text-xs font-mono font-medium ${
                          isOwnCell ? 'bg-white/10 text-white/40' : ''
                        }`}
                        style={isOwnCell ? {} : {
                          backgroundColor: `${getCorrelationColor(correlation)}20`,
                          color: getCorrelationColor(correlation),
                        }}
                      >
                        {correlation.toFixed(2)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: '#10B981' }} />
          <span className="text-white/40">Low (Good)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: '#F59E0B' }} />
          <span className="text-white/40">Moderate</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: '#EF4444' }} />
          <span className="text-white/40">High (Risky)</span>
        </div>
      </div>

      {/* Tip */}
      <div className="mt-4 rounded-lg bg-base-blue/10 p-3 text-xs text-white/60">
        <strong className="text-base-blue">Tip:</strong> Lower correlation between 
        assets means better diversification. Assets that move together (high correlation) 
        concentrate your risk.
      </div>
    </div>
  );
}




