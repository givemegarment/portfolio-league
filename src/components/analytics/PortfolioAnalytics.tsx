'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { getAsset } from '@/lib/assets';
import { getRiskScoreColor, getRiskScoreLabel } from '@/lib/scoring';

type Props = {
  address: string;
  className?: string;
};

type AnalyticsData = {
  winLossRatio: {
    wins: number;
    losses: number;
    winRate: number;
    totalWeeks: number;
  };
  bestPerformingAssets: Array<{
    symbol: string;
    averageReturn: number;
    totalReturn: number;
    weeksHeld: number;
  }>;
  worstPerformingAssets: Array<{
    symbol: string;
    averageReturn: number;
    totalReturn: number;
    weeksHeld: number;
  }>;
  riskMetrics: {
    sharpeRatio: number;
    volatility: number;
    maxDrawdown: number;
    riskScore: 'low' | 'medium' | 'high' | 'extreme';
    diversificationScore: number;
  };
  correlationMatrix: Record<string, Record<string, number>>;
  portfolioValueHistory: Array<{
    timestamp: number;
    date: string;
    value: number;
    return: number;
  }>;
  totalReturn: number;
  averageReturn: number;
};

export default function PortfolioAnalytics({ address, className = '' }: Props) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/portfolio/analytics?address=${address}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const data = await response.json();
        setAnalytics(data.analytics);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      fetchAnalytics();
    }
  }, [address]);

  if (loading) {
    return (
      <div className={`rounded-2xl border border-white/5 bg-white/[0.02] p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <svg className="h-8 w-8 animate-spin text-base-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className={`rounded-2xl border border-accent-rose/20 bg-accent-rose/5 p-6 text-center ${className}`}>
        <p className="text-sm text-accent-rose">{error || 'No analytics data available'}</p>
      </div>
    );
  }

  const riskColor = getRiskScoreColor(analytics.riskMetrics.riskScore);
  const riskLabel = getRiskScoreLabel(analytics.riskMetrics.riskScore);

  // Prepare correlation matrix data for visualization
  const correlationData: Array<{ asset1: string; asset2: string; correlation: number }> = [];
  const symbols = Object.keys(analytics.correlationMatrix);
  
  for (let i = 0; i < symbols.length; i++) {
    for (let j = i + 1; j < symbols.length; j++) {
      const symbol1 = symbols[i];
      const symbol2 = symbols[j];
      correlationData.push({
        asset1: symbol1,
        asset2: symbol2,
        correlation: analytics.correlationMatrix[symbol1][symbol2] || 0,
      });
    }
  }

  // Sort by absolute correlation
  correlationData.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs text-white/40 mb-1">Win Rate</div>
          <div className="text-2xl font-bold text-white">{analytics.winLossRatio.winRate.toFixed(1)}%</div>
          <div className="text-xs text-white/40 mt-1">
            {analytics.winLossRatio.wins}W / {analytics.winLossRatio.losses}L
          </div>
        </div>
        
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs text-white/40 mb-1">Total Return</div>
          <div className={`text-2xl font-bold ${analytics.totalReturn >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
            {analytics.totalReturn >= 0 ? '+' : ''}{analytics.totalReturn.toFixed(2)}%
          </div>
          <div className="text-xs text-white/40 mt-1">
            Avg: {analytics.averageReturn >= 0 ? '+' : ''}{analytics.averageReturn.toFixed(2)}%
          </div>
        </div>
        
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs text-white/40 mb-1">Risk Level</div>
          <div className="text-2xl font-bold" style={{ color: riskColor }}>
            {riskLabel}
          </div>
          <div className="text-xs text-white/40 mt-1">
            Volatility: {analytics.riskMetrics.volatility.toFixed(1)}%
          </div>
        </div>
        
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs text-white/40 mb-1">Diversification</div>
          <div className="text-2xl font-bold text-white">{analytics.riskMetrics.diversificationScore}</div>
          <div className="text-xs text-white/40 mt-1">
            Sharpe: {analytics.riskMetrics.sharpeRatio.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Portfolio Value Over Time */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <h3 className="text-lg font-bold text-white mb-4">Portfolio Value Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.portfolioValueHistory}>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
              tickFormatter={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
              formatter={(value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#0052FF"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Best/Worst Performing Assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h3 className="text-lg font-bold text-white mb-4">Best Performers</h3>
          <div className="space-y-3">
            {analytics.bestPerformingAssets.map((asset, idx) => {
              const assetInfo = getAsset(asset.symbol);
              return (
                <div
                  key={asset.symbol}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-white/40">#{idx + 1}</div>
                    {assetInfo?.logo && (
                      <Image
                        src={assetInfo.logo}
                        alt={asset.symbol}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-mono font-bold text-white">{asset.symbol}</div>
                      <div className="text-xs text-white/40">{asset.weeksHeld} weeks</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-mono font-bold text-accent-emerald`}>
                      +{asset.averageReturn.toFixed(2)}%
                    </div>
                    <div className="text-xs text-white/40">avg</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h3 className="text-lg font-bold text-white mb-4">Worst Performers</h3>
          <div className="space-y-3">
            {analytics.worstPerformingAssets.map((asset, idx) => {
              const assetInfo = getAsset(asset.symbol);
              return (
                <div
                  key={asset.symbol}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-white/40">#{idx + 1}</div>
                    {assetInfo?.logo && (
                      <Image
                        src={assetInfo.logo}
                        alt={asset.symbol}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-mono font-bold text-white">{asset.symbol}</div>
                      <div className="text-xs text-white/40">{asset.weeksHeld} weeks</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-mono font-bold text-accent-rose`}>
                      {asset.averageReturn.toFixed(2)}%
                    </div>
                    <div className="text-xs text-white/40">avg</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <h3 className="text-lg font-bold text-white mb-4">Risk Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-xs text-white/40 mb-1">Sharpe Ratio</div>
            <div className="text-2xl font-bold text-white">{analytics.riskMetrics.sharpeRatio.toFixed(2)}</div>
            <div className="text-xs text-white/40 mt-1">Risk-adjusted return</div>
          </div>
          
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-xs text-white/40 mb-1">Volatility</div>
            <div className="text-2xl font-bold text-white">{analytics.riskMetrics.volatility.toFixed(2)}%</div>
            <div className="text-xs text-white/40 mt-1">Standard deviation</div>
          </div>
          
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-xs text-white/40 mb-1">Max Drawdown</div>
            <div className="text-2xl font-bold text-accent-rose">{analytics.riskMetrics.maxDrawdown.toFixed(2)}%</div>
            <div className="text-xs text-white/40 mt-1">Largest peak-to-trough</div>
          </div>
        </div>
      </div>

      {/* Correlation Matrix */}
      {correlationData.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h3 className="text-lg font-bold text-white mb-4">Asset Correlations</h3>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {correlationData.slice(0, 10).map((item, idx) => {
                  const absCorr = Math.abs(item.correlation);
                  const color = absCorr > 0.7 ? '#EF4444' : absCorr > 0.4 ? '#F59E0B' : '#10B981';
                  
                  return (
                    <div
                      key={`${item.asset1}-${item.asset2}`}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-white">{item.asset1}</span>
                        <span className="text-white/40">×</span>
                        <span className="font-mono text-sm text-white">{item.asset2}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-24 h-2 rounded-full bg-white/10"
                          style={{
                            background: `linear-gradient(to right, ${color} ${absCorr * 100}%, transparent ${absCorr * 100}%)`,
                          }}
                        />
                        <span className="text-sm font-mono text-white w-12 text-right">
                          {item.correlation.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
