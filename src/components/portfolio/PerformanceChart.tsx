'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';

type DataPoint = {
  time: string;
  timestamp: number;
  value: number;
  change: number;
};

// Type for API response from /api/portfolio/history
type HistoricalPortfolio = {
  season: string;
  week: number;
  allocations: { symbol: string; percentage: number }[];
  entryPrices: Record<string, number>;
  timestamp: number;
  finalScore?: number;
  rank?: number;
};

type Props = {
  portfolioId?: string;
  address?: string;
  data?: DataPoint[];
  height?: number;
  showAxis?: boolean;
  showTooltip?: boolean;
  showGradient?: boolean;
  className?: string;
};

// Custom tooltip component
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; payload: DataPoint }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;
  const isPositive = data.change >= 0;

  return (
    <div className="rounded-lg border border-white/10 bg-surface-3 px-3 py-2 shadow-lg">
      <p className="text-xs text-white/50">{data.time}</p>
      <p className={`text-sm font-bold ${isPositive ? 'text-accent-emerald' : 'text-accent-rose'}`}>
        {isPositive ? '+' : ''}{data.change.toFixed(2)}%
      </p>
    </div>
  );
}

// Generate mock data for demonstration
function generateMockData(days: number = 7): DataPoint[] {
  const data: DataPoint[] = [];
  const now = Date.now();
  let cumulativeChange = 0;

  for (let i = days; i >= 0; i--) {
    const timestamp = now - i * 24 * 60 * 60 * 1000;
    const date = new Date(timestamp);
    const dailyChange = (Math.random() - 0.45) * 5; // Slight positive bias
    cumulativeChange += dailyChange;

    data.push({
      time: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      timestamp,
      value: 10000 * (1 + cumulativeChange / 100),
      change: cumulativeChange,
    });
  }

  return data;
}

export default function PerformanceChart({
  portfolioId,
  address,
  data: providedData,
  height = 200,
  showAxis = true,
  showTooltip = true,
  showGradient = true,
  className = '',
}: Props) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (providedData) {
      setData(providedData);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // If we have an address or portfolioId, try to fetch real data
        if (address || portfolioId) {
          const endpoint = portfolioId 
            ? `/api/portfolio/history/${portfolioId}`
            : `/api/portfolio/history?address=${address}`;
          
          const response = await fetch(endpoint);
          
          if (response.ok) {
            const result = await response.json();
            
            // Handle history data from API (returns `history` not `data`)
            if (result.history && result.history.length > 0) {
              // Sort by timestamp (oldest first) and transform to chart data
              const sortedHistory = [...result.history].sort(
                (a: HistoricalPortfolio, b: HistoricalPortfolio) => a.timestamp - b.timestamp
              );
              
              // Calculate cumulative returns for the chart
              let cumulativeChange = 0;
              const chartData: DataPoint[] = sortedHistory.map((entry: HistoricalPortfolio) => {
                cumulativeChange += entry.finalScore || 0;
                const date = new Date(entry.timestamp);
                return {
                  time: date.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  }),
                  timestamp: entry.timestamp,
                  value: 10000 * (1 + cumulativeChange / 100),
                  change: cumulativeChange,
                };
              });
              
              setData(chartData);
              setLoading(false);
              return;
            }
          }
        }

        // Show empty state instead of mock data when no real data exists
        setData([]);
      } catch (err) {
        console.error('Error fetching performance data:', err);
        // Show empty state on error instead of fake data
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [portfolioId, address, providedData]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="flex flex-col items-center gap-2">
          <svg className="h-6 w-6 animate-spin text-base-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-xs text-white/40">Loading chart...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <p className="text-sm text-accent-rose">{error}</p>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <svg className="mx-auto h-10 w-10 text-white/20 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <p className="text-sm text-white/40">No performance data yet</p>
          <p className="text-xs text-white/30 mt-1">Submit a portfolio to start tracking</p>
        </div>
      </div>
    );
  }

  const latestChange = data[data.length - 1]?.change ?? 0;
  const isPositive = latestChange >= 0;
  const strokeColor = isPositive ? '#10B981' : '#F43F5E'; // emerald / rose
  const gradientId = `performanceGradient-${portfolioId || 'default'}`;

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          {/* Gradient definition */}
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Axes */}
          {showAxis && (
            <>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                tickMargin={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                tickMargin={8}
                tickFormatter={(value) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`}
                domain={['auto', 'auto']}
              />
            </>
          )}

          {/* Reference line at 0 */}
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />

          {/* Tooltip */}
          {showTooltip && <Tooltip content={<CustomTooltip />} />}

          {/* Area fill */}
          {showGradient && (
            <Area
              type="monotone"
              dataKey="change"
              stroke="none"
              fill={`url(#${gradientId})`}
            />
          )}

          {/* Line */}
          <Line
            type="monotone"
            dataKey="change"
            stroke={strokeColor}
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              fill: strokeColor,
              stroke: 'white',
              strokeWidth: 2,
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Summary */}
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-white/40">7-day performance</span>
        <span className={`font-mono font-bold ${isPositive ? 'text-accent-emerald' : 'text-accent-rose'}`}>
          {isPositive ? '+' : ''}{latestChange.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

/**
 * Mini sparkline version of the chart for compact displays
 */
export function PerformanceSparkline({
  data,
  width = 100,
  height = 30,
  className = '',
}: {
  data?: DataPoint[];
  width?: number;
  height?: number;
  className?: string;
}) {
  const chartData = data || generateMockData(7);
  const latestChange = chartData[chartData.length - 1]?.change ?? 0;
  const isPositive = latestChange >= 0;
  const strokeColor = isPositive ? '#10B981' : '#F43F5E';

  return (
    <div className={className} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="change"
            stroke={strokeColor}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}





