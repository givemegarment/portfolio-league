'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

type ChartDataPoint = {
  date: string;
  value: number;
  label: string;
};

type PerformanceChartProps = {
  address: string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
};

/**
 * Full performance chart component
 */
export default function PerformanceChart({
  address,
  height = 300,
  showGrid = true,
  showTooltip = true,
}: PerformanceChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/portfolio/history?address=${address}`);
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio history');
        }

        const result = await response.json();
        const history = result.history || [];

        // Transform history into chart data
        const chartData: ChartDataPoint[] = history
          .map((entry: any) => {
            // Calculate portfolio value based on entry prices and current prices
            // For now, use the final score as a proxy for performance
            const value = entry.finalScore || 0;
            const weekLabel = `S${entry.season.replace('s', '')}W${entry.week}`;
            
            return {
              date: new Date(entry.timestamp).toLocaleDateString(),
              value,
              label: weekLabel,
            };
          })
          .reverse(); // Show oldest to newest

        // If no history, create a placeholder point
        if (chartData.length === 0) {
          chartData.push({
            date: new Date().toLocaleDateString(),
            value: 0,
            label: 'Start',
          });
        }

        setData(chartData);
        setError(null);
      } catch (err) {
        console.error('Error fetching portfolio history:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [address]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-white/5 bg-surface-2"
        style={{ height }}
      >
        <div className="animate-pulse text-white/40">Loading chart...</div>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-white/5 bg-surface-2 p-6"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-white/40 text-sm">
            {error || 'No portfolio history available'}
          </div>
          <div className="mt-2 text-xs text-white/20">
            Start building your portfolio to see performance over time
          </div>
        </div>
      </div>
    );
  }

  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value));
  const isPositive = data[data.length - 1]?.value >= (data[0]?.value || 0);

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
        <svg
          className="h-5 w-5 text-base-blue"
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
        Portfolio Performance
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          )}
          <XAxis
            dataKey="label"
            stroke="rgba(255,255,255,0.4)"
            style={{ fontSize: '12px' }}
            tick={{ fill: 'rgba(255,255,255,0.4)' }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.4)"
            style={{ fontSize: '12px' }}
            tick={{ fill: 'rgba(255,255,255,0.4)' }}
            domain={[minValue * 0.95, maxValue * 1.05]}
          />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke={isPositive ? '#10B981' : '#EF4444'}
            fill={isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Compact sparkline chart for use in leaderboards and cards
 */
export function PerformanceSparkline({
  address,
  width = 100,
  height = 30,
}: {
  address: string;
  width?: number;
  height?: number;
}) {
  const [data, setData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!address) return;

      try {
        const response = await fetch(`/api/portfolio/history?address=${address}`);
        if (!response.ok) return;

        const result = await response.json();
        const history = result.history || [];

        const chartData: ChartDataPoint[] = history
          .slice(-7) // Last 7 weeks
          .map((entry: any) => ({
            date: entry.week.toString(),
            value: entry.finalScore || 0,
            label: `W${entry.week}`,
          }));

        setData(chartData);
      } catch (err) {
        // Silently fail for sparklines
        console.error('Error fetching sparkline data:', err);
      }
    };

    fetchHistory();
  }, [address]);

  if (data.length === 0) {
    return (
      <div
        className="rounded bg-white/5"
        style={{ width, height }}
      />
    );
  }

  const isPositive = data[data.length - 1]?.value >= (data[0]?.value || 0);

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={isPositive ? '#10B981' : '#EF4444'}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
