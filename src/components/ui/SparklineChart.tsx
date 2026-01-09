'use client';

import { useMemo } from 'react';

export type SparklineChartProps = {
  /** Array of numeric data points to visualize */
  data: number[];
  /** Width of the chart in pixels */
  width?: number;
  /** Height of the chart in pixels */
  height?: number;
  /** Override the trend color (defaults to auto-detect based on data) */
  color?: string;
  /** Show a subtle area fill under the line */
  showArea?: boolean;
  /** Stroke width of the line */
  strokeWidth?: number;
  /** Optional CSS class name */
  className?: string;
};

/**
 * SparklineChart - A lightweight SVG sparkline for inline price history visualization
 *
 * Renders a small chart showing price trends. Automatically colors green for upward
 * trends and red for downward trends based on first vs last data point.
 *
 * @example
 * // Basic usage with 7 data points
 * <SparklineChart data={[100, 102, 98, 105, 103, 108, 110]} />
 *
 * // Custom dimensions
 * <SparklineChart data={priceHistory} width={120} height={40} />
 *
 * // With area fill
 * <SparklineChart data={priceHistory} showArea />
 */
export default function SparklineChart({
  data,
  width = 80,
  height = 24,
  color,
  showArea = false,
  strokeWidth = 1.5,
  className = '',
}: SparklineChartProps) {
  const { path, areaPath, isPositive, isEmpty } = useMemo(() => {
    // Handle empty or single data point
    if (!data || data.length < 2) {
      return { path: '', areaPath: '', isPositive: true, isEmpty: true };
    }

    // Determine trend direction
    const firstValue = data[0];
    const lastValue = data[data.length - 1];
    const isPositiveTrend = lastValue >= firstValue;

    // Calculate min/max for scaling
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const valueRange = maxValue - minValue || 1; // Avoid division by zero

    // Padding to prevent clipping at edges
    const paddingX = 2;
    const paddingY = 2;
    const chartWidth = width - paddingX * 2;
    const chartHeight = height - paddingY * 2;

    // Generate path points
    const points = data.map((value, index) => {
      const x = paddingX + (index / (data.length - 1)) * chartWidth;
      // Invert Y since SVG origin is top-left
      const y = paddingY + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      return { x, y };
    });

    // Build SVG path
    const pathD = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(' ');

    // Build area path (for fill under the line)
    const areaPathD = `${pathD} L ${points[points.length - 1].x.toFixed(2)} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`;

    return {
      path: pathD,
      areaPath: areaPathD,
      isPositive: isPositiveTrend,
      isEmpty: false,
    };
  }, [data, width, height]);

  // Determine line color
  const lineColor = color || (isPositive ? '#10B981' : '#EF4444');

  // Empty state placeholder
  if (isEmpty) {
    return (
      <div
        className={`rounded bg-white/5 ${className}`}
        style={{ width, height }}
        aria-label="No data available"
      />
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible ${className}`}
      aria-label={`Price trend: ${isPositive ? 'up' : 'down'}`}
      role="img"
    >
      {/* Area fill (optional) */}
      {showArea && (
        <path
          d={areaPath}
          fill={lineColor}
          fillOpacity={0.1}
        />
      )}

      {/* Main line */}
      <path
        d={path}
        fill="none"
        stroke={lineColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * SparklineWithLabel - Sparkline with an optional percentage change label
 */
export function SparklineWithLabel({
  data,
  width = 80,
  height = 24,
  showLabel = true,
  className = '',
}: SparklineChartProps & { showLabel?: boolean }) {
  const change = useMemo(() => {
    if (!data || data.length < 2) return 0;
    const first = data[0];
    const last = data[data.length - 1];
    if (first === 0) return 0;
    return ((last - first) / first) * 100;
  }, [data]);

  const isPositive = change >= 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <SparklineChart data={data} width={width} height={height} showArea />
      {showLabel && (
        <span
          className={`text-xs font-mono font-medium ${
            isPositive ? 'text-accent-emerald' : 'text-accent-rose'
          }`}
        >
          {isPositive ? '+' : ''}{change.toFixed(1)}%
        </span>
      )}
    </div>
  );
}

/**
 * MiniBarChart - Small bar chart alternative to sparkline
 */
export function MiniBarChart({
  data,
  width = 80,
  height = 24,
  className = '',
}: SparklineChartProps) {
  const bars = useMemo(() => {
    if (!data || data.length === 0) return [];

    const minValue = Math.min(...data, 0);
    const maxValue = Math.max(...data);
    const valueRange = maxValue - minValue || 1;

    const padding = 1;
    const barWidth = Math.max(2, (width - padding * (data.length + 1)) / data.length);

    return data.map((value, index) => {
      const barHeight = ((value - minValue) / valueRange) * (height - 4);
      const x = padding + index * (barWidth + padding);
      const y = height - barHeight - 2;
      const isPositive = value >= 0;

      return {
        x,
        y,
        width: barWidth,
        height: Math.max(1, barHeight),
        color: isPositive ? '#10B981' : '#EF4444',
      };
    });
  }, [data, width, height]);

  if (bars.length === 0) {
    return (
      <div
        className={`rounded bg-white/5 ${className}`}
        style={{ width, height }}
      />
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label="Mini bar chart"
    >
      {bars.map((bar, index) => (
        <rect
          key={index}
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
          fill={bar.color}
          fillOpacity={0.8}
          rx={1}
        />
      ))}
    </svg>
  );
}
