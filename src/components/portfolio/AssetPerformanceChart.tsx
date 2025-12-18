'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { getAsset } from '@/lib/assets';
import { useLivePrices } from '@/hooks/useLivePrices';

type Allocation = {
  symbol: string;
  percentage: number;
};

type Props = {
  allocations: Allocation[];
  entryPrices: Record<string, number>;
  className?: string;
  height?: number;
};

type PriceHistoryItem = {
  timestamp: number;
  price: number;
  date: string;
  entryPrice: number;
  currentPrice: number;
  returnPct: number;
};

type AssetPerformanceData = {
  symbol: string;
  name: string;
  color: string;
  logo: string;
  entryPrice: number;
  currentPrice: number;
  returnPct: number;
  allocation: number;
  priceHistory: PriceHistoryItem[];
};

// Custom tooltip for asset performance
function AssetTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    name: string;
    color: string;
    payload: any;
  }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const entryPrice = data.entryPrice;
  const currentPrice = data.currentPrice || data.price;
  const returnPct = data.returnPct ?? ((currentPrice - entryPrice) / entryPrice) * 100;
  const isPositive = returnPct >= 0;

  return (
    <div className="rounded-lg border border-white/10 bg-surface-3 px-4 py-3 shadow-lg backdrop-blur-sm">
      <p className="text-xs text-white/50 mb-2 font-medium">{label || data.date}</p>
      
      <div className="space-y-2">
        <div>
          <div className="text-xs text-white/60 mb-1">Current Price</div>
          <p className="text-sm font-bold text-white font-mono">
            ${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </p>
        </div>
        
        {entryPrice > 0 && (
          <>
            <div>
              <div className="text-xs text-white/60 mb-1">Entry Price</div>
              <p className="text-sm font-mono text-white/80">
                ${entryPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </p>
            </div>
            
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Return</span>
                <span className={`text-sm font-bold font-mono ${isPositive ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                  {isPositive ? '+' : ''}{returnPct.toFixed(2)}%
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AssetPerformanceChart({
  allocations,
  entryPrices,
  className = '',
  height = 300,
}: Props) {
  const { prices, isLoading } = useLivePrices({ interval: 30000 });
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  // Calculate asset performance data
  const assetData = useMemo(() => {
    return allocations
      .filter(a => a.percentage > 0)
      .map(allocation => {
        const asset = getAsset(allocation.symbol);
        if (!asset) return null;

        const entryPrice = entryPrices[allocation.symbol] || 0;
        const currentPrice = prices[allocation.symbol]?.price || 0;
        const returnPct = entryPrice > 0 
          ? ((currentPrice - entryPrice) / entryPrice) * 100 
          : 0;

        // Generate simplified price history (in real app, fetch from API)
        const now = Date.now();
        const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
        const history: PriceHistoryItem[] = [];
        
        for (let i = days; i >= 0; i--) {
          const timestamp = now - i * 24 * 60 * 60 * 1000;
          const date = new Date(timestamp);
          
          // Simulate price movement (in real app, use historical data)
          const daysAgo = days - i;
          const priceChange = (Math.random() - 0.5) * 0.1 * daysAgo;
          const historicalPrice = entryPrice > 0 
            ? entryPrice * (1 + priceChange / 100)
            : currentPrice * (1 - priceChange / 100);
          
          history.push({
            timestamp,
            price: historicalPrice,
            date: date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              ...(timeRange === '30d' ? { year: 'numeric' } : {})
            }),
            entryPrice,
            currentPrice: historicalPrice,
            returnPct: entryPrice > 0 
              ? ((historicalPrice - entryPrice) / entryPrice) * 100 
              : 0,
          });
        }

        return {
          symbol: allocation.symbol,
          name: asset.name,
          color: asset.color,
          logo: asset.logo,
          entryPrice,
          currentPrice,
          returnPct,
          allocation: allocation.percentage,
          priceHistory: history,
        };
      })
      .filter((item): item is AssetPerformanceData => item !== null)
      .sort((a, b) => Math.abs(b.returnPct) - Math.abs(a.returnPct)); // Sort by absolute return
  }, [allocations, entryPrices, prices, timeRange]);

  // Set first asset as selected by default
  useEffect(() => {
    if (!selectedAsset && assetData.length > 0) {
      setSelectedAsset(assetData[0].symbol);
    }
  }, [assetData, selectedAsset]);

  const selectedAssetData = assetData.find(a => a.symbol === selectedAsset);

  if (assetData.length === 0) {
    return (
      <div className={`rounded-2xl border border-white/5 bg-white/[0.02] p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center py-8">
          <svg className="h-10 w-10 text-white/20 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm text-white/40">No assets to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Asset Performance</h3>
            <p className="text-xs text-white/40">Individual asset returns and price history</p>
          </div>
          
          {/* Time range selector */}
          <div className="flex items-center gap-2">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-base-blue text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Asset selector */}
        <div className="flex flex-wrap gap-2">
          {assetData.map((asset) => {
            const isSelected = selectedAsset === asset.symbol;
            const isPositive = asset.returnPct >= 0;

            return (
              <button
                key={asset.symbol}
                onClick={() => setSelectedAsset(asset.symbol)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
                  ${isSelected
                    ? 'border-white/20 bg-white/10'
                    : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/5'
                  }
                `}
                style={{
                  borderColor: isSelected ? asset.color : undefined,
                }}
              >
                {asset.logo && (
                  <Image
                    src={asset.logo}
                    alt={asset.symbol}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                )}
                <span className="font-mono text-sm font-bold text-white">{asset.symbol}</span>
                <span className={`text-xs font-mono ${isPositive ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                  {isPositive ? '+' : ''}{asset.returnPct.toFixed(2)}%
                </span>
                <span className="text-xs text-white/40">{asset.allocation}%</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      {selectedAssetData && (
        <div className="p-6">
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <svg className="h-8 w-8 animate-spin text-base-blue" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}

          {!isLoading && (
            <>
              {/* Asset summary */}
              <div className="mb-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedAssetData.logo && (
                      <Image
                        src={selectedAssetData.logo}
                        alt={selectedAssetData.symbol}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-white">{selectedAssetData.name}</h4>
                        <span className="font-mono text-sm text-white/60">{selectedAssetData.symbol}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <div>
                          <span className="text-xs text-white/40">Allocation: </span>
                          <span className="text-sm font-mono text-white">{selectedAssetData.allocation}%</span>
                        </div>
                        <div>
                          <span className="text-xs text-white/40">Return: </span>
                          <span className={`text-sm font-mono font-bold ${selectedAssetData.returnPct >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                            {selectedAssetData.returnPct >= 0 ? '+' : ''}{selectedAssetData.returnPct.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-white/40 mb-1">Current Price</div>
                    <div className="text-lg font-mono font-bold text-white">
                      ${selectedAssetData.currentPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </div>
                    {selectedAssetData.entryPrice > 0 && (
                      <>
                        <div className="text-xs text-white/40 mt-2 mb-1">Entry Price</div>
                        <div className="text-sm font-mono text-white/80">
                          ${selectedAssetData.entryPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Price chart */}
              <ResponsiveContainer width="100%" height={height}>
                <LineChart data={selectedAssetData.priceHistory} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <defs>
                    <linearGradient id={`assetGradient-${selectedAssetData.symbol}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={selectedAssetData.color} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={selectedAssetData.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <XAxis
                    dataKey="date"
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
                    tickFormatter={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                    domain={['auto', 'auto']}
                  />

                  <Tooltip content={<AssetTooltip />} />

                  {/* Entry price reference line */}
                  {selectedAssetData.entryPrice > 0 && (
                    <ReferenceLine
                      y={selectedAssetData.entryPrice}
                      stroke={selectedAssetData.color}
                      strokeDasharray="5 5"
                      strokeOpacity={0.5}
                      label={{ value: 'Entry', position: 'right', fill: selectedAssetData.color, fontSize: 10 }}
                    />
                  )}

                  {/* Current price line */}
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke={selectedAssetData.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: selectedAssetData.color,
                      stroke: 'white',
                      strokeWidth: 2,
                    }}
                    name="Price"
                  />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      )}
    </div>
  );
}
