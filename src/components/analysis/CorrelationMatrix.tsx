'use client';

import { useMemo } from 'react';
import { AllocationItem } from '@/lib/scoring';

type CorrelationMatrixProps = {
  allocations: AllocationItem[];
  correlations?: Record<string, Record<string, number>>;
};

// Default correlation estimates based on asset categories
// In production, these would come from historical price data
const DEFAULT_CORRELATIONS: Record<string, Record<string, number>> = {
  // Majors tend to correlate with each other
  BTC: { ETH: 0.85, SOL: 0.75, LINK: 0.70, PEPE: 0.45 },
  ETH: { BTC: 0.85, SOL: 0.80, LINK: 0.75, UNI: 0.70 },
  SOL: { BTC: 0.75, ETH: 0.80, BONK: 0.50, WIF: 0.55 },
  
  // Memes correlate with each other
  PEPE: { WIF: 0.65, BONK: 0.70, DEGEN: 0.55, BRETT: 0.60 },
  WIF: { PEPE: 0.65, BONK: 0.75, SOL: 0.55 },
  BONK: { PEPE: 0.70, WIF: 0.75, SOL: 0.50 },
  
  // DeFi tokens correlate
  UNI: { AAVE: 0.65, CRV: 0.60, LINK: 0.55, ETH: 0.70 },
  AAVE: { UNI: 0.65, CRV: 0.55, MKR: 0.50, ETH: 0.65 },
  
  // Stables have low correlation with everything
  USDC: { USDT: 0.99, DAI: 0.99, BTC: 0.0, ETH: 0.0 },
  USDT: { USDC: 0.99, DAI: 0.99, BTC: 0.0, ETH: 0.0 },
  DAI: { USDC: 0.99, USDT: 0.99, BTC: 0.0, ETH: 0.0 },
};

function getCorrelation(
  asset1: string, 
  asset2: string, 
  correlations?: Record<string, Record<string, number>>
): number {
  if (asset1 === asset2) return 1.0;
  
  const data = correlations || DEFAULT_CORRELATIONS;
  
  // Check both directions
  const correlation = data[asset1]?.[asset2] ?? data[asset2]?.[asset1];
  
  // Return found correlation or estimate based on category
  if (correlation !== undefined) return correlation;
  
  // Stables have 0 correlation with non-stables
  const stables = ['USDC', 'USDT', 'DAI'];
  if (stables.includes(asset1) !== stables.includes(asset2)) return 0;
  if (stables.includes(asset1) && stables.includes(asset2)) return 0.99;
  
  // Default moderate correlation for crypto assets
  return 0.5;
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
  correlations 
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
        sum += getCorrelation(symbols[i], symbols[j], correlations);
        count++;
      }
    }
    
    return count > 0 ? sum / count : 0;
  }, [symbols, correlations]);

  if (allocations.length < 2) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
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
                  const correlation = getCorrelation(rowSymbol, colSymbol, correlations);
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




