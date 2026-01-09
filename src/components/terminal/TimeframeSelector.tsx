'use client';

import { useState, useRef, useEffect } from 'react';
import type { Timeframe } from '@/lib/engine/types';

interface TimeframeSelectorProps {
  value: Timeframe;
  onChange: (timeframe: Timeframe) => void;
}

const TIMEFRAME_GROUPS = [
  {
    label: 'Seconds',
    timeframes: ['1s', '5s', '15s', '30s'] as Timeframe[],
  },
  {
    label: 'Minutes',
    timeframes: ['1m', '3m', '5m', '15m', '30m'] as Timeframe[],
  },
  {
    label: 'Hours',
    timeframes: ['1h', '2h', '4h', '6h', '8h', '12h'] as Timeframe[],
  },
  {
    label: 'Days+',
    timeframes: ['1d', '3d', '1w', '1M'] as Timeframe[],
  },
];

// Commonly used timeframes for quick access
const QUICK_TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

export function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
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
  const handleSelect = (timeframe: Timeframe) => {
    onChange(timeframe);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative flex items-center gap-1">
      {/* Quick timeframe buttons */}
      <div className="hidden sm:flex items-center gap-0.5">
        {QUICK_TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => handleSelect(tf)}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
              tf === value
                ? 'bg-base-blue text-white'
                : 'text-white/50 hover:bg-white/5 hover:text-white/80'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* More button / Mobile trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
          !QUICK_TIMEFRAMES.includes(value)
            ? 'bg-base-blue text-white'
            : 'text-white/50 hover:bg-white/5 hover:text-white/80'
        }`}
      >
        <span className="sm:hidden font-medium">{value}</span>
        <span className="hidden sm:inline">More</span>
        <svg
          className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl border border-white/10 bg-[#12121a] p-3 shadow-2xl">
          <div className="space-y-3">
            {TIMEFRAME_GROUPS.map((group) => (
              <div key={group.label}>
                <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-white/30">
                  {group.label}
                </span>
                <div className="flex flex-wrap gap-1">
                  {group.timeframes.map((tf) => (
                    <button
                      key={tf}
                      onClick={() => handleSelect(tf)}
                      className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                        tf === value
                          ? 'bg-base-blue text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Keyboard shortcut hint */}
          <div className="mt-3 border-t border-white/5 pt-2">
            <span className="text-[10px] text-white/30">
              Press <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono">T</kbd> to cycle
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimeframeSelector;
