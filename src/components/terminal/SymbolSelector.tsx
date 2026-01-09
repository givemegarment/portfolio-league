'use client';

import { useState, useRef, useEffect, useMemo } from 'react';

interface SymbolSelectorProps {
  value: string;
  onChange: (symbol: string) => void;
}

// Popular trading pairs
const POPULAR_SYMBOLS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', logo: '₿' },
  { symbol: 'ETHUSDT', name: 'Ethereum', logo: 'Ξ' },
  { symbol: 'SOLUSDT', name: 'Solana', logo: '◎' },
  { symbol: 'BNBUSDT', name: 'BNB', logo: '⬡' },
  { symbol: 'XRPUSDT', name: 'Ripple', logo: '✕' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', logo: 'Ð' },
  { symbol: 'ADAUSDT', name: 'Cardano', logo: '₳' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', logo: '▲' },
  { symbol: 'DOTUSDT', name: 'Polkadot', logo: '●' },
  { symbol: 'LINKUSDT', name: 'Chainlink', logo: '⬡' },
  { symbol: 'MATICUSDT', name: 'Polygon', logo: '⬡' },
  { symbol: 'ATOMUSDT', name: 'Cosmos', logo: '⚛' },
  { symbol: 'LTCUSDT', name: 'Litecoin', logo: 'Ł' },
  { symbol: 'UNIUSDT', name: 'Uniswap', logo: '🦄' },
  { symbol: 'AAVEUSDT', name: 'Aave', logo: '👻' },
];

export function SymbolSelector({ value, onChange }: SymbolSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter symbols based on search
  const filteredSymbols = useMemo(() => {
    if (!search) return POPULAR_SYMBOLS;
    const query = search.toLowerCase();
    return POPULAR_SYMBOLS.filter(
      (s) =>
        s.symbol.toLowerCase().includes(query) ||
        s.name.toLowerCase().includes(query)
    );
  }, [search]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle selection
  const handleSelect = (symbol: string) => {
    onChange(symbol);
    setIsOpen(false);
    setSearch('');
  };

  // Current symbol info
  const currentSymbol = POPULAR_SYMBOLS.find((s) => s.symbol === value) || {
    symbol: value,
    name: value,
    logo: '●',
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 transition-colors hover:bg-white/10"
      >
        <span className="text-lg">{currentSymbol.logo}</span>
        <span className="font-semibold text-white">{value}</span>
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
        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-white/10 bg-[#12121a] shadow-2xl">
          {/* Search input */}
          <div className="border-b border-white/5 p-2">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
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
                ref={inputRef}
                type="text"
                placeholder="Search symbol..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder-white/30 outline-none focus:bg-white/10"
              />
            </div>
          </div>

          {/* Symbol list */}
          <div className="max-h-64 overflow-y-auto p-2">
            {filteredSymbols.length > 0 ? (
              <div className="space-y-0.5">
                {filteredSymbols.map((s) => (
                  <button
                    key={s.symbol}
                    onClick={() => handleSelect(s.symbol)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                      s.symbol === value
                        ? 'bg-base-blue/20 text-base-blue'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="text-lg">{s.logo}</span>
                    <div className="flex flex-col items-start">
                      <span className="font-mono font-semibold text-white text-sm">
                        {s.symbol}
                      </span>
                      <span className="text-[10px] text-white/40">{s.name}</span>
                    </div>
                    {s.symbol === value && (
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
            ) : (
              <div className="py-4 text-center text-sm text-white/40">
                No symbols found
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/5 px-3 py-2">
            <span className="text-[10px] text-white/30">
              {POPULAR_SYMBOLS.length} pairs available
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SymbolSelector;
