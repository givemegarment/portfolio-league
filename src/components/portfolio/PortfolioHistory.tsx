'use client';

import React, { useState, useEffect } from 'react';

type HistoricalPortfolio = {
  season: string;
  week: number;
  allocations: { symbol: string; percentage: number }[];
  entryPrices: Record<string, number>;
  timestamp: number;
  finalScore?: number;
  rank?: number;
};

type HistoryResponse = {
  address: string;
  history: HistoricalPortfolio[];
  currentWeek: {
    season: string;
    week: number;
  };
  totalWeeksPlayed: number;
};

const ASSET_COLORS: Record<string, string> = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  SOL: '#9945FF',
  USDC: '#2775CA',
};

type Props = {
  address?: `0x${string}`;
};

export default function PortfolioHistory({ address }: Props) {
  const [history, setHistory] = useState<HistoricalPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalWeeks, setTotalWeeks] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/portfolio/history?address=${address}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }

        const data: HistoryResponse = await response.json();
        setHistory(data.history);
        setTotalWeeks(data.totalWeeksPlayed);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [address]);

  if (!address) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <p className="text-center text-white/50">Connect wallet to view portfolio history</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div className="flex items-center justify-center gap-3">
          <svg className="h-5 w-5 animate-spin text-base-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-white/50">Loading portfolio history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-accent-rose/20 bg-accent-rose/5 p-6">
        <p className="text-center text-accent-rose">{error}</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-3 text-white/50">No portfolio history yet</p>
          <p className="mt-1 text-sm text-white/30">Save your first portfolio to start tracking!</p>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalReturn = history.reduce((sum, p) => sum + (p.finalScore || 0), 0);
  const avgReturn = totalReturn / history.length;
  const bestWeek = history.reduce((best, p) => 
    (p.finalScore || 0) > (best.finalScore || 0) ? p : best
  , history[0]);
  const worstWeek = history.reduce((worst, p) => 
    (p.finalScore || 0) < (worst.finalScore || 0) ? p : worst
  , history[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Portfolio History</h2>
          <p className="text-sm text-white/50">{totalWeeks} weeks played</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-white/40 uppercase tracking-wider">Weeks Played</p>
          <p className="mt-1 text-2xl font-bold text-white">{totalWeeks}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-white/40 uppercase tracking-wider">Avg Return</p>
          <p className={`mt-1 text-2xl font-bold font-mono ${avgReturn >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
            {avgReturn >= 0 ? '+' : ''}{avgReturn.toFixed(2)}%
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-white/40 uppercase tracking-wider">Best Week</p>
          <p className={`mt-1 text-2xl font-bold font-mono ${(bestWeek.finalScore || 0) >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
            {(bestWeek.finalScore || 0) >= 0 ? '+' : ''}{(bestWeek.finalScore || 0).toFixed(2)}%
          </p>
          <p className="text-xs text-white/30">Week {bestWeek.week}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-white/40 uppercase tracking-wider">Worst Week</p>
          <p className={`mt-1 text-2xl font-bold font-mono ${(worstWeek.finalScore || 0) >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
            {(worstWeek.finalScore || 0) >= 0 ? '+' : ''}{(worstWeek.finalScore || 0).toFixed(2)}%
          </p>
          <p className="text-xs text-white/30">Week {worstWeek.week}</p>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-white/40">Week by Week</p>
        
        {history.map((portfolio) => {
          const weekKey = `${portfolio.season}-${portfolio.week}`;
          const isExpanded = expanded === weekKey;
          
          return (
            <div 
              key={weekKey}
              className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden"
            >
              {/* Header Row */}
              <button
                onClick={() => setExpanded(isExpanded ? null : weekKey)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <p className="font-semibold text-white">
                      Season {portfolio.season.replace('s', '')} • Week {portfolio.week}
                    </p>
                    <p className="text-xs text-white/40">
                      {new Date(portfolio.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Mini allocation bar */}
                  <div className="hidden sm:flex h-6 w-32 rounded-full overflow-hidden">
                    {portfolio.allocations.map((a, idx) => (
                      <div
                        key={a.symbol}
                        style={{
                          width: `${a.percentage}%`,
                          backgroundColor: ASSET_COLORS[a.symbol] || '#666',
                          marginLeft: idx > 0 ? '1px' : 0,
                        }}
                        className="h-full"
                      />
                    ))}
                  </div>
                  
                  {/* Score */}
                  <div className="text-right">
                    {portfolio.finalScore !== undefined && (
                      <p className={`font-mono font-bold ${portfolio.finalScore >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                        {portfolio.finalScore >= 0 ? '+' : ''}{portfolio.finalScore.toFixed(2)}%
                      </p>
                    )}
                  </div>
                  
                  {/* Expand icon */}
                  <svg 
                    className={`h-5 w-5 text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-white/5">
                  <div className="pt-4 space-y-3">
                    {/* Full allocation bar */}
                    <div className="h-8 rounded-full overflow-hidden flex">
                      {portfolio.allocations
                        .filter(a => a.percentage > 0)
                        .map((a, idx) => (
                          <div
                            key={a.symbol}
                            className="h-full flex items-center justify-center text-xs font-bold text-white"
                            style={{
                              width: `${a.percentage}%`,
                              backgroundColor: ASSET_COLORS[a.symbol] || '#666',
                              marginLeft: idx > 0 ? '2px' : 0,
                            }}
                          >
                            {a.percentage >= 15 && a.symbol}
                          </div>
                        ))}
                    </div>
                    
                    {/* Allocation details */}
                    <div className="flex flex-wrap gap-3">
                      {portfolio.allocations.map((a) => (
                        <div 
                          key={a.symbol}
                          className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm"
                          style={{ backgroundColor: `${ASSET_COLORS[a.symbol]}20` }}
                        >
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: ASSET_COLORS[a.symbol] || '#666' }}
                          />
                          <span className="font-mono text-white">{a.symbol}</span>
                          <span className="text-white/50">{a.percentage}%</span>
                          {portfolio.entryPrices[a.symbol] && (
                            <span className="text-white/30">
                              @${portfolio.entryPrices[a.symbol].toLocaleString()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
