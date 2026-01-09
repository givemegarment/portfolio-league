'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type {
  IChartApi,
  ISeriesApi,
  CandlestickData,
  Time,
  DeepPartial,
  ChartOptions,
  CandlestickSeriesOptions,
  HistogramSeriesOptions,
} from 'lightweight-charts';
import type { ExchangeId, Timeframe, OHLCV } from '@/lib/engine/types';

interface ChartPanelProps {
  symbol: string;
  exchange: ExchangeId;
  timeframe: Timeframe;
  className?: string;
}

// Chart theme configuration
const CHART_OPTIONS: DeepPartial<ChartOptions> = {
  layout: {
    background: { color: '#0a0a0f' },
    textColor: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
  },
  grid: {
    vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
    horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
  },
  crosshair: {
    mode: 1, // CrosshairMode.Normal
    vertLine: {
      color: 'rgba(255, 255, 255, 0.3)',
      width: 1,
      style: 2, // LineStyle.Dashed
      labelBackgroundColor: '#0052FF',
    },
    horzLine: {
      color: 'rgba(255, 255, 255, 0.3)',
      width: 1,
      style: 2,
      labelBackgroundColor: '#0052FF',
    },
  },
  timeScale: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    timeVisible: true,
    secondsVisible: false,
  },
  rightPriceScale: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    scaleMargins: {
      top: 0.1,
      bottom: 0.2,
    },
  },
  handleScale: {
    axisPressedMouseMove: true,
  },
  handleScroll: {
    mouseWheel: true,
    pressedMouseMove: true,
  },
};

const CANDLESTICK_OPTIONS: DeepPartial<CandlestickSeriesOptions> = {
  upColor: '#10B981',
  downColor: '#EF4444',
  borderUpColor: '#10B981',
  borderDownColor: '#EF4444',
  wickUpColor: '#10B981',
  wickDownColor: '#EF4444',
};

const VOLUME_OPTIONS: DeepPartial<HistogramSeriesOptions> = {
  color: '#0052FF',
  priceFormat: {
    type: 'volume',
  },
  priceScaleId: 'volume',
};

// Mock data generator for demo
function generateMockData(count: number, timeframe: Timeframe): CandlestickData<Time>[] {
  const data: CandlestickData<Time>[] = [];
  const timeframeMs: Record<Timeframe, number> = {
    '1s': 1000, '5s': 5000, '15s': 15000, '30s': 30000,
    '1m': 60000, '3m': 180000, '5m': 300000, '15m': 900000, '30m': 1800000,
    '1h': 3600000, '2h': 7200000, '4h': 14400000, '6h': 21600000,
    '8h': 28800000, '12h': 43200000,
    '1d': 86400000, '3d': 259200000, '1w': 604800000, '1M': 2592000000,
  };

  const interval = timeframeMs[timeframe];
  let baseTime = Date.now() - count * interval;
  let price = 42000 + Math.random() * 2000;

  for (let i = 0; i < count; i++) {
    const volatility = 0.02;
    const change = (Math.random() - 0.5) * 2 * volatility * price;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
    const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);

    data.push({
      time: (Math.floor(baseTime / 1000)) as Time,
      open,
      high,
      low,
      close,
    });

    price = close;
    baseTime += interval;
  }

  return data;
}

function generateVolumeData(candleData: CandlestickData<Time>[]) {
  return candleData.map((candle) => ({
    time: candle.time,
    value: Math.random() * 1000000 + 500000,
    color: candle.close >= candle.open
      ? 'rgba(16, 185, 129, 0.3)'
      : 'rgba(239, 68, 68, 0.3)',
  }));
}

