'use client';

import { useState, useRef, useEffect } from 'react';
import type { ExchangeId } from '@/lib/engine/types';

interface ExchangeSelectorProps {
  value: ExchangeId;
  onChange: (exchange: ExchangeId) => void;
}

const EXCHANGES: { id: ExchangeId; name: string; logo: string; color: string }[] = [
  { id: 'binance', name: 'Binance', logo: '◆', color: '#F3BA2F' },
  { id: 'binance-futures', name: 'Binance Futures', logo: '◆', color: '#F3BA2F' },
  { id: 'coinbase', name: 'Coinbase', logo: '●', color: '#0052FF' },
  { id: 'bybit', name: 'Bybit', logo: '▲', color: '#F7A600' },
  { id: 'okx', name: 'OKX', logo: '○', color: '#FFFFFF' },
  { id: 'kraken', name: 'Kraken', logo: '◎', color: '#5741D9' },
  { id: 'kucoin', name: 'KuCoin', logo: '◈', color: '#23AF91' },
  { id: 'htx', name: 'HTX', logo: '⬡', color: '#2B3139' },
  { id: 'gate', name: 'Gate.io', logo: '▣', color: '#17E6A1' },
  { id: 'bitget', name: 'Bitget', logo: '◇', color: '#00F0FF' },
  { id: 'mexc', name: 'MEXC', logo: '▽', color: '#2EBD85' },
  { id: 'deribit', name: 'Deribit', logo: '◐', color: '#13CC9B' },
  { id: 'hyperliquid', name: 'Hyperliquid', logo: '◆', color: '#50E3C2' },
  { id: 'dydx', name: 'dYdX', logo: '◑', color: '#6966FF' },
];

export function ExchangeSelector({ value, onChange }: ExchangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle selection
  const handleSelect = (exchange: ExchangeId) => {
    onChange(exchange);
    setIsOpen(false);
  };

  // Current exchange info
  const currentExchange = EXCHANGES.find((e) => e.id === value) || EXCHANGES[0];

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 transition-colors hover:bg-white/10"
      >
        <span style={{ color: currentExchange.color }}>{currentExchange.logo}</span>
        <span className="text-sm font-medium text-white">{currentExchange.name}</span>
        <svg
          className={`h-4 w-4 text-white/40 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-xl border border-white/10 bg-[#12121a] shadow-2xl">
          {/* Spot exchanges */}
          <div className="p-2">
            <span className="mb-1.5 block px-2 text-[10px] font-medium uppercase tracking-wider text-white/30">
              Spot
            </span>
            <div className="space-y-0.5">
              {EXCHANGES.filter(e => !e.id.includes('futures')).slice(0, 6).map((exchange) => (
                <button
                  key={exchange.id}
                  onClick={() => handleSelect(exchange.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors ${
                    exchange.id === value
                      ? 'bg-base-blue/20 text-base-blue'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span style={{ color: exchange.color }} className="text-lg">
                    {exchange.logo}
                  </span>
                  <span className="text-sm font-medium text-white">{exchange.name}</span>
                  {exchange.id === value && (
                    <svg
                      className="ml-auto h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Perpetuals */}
          <div className="border-t border-white/5 p-2">
            <span className="mb-1.5 block px-2 text-[10px] font-medium uppercase tracking-wider text-white/30">
              Perpetuals
            </span>
            <div className="space-y-0.5">
              {EXCHANGES.filter(e =>
                e.id.includes('futures') ||
                ['deribit', 'hyperliquid', 'dydx'].includes(e.id)
              ).map((exchange) => (
                <button
                  key={exchange.id}
                  onClick={() => handleSelect(exchange.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors ${
                    exchange.id === value
                      ? 'bg-base-blue/20 text-base-blue'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span style={{ color: exchange.color }} className="text-lg">
                    {exchange.logo}
                  </span>
                  <span className="text-sm font-medium text-white">{exchange.name}</span>
                  {exchange.id === value && (
                    <svg
                      className="ml-auto h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/5 px-3 py-2">
            <span className="text-[10px] text-white/30">
              {EXCHANGES.length} exchanges supported
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExchangeSelector;
