'use client';

import { useState, useMemo, useCallback } from 'react';
import type { OrderBook as OrderBookType, OrderBookLevel } from '@/lib/engine/types';

interface OrderBookProps {
  orderBook: OrderBookType | null;
  lastPrice?: number;
  className?: string;
}

type ViewMode = 'both' | 'bids' | 'asks';
type Precision = 0.01 | 0.1 | 1 | 10 | 100;

// Generate mock order book data
function generateMockOrderBook(basePrice: number = 42500): OrderBookType {
  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];

  let bidTotal = 0;
  let askTotal = 0;

  // Generate bids (buy orders below current price)
  for (let i = 0; i < 20; i++) {
    const price = basePrice - (i + 1) * (Math.random() * 10 + 5);
    const size = Math.random() * 5 + 0.1;
    bidTotal += size;
    bids.push({ price, size, total: bidTotal });
  }

  // Generate asks (sell orders above current price)
  for (let i = 0; i < 20; i++) {
    const price = basePrice + (i + 1) * (Math.random() * 10 + 5);
    const size = Math.random() * 5 + 0.1;
    askTotal += size;
    asks.push({ price, size, total: askTotal });
  }

  return {
    symbol: 'BTCUSDT',
    exchange: 'binance',
    timestamp: Date.now(),
    bids,
    asks,
    spread: asks[0].price - bids[0].price,
    midPrice: (asks[0].price + bids[0].price) / 2,
  };
}

export function OrderBook({ orderBook: propOrderBook, lastPrice, className = '' }: OrderBookProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('both');
  const [precision, setPrecision] = useState<Precision>(0.1);
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null);

  // Use prop order book or generate mock data
  const orderBook = useMemo(() => {
    return propOrderBook || generateMockOrderBook(lastPrice);
  }, [propOrderBook, lastPrice]);

  // Calculate max total for depth visualization
  const maxTotal = useMemo(() => {
    const maxBid = orderBook.bids[orderBook.bids.length - 1]?.total || 0;
    const maxAsk = orderBook.asks[orderBook.asks.length - 1]?.total || 0;
    return Math.max(maxBid, maxAsk);
  }, [orderBook]);

  // Format price with appropriate precision
  const formatPrice = useCallback((price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(8);
  }, []);

  // Format size
  const formatSize = useCallback((size: number) => {
    if (size >= 1000) return (size / 1000).toFixed(2) + 'K';
    if (size >= 1) return size.toFixed(4);
    return size.toFixed(6);
  }, []);

  // Render order row
  const renderOrderRow = useCallback(
    (level: OrderBookLevel, type: 'bid' | 'ask', index: number) => {
      const isBid = type === 'bid';
      const depthPercent = (level.total / maxTotal) * 100;
      const isHovered = hoveredPrice === level.price;

      return (
        <div
          key={`${type}-${index}`}
          className={`group relative flex items-center h-6 px-2 text-xs font-mono cursor-pointer transition-colors ${
            isHovered ? 'bg-white/5' : 'hover:bg-white/[0.02]'
          }`}
          onMouseEnter={() => setHoveredPrice(level.price)}
          onMouseLeave={() => setHoveredPrice(null)}
        >
          {/* Depth bar */}
          <div
            className={`absolute inset-y-0 ${isBid ? 'right-0' : 'left-0'} transition-all ${
              isBid ? 'bg-accent-emerald/10' : 'bg-accent-rose/10'
            }`}
            style={{ width: `${depthPercent}%` }}
          />

          {/* Content */}
          <div className="relative flex w-full items-center">
            {/* Price */}
            <span
              className={`w-[35%] ${
                isBid ? 'text-accent-emerald' : 'text-accent-rose'
              }`}
            >
              {formatPrice(level.price)}
            </span>

            {/* Size */}
            <span className="w-[30%] text-right text-white/80">
              {formatSize(level.size)}
            </span>

            {/* Total */}
            <span className="w-[35%] text-right text-white/40">
              {formatSize(level.total)}
            </span>
          </div>
        </div>
      );
    },
    [maxTotal, hoveredPrice, formatPrice, formatSize]
  );

  // Display rows based on view mode
  const visibleBids = viewMode === 'asks' ? [] : orderBook.bids.slice(0, viewMode === 'both' ? 15 : 30);
  const visibleAsks = viewMode === 'bids' ? [] : orderBook.asks.slice(0, viewMode === 'both' ? 15 : 30);

  return (
    <div className={`flex flex-col bg-[#0a0a0f] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
        <span className="text-sm font-semibold text-white">Order Book</span>

        {/* View mode toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('both')}
            className={`rounded px-1.5 py-0.5 text-[10px] transition-colors ${
              viewMode === 'both'
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <div className="h-1 w-3 rounded-sm bg-accent-rose/60" />
              <div className="h-1 w-3 rounded-sm bg-accent-emerald/60" />
            </div>
          </button>
          <button
            onClick={() => setViewMode('bids')}
            className={`rounded px-1.5 py-0.5 text-[10px] transition-colors ${
              viewMode === 'bids'
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <div className="h-2.5 w-3 rounded-sm bg-accent-emerald/60" />
          </button>
          <button
            onClick={() => setViewMode('asks')}
            className={`rounded px-1.5 py-0.5 text-[10px] transition-colors ${
              viewMode === 'asks'
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <div className="h-2.5 w-3 rounded-sm bg-accent-rose/60" />
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center px-2 py-1.5 text-[10px] text-white/40 border-b border-white/5">
        <span className="w-[35%]">Price (USDT)</span>
        <span className="w-[30%] text-right">Size</span>
        <span className="w-[35%] text-right">Total</span>
      </div>

      {/* Order book content */}
      <div className="flex-1 overflow-hidden">
        {/* Asks (reversed so highest price is at top) */}
        {viewMode !== 'bids' && (
          <div className="flex flex-col-reverse">
            {visibleAsks.map((level, i) => renderOrderRow(level, 'ask', i))}
          </div>
        )}

        {/* Spread / Last price */}
        <div className="flex items-center justify-between border-y border-white/5 bg-[#12121a] px-2 py-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-bold ${
                lastPrice && lastPrice >= (orderBook.midPrice || 0)
                  ? 'text-accent-emerald'
                  : 'text-accent-rose'
              }`}
            >
              {formatPrice(lastPrice || orderBook.midPrice)}
            </span>
            <span className="text-xs text-white/40">
              ≈ ${formatPrice(lastPrice || orderBook.midPrice)}
            </span>
          </div>
          <div className="text-[10px] text-white/30">
            Spread: {orderBook.spread.toFixed(2)} ({((orderBook.spread / orderBook.midPrice) * 100).toFixed(3)}%)
          </div>
        </div>

        {/* Bids */}
        {viewMode !== 'asks' && (
          <div className="flex flex-col">
            {visibleBids.map((level, i) => renderOrderRow(level, 'bid', i))}
          </div>
        )}
      </div>

      {/* Footer with aggregation controls */}
      <div className="flex items-center justify-between border-t border-white/5 px-2 py-1.5 text-[10px]">
        <span className="text-white/30">Aggregation</span>
        <div className="flex items-center gap-1">
          {([0.01, 0.1, 1, 10] as Precision[]).map((p) => (
            <button
              key={p}
              onClick={() => setPrecision(p)}
              className={`rounded px-1.5 py-0.5 transition-colors ${
                precision === p
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrderBook;
