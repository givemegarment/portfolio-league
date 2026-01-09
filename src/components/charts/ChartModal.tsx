'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getAsset } from '@/lib/assets';

// Dynamic import to avoid SSR issues with TradingView
const TradingViewChart = dynamic(() => import('./TradingViewChart'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center bg-[#050507]">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-base-blue" />
        <span className="text-sm text-white/40">Loading chart...</span>
      </div>
    </div>
  ),
});

type ChartModalProps = {
  symbol: string | null;
  onClose: () => void;
  priceData?: {
    price: number;
    change24h: number;
  };
};

const INTERVALS = [
  { label: '1H', value: '60' },
  { label: '4H', value: '240' },
  { label: '1D', value: 'D' },
  { label: '1W', value: 'W' },
  { label: '1M', value: 'M' },
];

export default function ChartModal({ symbol, onClose, priceData }: ChartModalProps) {
  const [interval, setInterval] = useState('D');
  const [isVisible, setIsVisible] = useState(false);

  const asset = symbol ? getAsset(symbol) : null;

  // Animation
  useEffect(() => {
    if (symbol) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [symbol]);

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!symbol || !asset) return null;

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.0001) return `$${price.toFixed(6)}`;
    return `$${price.toExponential(2)}`;
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center sm:items-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative w-full max-w-4xl transform rounded-t-3xl sm:rounded-3xl border border-white/10 bg-surface-1 transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-full sm:scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6">
          <div className="flex items-center gap-4">
            {/* Asset Logo */}
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${asset.color}20` }}
            >
              <img
                src={asset.logo}
                alt={asset.name}
                className="h-8 w-8 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>

            {/* Asset Info */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{asset.symbol}</h2>
                <span className="text-sm text-white/40">{asset.name}</span>
              </div>
              {priceData && (
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-mono text-lg text-white">
                    {formatPrice(priceData.price)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      priceData.change24h >= 0
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {priceData.change24h >= 0 ? '+' : ''}
                    {priceData.change24h.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Interval Selector */}
        <div className="flex gap-2 px-4 pb-4 sm:px-6">
          {INTERVALS.map((int) => (
            <button
              key={int.value}
              onClick={() => setInterval(int.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                interval === int.value
                  ? 'bg-base-blue text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {int.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="px-4 pb-4 sm:px-6 sm:pb-6">
          <TradingViewChart
            symbol={symbol}
            height={400}
            interval={interval}
            showToolbar={true}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 border-t border-white/5 p-4 sm:px-6">
          <QuickStat label="24h High" value="—" />
          <QuickStat label="24h Low" value="—" />
          <QuickStat label="24h Volume" value="—" />
          <QuickStat label="Market Cap" value="—" />
        </div>
      </div>
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-white/40">{label}</div>
      <div className="mt-1 font-mono text-sm text-white">{value}</div>
    </div>
  );
}
