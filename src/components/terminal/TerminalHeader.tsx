'use client';

import Link from 'next/link';
import type { ExchangeId, TickerData } from '@/lib/engine/types';

interface TerminalHeaderProps {
  symbol: string;
  exchange: ExchangeId;
  ticker: TickerData | null;
  isConnected: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function TerminalHeader({
  symbol,
  exchange,
  ticker,
  isConnected,
  isFullscreen,
  onToggleFullscreen,
}: TerminalHeaderProps) {
  // Format price
  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(8);
  };

  // Format volume
  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return (volume / 1e9).toFixed(2) + 'B';
    if (volume >= 1e6) return (volume / 1e6).toFixed(2) + 'M';
    if (volume >= 1e3) return (volume / 1e3).toFixed(2) + 'K';
    return volume.toFixed(2);
  };

  // Mock ticker if not available
  const displayTicker = ticker || {
    price: 42567.89,
    change24h: 234.56,
    changePercent24h: 0.55,
    high24h: 43200.00,
    low24h: 42100.00,
    volume24h: 12345678,
    quoteVolume24h: 524567890,
  };

  const isPositive = displayTicker.changePercent24h >= 0;

  return (
    <header className="flex h-12 items-center justify-between border-b border-white/5 bg-[#0a0a0f] px-4">
      {/* Left section - Logo and navigation */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-8 w-8">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-base-blue to-accent-cyan opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-white">i</span>
            </div>
          </div>
          <span className="hidden sm:block text-sm font-semibold text-white">
            Terminal
          </span>
        </Link>

        {/* Connection status */}
        <div className="flex items-center gap-1.5">
          <div
            className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-accent-emerald animate-pulse' : 'bg-accent-rose'
            }`}
          />
          <span className="text-xs text-white/40">
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Center section - Ticker info */}
      <div className="flex items-center gap-6">
        {/* Price */}
        <div className="flex flex-col items-center">
          <span
            className={`text-lg font-bold ${
              isPositive ? 'text-accent-emerald' : 'text-accent-rose'
            }`}
          >
            ${formatPrice(displayTicker.price)}
          </span>
          <span
            className={`text-xs font-medium ${
              isPositive ? 'text-accent-emerald' : 'text-accent-rose'
            }`}
          >
            {isPositive ? '+' : ''}
            {displayTicker.changePercent24h.toFixed(2)}%
          </span>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-4 text-xs">
          <div className="flex flex-col">
            <span className="text-white/40">24h High</span>
            <span className="font-mono text-white">${formatPrice(displayTicker.high24h)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/40">24h Low</span>
            <span className="font-mono text-white">${formatPrice(displayTicker.low24h)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/40">24h Vol</span>
            <span className="font-mono text-white">{formatVolume(displayTicker.volume24h)}</span>
          </div>
        </div>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-2">
        {/* Settings */}
        <button
          className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
          title="Settings"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>

        {/* Layout manager */}
        <button
          className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
          title="Layouts"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
            />
          </svg>
        </button>

        {/* Fullscreen toggle */}
        <button
          onClick={onToggleFullscreen}
          className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
              />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
              />
            </svg>
          )}
        </button>

        {/* Back to app */}
        <Link
          href="/"
          className="ml-2 flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="hidden sm:inline">App</span>
        </Link>
      </div>
    </header>
  );
}

export default TerminalHeader;
