'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Nav from '@/components/chrome/Nav';
import { SUPPORTED_ASSETS, ASSET_CATEGORIES, getAsset } from '@/lib/assets';

// Dynamic imports for TradingView components
const TradingViewChart = dynamic(
  () => import('@/components/charts/TradingViewChart'),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const TickerTape = dynamic(
  () => import('@/components/charts/TradingViewChart').then(mod => mod.TickerTape),
  { ssr: false }
);

const SymbolOverview = dynamic(
  () => import('@/components/charts/TradingViewChart').then(mod => mod.SymbolOverview),
  { ssr: false }
);

function ChartSkeleton() {
  return (
    <div className="flex h-[500px] items-center justify-center rounded-xl border border-white/5 bg-[#050507]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-base-blue" />
        <span className="text-sm text-white/40">Loading chart...</span>
      </div>
    </div>
  );
}

const INTERVALS = [
  { label: '1H', value: '60' },
  { label: '4H', value: '240' },
  { label: '1D', value: 'D' },
  { label: '1W', value: 'W' },
  { label: '1M', value: 'M' },
];

const QUICK_PICKS = ['BTC', 'ETH', 'SOL', 'PEPE', 'DEGEN', 'AERO'];

export default function ChartsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [interval, setInterval] = useState('D');
  const [compareSymbols, setCompareSymbols] = useState<string[]>(['BTC', 'ETH', 'SOL']);
  const [searchQuery, setSearchQuery] = useState('');

  const asset = getAsset(selectedSymbol);

  const filteredAssets = searchQuery
    ? SUPPORTED_ASSETS.filter(
        a =>
          a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : SUPPORTED_ASSETS;

  return (
    <div className="min-h-screen">
      <Nav />

      {/* Ticker Tape */}
      <TickerTape symbols={['BTC', 'ETH', 'SOL', 'PEPE', 'DEGEN', 'LINK', 'AERO', 'OP']} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-2">
            <span className="text-lg">📈</span>
            <span className="text-sm font-medium text-cyan-400">Live Charts</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Market Charts
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/60">
            Analyze price action with TradingView charts before making your picks.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
          {/* Sidebar - Asset Selector */}
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:border-base-blue focus:outline-none"
              />
            </div>

            {/* Quick Picks */}
            <div className="rounded-xl border border-white/5 bg-surface-2 p-4">
              <div className="mb-3 text-xs font-medium text-white/40">Quick Picks</div>
              <div className="flex flex-wrap gap-2">
                {QUICK_PICKS.map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => setSelectedSymbol(symbol)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      selectedSymbol === symbol
                        ? 'bg-base-blue text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Asset List */}
            <div className="max-h-[500px] space-y-1 overflow-y-auto rounded-xl border border-white/5 bg-surface-2 p-2">
              {filteredAssets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => setSelectedSymbol(asset.symbol)}
                  className={`flex w-full items-center gap-3 rounded-lg p-2.5 transition-colors ${
                    selectedSymbol === asset.symbol
                      ? 'bg-base-blue/20 text-white'
                      : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${asset.color}20` }}
                  >
                    <img
                      src={asset.logo}
                      alt={asset.symbol}
                      className="h-5 w-5 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{asset.symbol}</div>
                    <div className="text-xs text-white/40">{asset.name}</div>
                  </div>
                  {selectedSymbol === asset.symbol && (
                    <svg
                      className="h-4 w-4 text-base-blue"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Chart Area */}
          <div className="space-y-4">
            {/* Chart Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/5 bg-surface-2 p-4">
              <div className="flex items-center gap-4">
                {asset && (
                  <>
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${asset.color}20` }}
                    >
                      <img
                        src={asset.logo}
                        alt={asset.name}
                        className="h-8 w-8 rounded-full"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-white">{asset.symbol}</h2>
                        <span className="text-sm text-white/40">{asset.name}</span>
                      </div>
                      <div className="text-xs text-white/40">Powered by TradingView</div>
                    </div>
                  </>
                )}
              </div>

              {/* Interval Selector */}
              <div className="flex gap-1">
                {INTERVALS.map((int) => (
                  <button
                    key={int.value}
                    onClick={() => setInterval(int.value)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      interval === int.value
                        ? 'bg-base-blue text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {int.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Chart */}
            <TradingViewChart
              symbol={selectedSymbol}
              height={500}
              interval={interval}
              showToolbar={true}
            />

            {/* Compare Section */}
            <div className="rounded-xl border border-white/5 bg-surface-2 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-white">Compare Assets</h3>
                <div className="flex gap-2">
                  {['BTC', 'ETH', 'SOL', 'PEPE'].map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => {
                        if (compareSymbols.includes(symbol)) {
                          setCompareSymbols(compareSymbols.filter((s) => s !== symbol));
                        } else if (compareSymbols.length < 4) {
                          setCompareSymbols([...compareSymbols, symbol]);
                        }
                      }}
                      className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                        compareSymbols.includes(symbol)
                          ? 'bg-base-blue text-white'
                          : 'bg-white/5 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>
              <SymbolOverview symbols={compareSymbols} height={300} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <a
            href="/"
            className="flex items-center gap-4 rounded-xl border border-white/5 bg-surface-2 p-4 transition-colors hover:bg-white/[0.03]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-2xl">
              🎯
            </div>
            <div>
              <div className="font-medium text-white">Build Portfolio</div>
              <div className="text-sm text-white/40">Select your weekly picks</div>
            </div>
          </a>
          <a
            href="/analyze"
            className="flex items-center gap-4 rounded-xl border border-white/5 bg-surface-2 p-4 transition-colors hover:bg-white/[0.03]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-2xl">
              📊
            </div>
            <div>
              <div className="font-medium text-white">Analyze Portfolio</div>
              <div className="text-sm text-white/40">Risk scoring & scenarios</div>
            </div>
          </a>
          <a
            href="/leagues"
            className="flex items-center gap-4 rounded-xl border border-white/5 bg-surface-2 p-4 transition-colors hover:bg-white/[0.03]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-2xl">
              🏆
            </div>
            <div>
              <div className="font-medium text-white">Join Leagues</div>
              <div className="text-sm text-white/40">Compete with others</div>
            </div>
          </a>
        </div>
      </main>
    </div>
  );
}
