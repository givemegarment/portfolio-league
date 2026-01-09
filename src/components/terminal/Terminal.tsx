'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from 'react-resizable-panels';
import { ChartPanel } from './ChartPanel';
import { OrderBook } from './OrderBook';
import { TradesPanel } from './TradesPanel';
import { SymbolSelector } from './SymbolSelector';
import { TimeframeSelector } from './TimeframeSelector';
import { ExchangeSelector } from './ExchangeSelector';
import { TerminalHeader } from './TerminalHeader';
import { getAggregator, destroyAggregator } from '@/lib/engine/data/aggregator';
import type {
  ExchangeId,
  Timeframe,
  WidgetType,
  TerminalLayout,
  AggregatorEvent,
  NormalizedTick,
  OrderBook as OrderBookType,
  TickerData,
} from '@/lib/engine/types';

// Default layout configuration
const DEFAULT_LAYOUT: TerminalLayout = {
  id: 'default',
  name: 'Default Layout',
  panels: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isDefault: true,
};

interface TerminalProps {
  layoutId?: string;
  isShared?: boolean;
}

export default function Terminal({ layoutId, isShared }: TerminalProps) {
  // State
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [exchange, setExchange] = useState<ExchangeId>('binance');
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [isConnected, setIsConnected] = useState(false);
  const [lastTick, setLastTick] = useState<NormalizedTick | null>(null);
  const [orderBook, setOrderBook] = useState<OrderBookType | null>(null);
  const [ticker, setTicker] = useState<TickerData | null>(null);
  const [trades, setTrades] = useState<NormalizedTick[]>([]);
  const [layout, setLayout] = useState<TerminalLayout>(DEFAULT_LAYOUT);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize aggregator
  useEffect(() => {
    const aggregator = getAggregator(['binance', 'coinbase', 'bybit']);

    // Subscribe to aggregator events
    const unsubscribe = aggregator.subscribe((event: AggregatorEvent) => {
      switch (event.type) {
        case 'connected':
          setIsConnected(true);
          break;
        case 'disconnected':
          setIsConnected(false);
          break;
        case 'trade':
          if (event.data.symbol === symbol) {
            setLastTick(event.data);
            setTrades((prev) => [event.data, ...prev].slice(0, 100));
          }
          break;
        case 'orderbook':
          if (event.data.symbol === symbol) {
            setOrderBook(event.data);
          }
          break;
        case 'ticker':
          if (event.data.symbol === symbol) {
            setTicker(event.data);
          }
          break;
      }
    });

    // Connect to default exchange
    aggregator.connect(exchange);
    aggregator.subscribeSymbol(symbol, 'trades', [exchange]);
    aggregator.subscribeSymbol(symbol, 'orderbook', [exchange]);
    aggregator.subscribeSymbol(symbol, 'ticker', [exchange]);

    // Cleanup
    return () => {
      unsubscribe();
      destroyAggregator();
    };
  }, []);

  // Handle symbol change
  const handleSymbolChange = useCallback((newSymbol: string) => {
    setSymbol(newSymbol);
    setTrades([]);

    const aggregator = getAggregator();
    aggregator.subscribeSymbol(newSymbol, 'trades', [exchange]);
    aggregator.subscribeSymbol(newSymbol, 'orderbook', [exchange]);
    aggregator.subscribeSymbol(newSymbol, 'ticker', [exchange]);
  }, [exchange]);

  // Handle exchange change
  const handleExchangeChange = useCallback((newExchange: ExchangeId) => {
    setExchange(newExchange);
    setTrades([]);

    const aggregator = getAggregator();
    aggregator.connect(newExchange);
    aggregator.subscribeSymbol(symbol, 'trades', [newExchange]);
    aggregator.subscribeSymbol(symbol, 'orderbook', [newExchange]);
    aggregator.subscribeSymbol(symbol, 'ticker', [newExchange]);
  }, [symbol]);

  // Handle timeframe change
  const handleTimeframeChange = useCallback((newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Format price with appropriate decimals
  const formatPrice = useCallback((price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(4);
    if (price >= 0.01) return price.toFixed(6);
    return price.toFixed(8);
  }, []);

  return (
    <div className="flex h-full w-full flex-col bg-[#0a0a0f] text-white">
      {/* Terminal Header */}
      <TerminalHeader
        symbol={symbol}
        exchange={exchange}
        ticker={ticker}
        isConnected={isConnected}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Control Bar */}
      <div className="flex h-12 items-center gap-3 border-b border-white/5 bg-[#12121a] px-4">
        <SymbolSelector
          value={symbol}
          onChange={handleSymbolChange}
        />
        <div className="h-5 w-px bg-white/10" />
        <ExchangeSelector
          value={exchange}
          onChange={handleExchangeChange}
        />
        <div className="h-5 w-px bg-white/10" />
        <TimeframeSelector
          value={timeframe}
          onChange={handleTimeframeChange}
        />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Last price indicator */}
        {lastTick && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Last:</span>
            <span
              className={`font-mono text-sm font-semibold ${
                lastTick.side === 'buy' ? 'text-accent-emerald' : 'text-accent-rose'
              }`}
            >
              {formatPrice(lastTick.price)}
            </span>
          </div>
        )}
      </div>

      {/* Main Panel Layout */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup orientation="horizontal" className="h-full">
          {/* Left Panel - Chart */}
          <Panel defaultSize={70} minSize={40}>
            <PanelGroup orientation="vertical">
              {/* Chart */}
              <Panel defaultSize={75} minSize={30}>
                <ChartPanel
                  symbol={symbol}
                  exchange={exchange}
                  timeframe={timeframe}
                  className="h-full"
                />
              </Panel>

              {/* Resize Handle */}
              <ResizeHandle direction="horizontal" />

              {/* Trades */}
              <Panel defaultSize={25} minSize={15}>
                <TradesPanel
                  trades={trades}
                  className="h-full"
                />
              </Panel>
            </PanelGroup>
          </Panel>

          {/* Resize Handle */}
          <ResizeHandle direction="vertical" />

          {/* Right Panel - Order Book */}
          <Panel defaultSize={30} minSize={20}>
            <OrderBook
              orderBook={orderBook}
              lastPrice={lastTick?.price}
              className="h-full"
            />
          </Panel>
        </PanelGroup>
      </div>

      {/* Status Bar */}
      <div className="flex h-6 items-center justify-between border-t border-white/5 bg-[#0a0a0f] px-3 text-[10px]">
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className="flex items-center gap-1.5">
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                isConnected ? 'bg-accent-emerald' : 'bg-accent-rose'
              }`}
            />
            <span className="text-white/40">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Exchange */}
          <span className="text-white/30">
            {exchange.charAt(0).toUpperCase() + exchange.slice(1)}
          </span>
        </div>

        <div className="flex items-center gap-3 text-white/30">
          <span>Imitatio Pro Terminal v2.0</span>
          <span>•</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}

// Resize handle component
function ResizeHandle({ direction }: { direction: 'horizontal' | 'vertical' }) {
  return (
    <PanelResizeHandle
      className={`group relative ${
        direction === 'horizontal'
          ? 'h-1 cursor-row-resize'
          : 'w-1 cursor-col-resize'
      }`}
    >
      <div
        className={`absolute bg-white/5 transition-colors group-hover:bg-base-blue/50 group-active:bg-base-blue ${
          direction === 'horizontal'
            ? 'inset-x-0 top-0 h-px'
            : 'inset-y-0 left-0 w-px'
        }`}
      />
      {/* Grab indicator */}
      <div
        className={`absolute opacity-0 transition-opacity group-hover:opacity-100 ${
          direction === 'horizontal'
            ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
            : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
        }`}
      >
        <div
          className={`rounded bg-base-blue/30 ${
            direction === 'horizontal' ? 'h-1 w-8' : 'h-8 w-1'
          }`}
        />
      </div>
    </PanelResizeHandle>
  );
}
