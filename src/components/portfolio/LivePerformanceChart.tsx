'use client';

import { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLivePortfolio } from '@/hooks/useLivePrices';

type ChartDataPoint = {
  time: string;
  value: number;
  return: number;
};

type LivePerformanceChartProps = {
  address: string;
  assets: string[];
  weights: number[];
  entryPrices: Record<string, number>;
  height?: number;
  showGrid?: boolean;
};

/**
 * Live performance chart that updates every 30 seconds
 * Shows real-time portfolio value based on entry prices and current market data
 */
export default function LivePerformanceChart({
  address,
  assets,
  weights,
  entryPrices,
  height = 200,
  showGrid = false,
}: LivePerformanceChartProps) {
  const hasValidData = assets.length > 0 && Object.keys(entryPrices).length > 0;

  const {
    currentReturn,
    currentValue,
    lastUpdated,
    isLoading,
    error,
    priceHistory
  } = useLivePortfolio(assets, weights, entryPrices, {
    enabled: hasValidData,
    initialValue: 100,
    maxHistoryPoints: 60 // ~30 minutes of data at 30s intervals
  });

  // Transform price history to chart data
  const chartData = useMemo(() => {
    if (priceHistory.length === 0) {
      // Add initial point if no history
      return [{
        time: 'Start',
        value: 100,
        return: 0
      }];
    }

    return priceHistory.map((point, idx) => {
      const time = new Date(point.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });

      return {
        time: idx === 0 ? 'Start' : time,
        value: point.value,
        return: point.return
      };
    });
  }, [priceHistory]);

  // Format for display
  const formatValue = (value: number) => `$${value.toFixed(2)}`;
  const formatReturn = (ret: number) => {
    const sign = ret >= 0 ? '+' : '';
    return `${sign}${ret.toFixed(2)}%`;
  };

  const isPositive = currentReturn >= 0;
  const lastUpdateTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString()
    : null;

  if (!hasValidData) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-white/5 bg-surface-2"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-sm text-white/40">No active portfolio</div>
          <div className="mt-1 text-xs text-white/20">Lock in your picks to see live performance</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/5 bg-surface-2 p-4">
      {/* Header with live indicator */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-emerald opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-emerald"></span>
          </div>
          <span className="text-sm font-medium text-white">Live Performance</span>
        </div>
        {lastUpdateTime && (
          <span className="text-xs text-white/30">Updated {lastUpdateTime}</span>
        )}
      </div>

      {/* Current stats */}
      <div className="mb-4 flex items-baseline gap-4">
        <div className="text-2xl font-bold text-white">
          {formatValue(currentValue)}
        </div>
        <div className={`text-lg font-medium ${isPositive ? 'text-accent-emerald' : 'text-accent-rose'}`}>
          {formatReturn(currentReturn)}
        </div>
      </div>

      {/* Chart */}
      {isLoading && chartData.length <= 1 ? (
        <div className="flex items-center justify-center" style={{ height: height - 100 }}>
          <div className="animate-pulse text-white/40">Loading chart...</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height - 100}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            )}
            <XAxis
              dataKey="time"
              stroke="rgba(255,255,255,0.2)"
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="rgba(255,255,255,0.2)"
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              formatter={(value: number, name: string, props: any) => {
                const ret = props.payload.return;
                return [
                  <span key="value">
                    ${value.toFixed(2)} ({ret >= 0 ? '+' : ''}{ret.toFixed(2)}%)
                  </span>,
                  'Value'
                ];
              }}
            />
            <defs>
              <linearGradient id="liveChartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isPositive ? '#10B981' : '#EF4444'}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={isPositive ? '#10B981' : '#EF4444'}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={isPositive ? '#10B981' : '#EF4444'}
              strokeWidth={2}
              fill="url(#liveChartGradient)"
              animationDuration={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-2 rounded-lg bg-accent-rose/10 px-3 py-2 text-xs text-accent-rose">
          {error}
        </div>
      )}

      {/* Refresh info */}
      <div className="mt-2 text-center text-xs text-white/20">
        Updates every 30 seconds
      </div>
    </div>
  );
}

/**
 * Compact live return display for use in headers/cards
 */
export function LiveReturnBadge({
  assets,
  weights,
  entryPrices,
}: {
  assets: string[];
  weights: number[];
  entryPrices: Record<string, number>;
}) {
  const hasValidData = assets.length > 0 && Object.keys(entryPrices).length > 0;

  const { currentReturn, isLoading } = useLivePortfolio(assets, weights, entryPrices, {
    enabled: hasValidData,
    initialValue: 100
  });

  if (!hasValidData || isLoading) {
    return null;
  }

  const isPositive = currentReturn >= 0;

  return (
    <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
      isPositive
        ? 'bg-accent-emerald/10 text-accent-emerald'
        : 'bg-accent-rose/10 text-accent-rose'
    }`}>
      <div className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
          style={{ backgroundColor: isPositive ? '#10B981' : '#EF4444' }}
        ></span>
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: isPositive ? '#10B981' : '#EF4444' }}
        ></span>
      </div>
      <span>{isPositive ? '+' : ''}{currentReturn.toFixed(2)}%</span>
    </div>
  );
}