export function ChartPanel({ symbol, exchange, timeframe, className = '' }: ChartPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [crosshairData, setCrosshairData] = useState<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    change: number;
    changePercent: number;
  } | null>(null);

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return;

    let chart: IChartApi | null = null;

    const initChart = async () => {
      const LightweightCharts = await import('lightweight-charts');

      if (!containerRef.current) return;

      // Create chart
      chart = LightweightCharts.createChart(containerRef.current, {
        ...CHART_OPTIONS,
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });

      chartRef.current = chart;

      // Add candlestick series (v5 API)
      const candleSeries = chart.addSeries(
        LightweightCharts.CandlestickSeries,
        CANDLESTICK_OPTIONS
      );
      candleSeriesRef.current = candleSeries as unknown as ISeriesApi<'Candlestick'>;

      // Add volume series with separate price scale (v5 API)
      const volumeSeries = chart.addSeries(LightweightCharts.HistogramSeries, {
        ...VOLUME_OPTIONS,
        priceScaleId: 'volume',
      });
      volumeSeriesRef.current = volumeSeries as unknown as ISeriesApi<'Histogram'>;

      // Configure volume scale
      chart.priceScale('volume').applyOptions({
        scaleMargins: {
          top: 0.85,
          bottom: 0,
        },
      });

      // Generate and set initial data
      const candleData = generateMockData(200, timeframe);
      const volumeData = generateVolumeData(candleData);

      candleSeries.setData(candleData);
      volumeSeries.setData(volumeData);

      // Fit content
      chart.timeScale().fitContent();

      // Subscribe to crosshair move
      chart.subscribeCrosshairMove((param) => {
        if (!param.time || !param.seriesData.size) {
          setCrosshairData(null);
          return;
        }

        const candleData = param.seriesData.get(candleSeries) as CandlestickData<Time> | undefined;
        if (candleData) {
          const change = candleData.close - candleData.open;
          const changePercent = (change / candleData.open) * 100;

          setCrosshairData({
            time: new Date((param.time as number) * 1000).toLocaleString(),
            open: candleData.open,
            high: candleData.high,
            low: candleData.low,
            close: candleData.close,
            change,
            changePercent,
          });
        }
      });

      setIsLoading(false);
    };

    initChart();

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (chartRef.current && entries[0]) {
        const { width, height } = entries[0].contentRect;
        chartRef.current.applyOptions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chart) {
        chart.remove();
        chartRef.current = null;
      }
    };
  }, []);

  // Update data when timeframe changes
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return;

    setIsLoading(true);

    // Simulate data fetch delay
    const timer = setTimeout(() => {
      const candleData = generateMockData(200, timeframe);
      const volumeData = generateVolumeData(candleData);

      candleSeriesRef.current?.setData(candleData);
      volumeSeriesRef.current?.setData(volumeData);

      chartRef.current?.timeScale().fitContent();
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [timeframe, symbol, exchange]);

  // Format price
  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(8);
  };

  return (
    <div className={`relative flex flex-col bg-[#0a0a0f] ${className}`}>
      {/* Chart Header / OHLC Display */}
      <div className="flex items-center gap-4 px-3 py-2 text-xs border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">{symbol}</span>
          <span className="text-white/40">{timeframe}</span>
        </div>

        {crosshairData ? (
          <>
            <div className="flex items-center gap-1">
              <span className="text-white/40">O</span>
              <span className="font-mono text-white">{formatPrice(crosshairData.open)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-white/40">H</span>
              <span className="font-mono text-accent-emerald">{formatPrice(crosshairData.high)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-white/40">L</span>
              <span className="font-mono text-accent-rose">{formatPrice(crosshairData.low)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-white/40">C</span>
              <span className="font-mono text-white">{formatPrice(crosshairData.close)}</span>
            </div>
            <div
              className={`font-mono ${
                crosshairData.change >= 0 ? 'text-accent-emerald' : 'text-accent-rose'
              }`}
            >
              {crosshairData.change >= 0 ? '+' : ''}
              {crosshairData.changePercent.toFixed(2)}%
            </div>
          </>
        ) : (
          <span className="text-white/30">Hover over chart</span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Chart type selector (placeholder) */}
        <div className="flex items-center gap-1">
          <button className="rounded px-2 py-1 text-white/60 hover:bg-white/5 hover:text-white transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2zM9 7v4m0 4v2m6-10v6m0 4v.01" />
            </svg>
          </button>
          <button className="rounded px-2 py-1 text-white/60 hover:bg-white/5 hover:text-white transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div ref={containerRef} className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]/80 z-10">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-base-blue border-t-transparent" />
              <span className="text-sm text-white/60">Loading chart...</span>
            </div>
          </div>
        )}
      </div>

      {/* Watermark */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none opacity-5">
        <span className="text-4xl font-bold tracking-wider">IMITATIO</span>
      </div>
    </div>
  );
}

export default ChartPanel;
