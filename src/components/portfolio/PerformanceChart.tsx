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
  Legend,
} from 'recharts';

type TimeRange = '24h' | '1W' | '1M' | '3M' | 'All';

type DataPoint = {
  time: string;
  timestamp: number;
  value: number;
  change: number;
  portfolioValue?: number;
  portfolioReturn?: number;
  benchmarkValue?: number;
  benchmarkReturn?: number;
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
  showTimeRange?: boolean;
  showBenchmark?: boolean;
  defaultRange?: TimeRange;
  benchmark?: 'BTC' | 'market';
};

// Enhanced tooltip component
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ 
    value: number; 
    dataKey: string;
    name: string;
    color: string;
    payload: DataPoint 
  }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const portfolioData = payload.find(p => p.dataKey === 'portfolioReturn' || p.dataKey === 'change');
  const benchmarkData = payload.find(p => p.dataKey === 'benchmarkReturn');
  
  if (!portfolioData) return null;

  const data = portfolioData.payload;
  const portfolioReturn = data.portfolioReturn ?? data.change ?? 0;
  const benchmarkReturn = data.benchmarkReturn ?? 0;
  const portfolioValue = data.portfolioValue ?? data.value ?? 0;
  const benchmarkValue = data.benchmarkValue ?? 0;
  
  const isPositive = portfolioReturn >= 0;
  const benchmarkIsPositive = benchmarkReturn >= 0;
  const outperformance = portfolioReturn - benchmarkReturn;

  return (
    <div className="rounded-lg border border-white/10 bg-surface-3 px-4 py-3 shadow-lg backdrop-blur-sm">
      <p className="text-xs text-white/50 mb-2 font-medium">{data.time || label}</p>
      
      <div className="space-y-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-accent-emerald" />
            <span className="text-xs text-white/60">Portfolio</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className={`text-sm font-bold ${isPositive ? 'text-accent-emerald' : 'text-accent-rose'}`}>
              {isPositive ? '+' : ''}{portfolioReturn.toFixed(2)}%
            </p>
            <p className="text-xs text-white/40 font-mono">
              ${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
        
        {benchmarkData && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2 w-2 rounded-full bg-base-blue" />
              <span className="text-xs text-white/60">Benchmark</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className={`text-sm font-bold ${benchmarkIsPositive ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                {benchmarkIsPositive ? '+' : ''}{benchmarkReturn.toFixed(2)}%
              </p>
              <p className="text-xs text-white/40 font-mono">
                ${benchmarkValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        )}
        
        {benchmarkData && (
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">Outperformance</span>
              <span className={`text-xs font-bold ${outperformance >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                {outperformance >= 0 ? '+' : ''}{outperformance.toFixed(2)}%
              </span>
            </div>
          </div>
        )}
      </div>
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
  showTimeRange = true,
  showBenchmark = true,
  defaultRange = '1M',
  benchmark = 'BTC',
}: Props) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>(defaultRange);
  const [selectedBenchmark, setSelectedBenchmark] = useState<'BTC' | 'market'>(benchmark);

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
        // If we have an address, try to fetch performance data with benchmark
        if (address && showBenchmark) {
          const endpoint = `/api/portfolio/performance?address=${address}&range=${timeRange}&benchmark=${selectedBenchmark}`;
          
          const response = await fetch(endpoint);
          
          if (response.ok) {
            const result = await response.json();
            
            if (result.data && result.data.length > 0) {
              const chartData: DataPoint[] = result.data.map((point: any) => ({
                time: point.date,
                timestamp: point.timestamp,
                value: point.portfolioValue,
                change: point.portfolioReturn,
                portfolioValue: point.portfolioValue,
                portfolioReturn: point.portfolioReturn,
                benchmarkValue: point.benchmarkValue,
                benchmarkReturn: point.benchmarkReturn,
              }));
              
              setData(chartData);
              setLoading(false);
              return;
            }
          }
        }
        
        // Fallback to history API if performance API not available or no benchmark
        if (address || portfolioId) {
          const endpoint = portfolioId 
            ? `/api/portfolio/history/${portfolioId}`
            : `/api/portfolio/history?address=${address}`;
          
          const response = await fetch(endpoint);
          
          if (response.ok) {
            const result = await response.json();
            
            // Handle history data from API (returns `history` not `data`)
            if (result.history && result.history.length > 0) {
              // Filter by time range
              const now = Date.now();
              let startTime = now;
              
              switch (timeRange) {
                case '24h':
                  startTime = now - 24 * 60 * 60 * 1000;
                  break;
                case '1W':
                  startTime = now - 7 * 24 * 60 * 60 * 1000;
                  break;
                case '1M':
                  startTime = now - 30 * 24 * 60 * 60 * 1000;
                  break;
                case '3M':
                  startTime = now - 90 * 24 * 60 * 60 * 1000;
                  break;
                case 'All':
                  startTime = 0;
                  break;
              }
              
              // Sort by timestamp (oldest first) and transform to chart data
              const sortedHistory = [...result.history]
                .filter((entry: HistoricalPortfolio) => entry.timestamp >= startTime)
                .sort((a: HistoricalPortfolio, b: HistoricalPortfolio) => a.timestamp - b.timestamp);
              
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
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [portfolioId, address, providedData, timeRange, selectedBenchmark, showBenchmark]);

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

  const latestChange = data[data.length - 1]?.portfolioReturn ?? data[data.length - 1]?.change ?? 0;
  const latestBenchmark = data[data.length - 1]?.benchmarkReturn ?? 0;
  const isPositive = latestChange >= 0;
  const strokeColor = isPositive ? '#10B981' : '#F43F5E'; // emerald / rose
  const benchmarkColor = '#0052FF'; // base-blue
  const gradientId = `performanceGradient-${portfolioId || address || 'default'}`;
  const benchmarkGradientId = `benchmarkGradient-${portfolioId || address || 'default'}`;

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: '24h', label: '24h' },
    { value: '1W', label: '1W' },
    { value: '1M', label: '1M' },
    { value: '3M', label: '3M' },
    { value: 'All', label: 'All' },
  ];

  return (
    <div className={className}>
      {/* Controls */}
      {showTimeRange && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  timeRange === option.value
                    ? 'bg-base-blue text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {showBenchmark && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Benchmark:</span>
              <select
                value={selectedBenchmark}
                onChange={(e) => setSelectedBenchmark(e.target.value as 'BTC' | 'market')}
                className="px-2 py-1 text-xs bg-white/5 text-white border border-white/10 rounded-lg focus:outline-none focus:border-base-blue"
              >
                <option value="BTC">BTC</option>
                <option value="market">Market Avg</option>
              </select>
            </div>
          )}
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          {/* Gradient definitions */}
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
            {showBenchmark && (
              <linearGradient id={benchmarkGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={benchmarkColor} stopOpacity={0.2} />
                <stop offset="100%" stopColor={benchmarkColor} stopOpacity={0} />
              </linearGradient>
            )}
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
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                tickMargin={8}
                tickFormatter={(value) => {
                  // Format as percentage for returns, or value for portfolio value
                  if (showBenchmark && data.length > 0 && data[0].portfolioValue) {
                    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
                  }
                  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
                }}
                domain={['auto', 'auto']}
              />
            </>
          )}

          {/* Reference line at 0 */}
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />

          {/* Tooltip */}
          {showTooltip && <Tooltip content={<CustomTooltip />} />}

          {/* Legend */}
          {showBenchmark && <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="line"
            formatter={(value) => {
              if (value === 'portfolioReturn') return 'Portfolio';
              if (value === 'benchmarkReturn') return selectedBenchmark === 'BTC' ? 'BTC' : 'Market';
              return value;
            }}
          />}

          {/* Area fills */}
          {showGradient && (
            <>
              <Area
                type="monotone"
                dataKey={showBenchmark ? "portfolioReturn" : "change"}
                stroke="none"
                fill={`url(#${gradientId})`}
              />
              {showBenchmark && (
                <Area
                  type="monotone"
                  dataKey="benchmarkReturn"
                  stroke="none"
                  fill={`url(#${benchmarkGradientId})`}
                />
              )}
            </>
          )}

          {/* Lines */}
          <Line
            type="monotone"
            dataKey={showBenchmark ? "portfolioReturn" : "change"}
            stroke={strokeColor}
            strokeWidth={2}
            dot={false}
            name="portfolioReturn"
            activeDot={{
              r: 4,
              fill: strokeColor,
              stroke: 'white',
              strokeWidth: 2,
            }}
          />
          
          {showBenchmark && (
            <Line
              type="monotone"
              dataKey="benchmarkReturn"
              stroke={benchmarkColor}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="benchmarkReturn"
              activeDot={{
                r: 4,
                fill: benchmarkColor,
                stroke: 'white',
                strokeWidth: 2,
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Summary */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-white/40">Portfolio: </span>
            <span className={`font-mono font-bold ${isPositive ? 'text-accent-emerald' : 'text-accent-rose'}`}>
              {isPositive ? '+' : ''}{latestChange.toFixed(2)}%
            </span>
          </div>
          {showBenchmark && latestBenchmark !== 0 && (
            <div>
              <span className="text-white/40">Benchmark: </span>
              <span className={`font-mono font-bold ${latestBenchmark >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                {latestBenchmark >= 0 ? '+' : ''}{latestBenchmark.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        {showBenchmark && latestBenchmark !== 0 && (
          <div>
            <span className="text-white/40">Outperformance: </span>
            <span className={`font-mono font-bold ${(latestChange - latestBenchmark) >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
              {(latestChange - latestBenchmark) >= 0 ? '+' : ''}{(latestChange - latestBenchmark).toFixed(2)}%
            </span>
          </div>
        )}
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









