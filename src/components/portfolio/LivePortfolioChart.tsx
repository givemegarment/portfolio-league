'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
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
  entryPrices?: Record<string, number>;
  className?: string;
  showLegend?: boolean;
  showPriceChange?: boolean;
  animated?: boolean;
};

// Glowing outer ring for Web3 aesthetic
function GlowRing({ color, animate = true }: { color: string; animate?: boolean }) {
  return (
    <div 
      className={`absolute inset-0 rounded-full opacity-30 blur-xl ${animate ? 'animate-pulse-glow' : ''}`}
      style={{ 
        background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
      }}
    />
  );
}

// Custom tooltip for pie chart
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { symbol: string; percentage: number; value: number; price: number; change: number } }> }) {
  if (!active || !payload || !payload.length) return null;
  
  const data = payload[0].payload;
  const isPositive = data.change >= 0;
  
  return (
    <div className="rounded-xl border border-white/10 bg-surface-3/95 backdrop-blur-sm px-4 py-3 shadow-lg shadow-black/20">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono font-bold text-white">{data.symbol}</span>
        <span className="text-white/50">{data.percentage}%</span>
      </div>
      <div className="text-sm text-white/70">
        Price: <span className="font-mono text-white">${data.price.toLocaleString()}</span>
      </div>
      <div className={`text-sm font-mono ${isPositive ? 'text-accent-emerald' : 'text-accent-rose'}`}>
        24h: {isPositive ? '+' : ''}{data.change.toFixed(2)}%
      </div>
    </div>
  );
}

export default function LivePortfolioChart({
  allocations,
  entryPrices = {},
  className = '',
  showLegend = true,
  showPriceChange = true,
  animated = true,
}: Props) {
  const { prices, isLoading, lastUpdated } = useLivePrices({ interval: 30000 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Calculate chart data with live prices
  const chartData = useMemo(() => {
    return allocations
      .filter(a => a.percentage > 0)
      .map(allocation => {
        const asset = getAsset(allocation.symbol);
        const priceData = prices[allocation.symbol];
        const entryPrice = entryPrices[allocation.symbol];
        
        // Calculate return if we have entry price
        let returnPct = 0;
        if (entryPrice && priceData) {
          returnPct = ((priceData.price - entryPrice) / entryPrice) * 100;
        }

        return {
          symbol: allocation.symbol,
          percentage: allocation.percentage,
          value: allocation.percentage,
          color: asset?.color || '#666',
          price: priceData?.price || 0,
          change: priceData?.change24h || 0,
          returnPct,
          entryPrice: entryPrice || 0,
        };
      });
  }, [allocations, prices, entryPrices]);

  // Calculate total portfolio return
  const totalReturn = useMemo(() => {
    if (Object.keys(entryPrices).length === 0) return null;
    
    return chartData.reduce((sum, item) => {
      return sum + (item.returnPct * (item.percentage / 100));
    }, 0);
  }, [chartData, entryPrices]);

  // Get dominant color for glow effect
  const dominantColor = chartData.length > 0 ? chartData[0].color : '#0052FF';

  if (allocations.length === 0) {
    return (
      <div className={`relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative mb-4">
            <div className="h-24 w-24 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
              <svg className="h-10 w-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
          <p className="text-white/50 text-sm">No portfolio to display</p>
          <p className="text-white/30 text-xs mt-1">Add assets to see your allocation</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden ${className}`}>
      {/* Web3 gradient background */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
      
      {/* Animated glow orbs */}
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-base-blue/10 blur-3xl animate-float" />
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-purple-600/10 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent-emerald animate-pulse" />
              Live Portfolio
            </h3>
            {lastUpdated && (
              <p className="text-xs text-white/40 mt-0.5">
                Updated {new Date(lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>
          
          {/* Total Return Badge */}
          {totalReturn !== null && (
            <div className={`
              px-4 py-2 rounded-xl font-mono font-bold text-lg
              ${totalReturn >= 0 
                ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20' 
                : 'bg-accent-rose/10 text-accent-rose border border-accent-rose/20'
              }
            `}>
              {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="relative">
            <GlowRing color={dominantColor} animate={animated} />
            
            <div className="relative h-64">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="h-8 w-8 animate-spin text-base-blue" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={animated ? 800 : 0}
                      onMouseEnter={(_, index) => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="transparent"
                          style={{
                            filter: hoveredIndex === index ? `drop-shadow(0 0 8px ${entry.color})` : 'none',
                            transform: hoveredIndex === index ? 'scale(1.02)' : 'scale(1)',
                            transformOrigin: 'center',
                            transition: 'all 0.2s ease',
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-white/40 uppercase tracking-wider">Total</span>
                <span className="text-2xl font-bold text-white">100%</span>
              </div>
            </div>
          </div>

          {/* Asset List with Live Prices */}
          <div className="space-y-3">
            {chartData.map((item, index) => {
              const asset = getAsset(item.symbol);
              const isPositive = item.change >= 0;
              const returnPositive = item.returnPct >= 0;
              
              return (
                <div
                  key={item.symbol}
                  className={`
                    relative rounded-xl border border-white/5 bg-white/[0.02] p-3 
                    transition-all duration-200 hover:bg-white/[0.04] hover:border-white/10
                    ${hoveredIndex === index ? 'ring-1 ring-white/20' : ''}
                  `}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Accent bar */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                    style={{ backgroundColor: item.color }}
                  />
                  
                  <div className="flex items-center justify-between pl-3">
                    <div className="flex items-center gap-3">
                      {/* Asset icon */}
                      <div 
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        {asset?.logo && (
                          <Image
                            src={asset.logo}
                            alt={item.symbol}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{item.symbol}</span>
                          <span className="text-sm text-white/40">{item.percentage}%</span>
                        </div>
                        {showPriceChange && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-white/50 font-mono">
                              ${item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                            <span className={`font-mono ${isPositive ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                              {isPositive ? '↑' : '↓'} {Math.abs(item.change).toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Return from entry */}
                    {item.entryPrice > 0 && (
                      <div className="text-right">
                        <span className="text-xs text-white/40 block">Return</span>
                        <span className={`font-mono font-bold ${returnPositive ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                          {returnPositive ? '+' : ''}{item.returnPct.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}




