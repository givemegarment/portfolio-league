'use client';

import { useRef, useEffect, useState } from 'react';
import type { NormalizedTick } from '@/lib/engine/types';

interface TradesPanelProps {
  trades: NormalizedTick[];
  className?: string;
}

export function TradesPanel({ trades, className = '' }: TradesPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to latest trade
  useEffect(() => {
    if (autoScroll && containerRef.current && trades.length > 0) {
      containerRef.current.scrollTop = 0;
    }
  }, [trades, autoScroll]);

  // Format time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Format price
  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(8);
  };

  // Format size
  const formatSize = (size: number) => {
    if (size >= 1) return size.toFixed(4);
    return size.toFixed(6);
  };

  // Generate mock trades if empty
  const displayTrades = trades.length > 0 ? trades : generateMockTrades(50);

  return (
    <div className={`flex flex-col bg-[#0a0a0f] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
        <span className="text-sm font-semibold text-white">Recent Trades</span>

        {/* Auto-scroll toggle */}
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`flex items-center gap-1.5 rounded px-2 py-1 text-[10px] transition-colors ${
            autoScroll
              ? 'bg-base-blue/20 text-base-blue'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
          Auto
        </button>
      </div>

      {/* Column headers */}
      <div className="flex items-center border-b border-white/5 px-3 py-1.5 text-[10px] text-white/40">
        <span className="w-[30%]">Price</span>
        <span className="w-[35%] text-right">Size</span>
        <span className="w-[35%] text-right">Time</span>
      </div>

      {/* Trades list */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
      >
        {displayTrades.map((trade, index) => (
          <div
            key={trade.tradeId || `${trade.timestamp}-${index}`}
            className={`flex items-center px-3 py-1 text-xs font-mono transition-colors hover:bg-white/[0.02] ${
              index === 0 ? 'animate-flash' : ''
            }`}
          >
            {/* Price */}
            <span
              className={`w-[30%] ${
                trade.side === 'buy' ? 'text-accent-emerald' : 'text-accent-rose'
              }`}
            >
              {formatPrice(trade.price)}
            </span>

            {/* Size */}
            <span className="w-[35%] text-right text-white/80">
              {formatSize(trade.size)}
            </span>

            {/* Time */}
            <span className="w-[35%] text-right text-white/40">
              {formatTime(trade.timestamp)}
            </span>
          </div>
        ))}
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between border-t border-white/5 px-3 py-1.5 text-[10px] text-white/30">
        <span>Last {displayTrades.length} trades</span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald" />
            Buys: {displayTrades.filter(t => t.side === 'buy').length}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-rose" />
            Sells: {displayTrades.filter(t => t.side === 'sell').length}
          </span>
        </div>
      </div>
    </div>
  );
}

// Generate mock trades for demo
function generateMockTrades(count: number): NormalizedTick[] {
  const trades: NormalizedTick[] = [];
  let basePrice = 42500;
  let timestamp = Date.now();

  for (let i = 0; i < count; i++) {
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    const priceChange = (Math.random() - 0.5) * 20;
    basePrice += priceChange;

    trades.push({
      symbol: 'BTCUSDT',
      exchange: 'binance',
      timestamp: timestamp - i * (Math.random() * 5000 + 1000),
      price: basePrice,
      size: Math.random() * 2 + 0.001,
      side,
      tradeId: `${timestamp}-${i}`,
    });
  }

  return trades;
}

export default TradesPanel;
