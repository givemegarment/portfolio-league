'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

const ASSETS = [
  { 
    symbol: 'BTC', 
    name: 'Bitcoin', 
    color: '#F7931A',
    logo: '/coins/btc.svg',
  },
  { 
    symbol: 'ETH', 
    name: 'Ethereum', 
    color: '#627EEA',
    logo: '/coins/eth.svg',
  },
  { 
    symbol: 'SOL', 
    name: 'Solana', 
    color: '#9945FF',
    logo: '/coins/sol.svg',
  },
  { 
    symbol: 'USDC', 
    name: 'USD Coin', 
    color: '#2775CA',
    logo: '/coins/usdc.svg',
  },
] as const;

type AssetSymbol = typeof ASSETS[number]['symbol'];
type Allocation = { symbol: AssetSymbol; percentage: number };
type Props = { address?: `0x${string}` };

export default function PortfolioBuilder({ address }: Props) {
  const [allocations, setAllocations] = useState<Allocation[]>([
    { symbol: 'BTC', percentage: 50 },
    { symbol: 'ETH', percentage: 30 },
    { symbol: 'SOL', percentage: 20 },
  ]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});

  // Fetch prices on mount
  useEffect(() => {
    setPrices({
      BTC: 97234.50,
      ETH: 3642.18,
      SOL: 234.56,
      USDC: 1.00,
    });
  }, []);

  const totalPercentage = allocations.reduce((sum, a) => sum + a.percentage, 0);
  const isValid = totalPercentage === 100 && allocations.length > 0;

  // Add an asset to portfolio
  const addAsset = (symbol: AssetSymbol) => {
    if (allocations.find(a => a.symbol === symbol)) return;
    
    // Add with 0% initially, user will adjust
    setAllocations(prev => [...prev, { symbol, percentage: 0 }]);
  };

  // Remove an asset from portfolio
  const removeAsset = (symbol: AssetSymbol) => {
    if (allocations.length <= 1) return; // Keep at least one
    setAllocations(prev => prev.filter(a => a.symbol !== symbol));
  };

  // Update allocation percentage
  const updateAllocation = useCallback((symbol: AssetSymbol, newPercentage: number) => {
    const clampedPercentage = Math.max(0, Math.min(100, newPercentage));
    
    setAllocations(prev => 
      prev.map(a => 
        a.symbol === symbol ? { ...a, percentage: clampedPercentage } : a
      )
    );
  }, []);

  // Auto-balance to reach 100%
  const autoBalance = () => {
    if (allocations.length === 0) return;
    
    const equalShare = Math.floor(100 / allocations.length);
    const remainder = 100 - (equalShare * allocations.length);
    
    setAllocations(prev => 
      prev.map((a, i) => ({
        ...a,
        percentage: equalShare + (i === 0 ? remainder : 0)
      }))
    );
  };

  const canSave = !!address && isValid;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address, 
          portfolio: allocations.map(a => ({ symbol: a.symbol, percentage: a.percentage }))
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus({ type: 'success', message: 'Portfolio saved! Good luck this week.' });
    } catch {
      setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${(price / 1000).toFixed(1)}k`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(4)}`;
  };

  const selectedSymbols = allocations.map(a => a.symbol);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Build Your Portfolio</h2>
          <p className="text-sm text-white/50">Allocate percentages to your selected assets</p>
        </div>
        <div className="flex items-center gap-2">
          <span 
            className={`rounded-full px-4 py-2 text-sm font-mono font-bold ${
              isValid 
                ? 'bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30' 
                : 'bg-accent-rose/20 text-accent-rose border border-accent-rose/30'
            }`}
          >
            {totalPercentage}%
          </span>
        </div>
      </div>

      {/* Asset Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-white/40">Select Assets</span>
          <button
            onClick={autoBalance}
            className="text-xs text-base-blue hover:text-base-blue-light transition-colors"
          >
            Auto-balance
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ASSETS.map((asset) => {
            const isSelected = selectedSymbols.includes(asset.symbol);
            
            return (
              <button
                key={asset.symbol}
                onClick={() => isSelected ? removeAsset(asset.symbol) : addAsset(asset.symbol)}
                disabled={!address}
                className={`
                  group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300
                  ${isSelected 
                    ? 'border-base-blue/50 bg-base-blue/10' 
                    : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/5'
                  }
                  ${!address ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <svg className="h-5 w-5 text-accent-emerald" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                {/* Glow effect on selection */}
                {isSelected && (
                  <div 
                    className="absolute inset-0 opacity-20 blur-2xl"
                    style={{ backgroundColor: asset.color }}
                  />
                )}
                
                {/* Logo */}
                <div className={`mb-3 transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                  <Image
                    src={asset.logo}
                    alt={asset.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
                
                {/* Info */}
                <div className="space-y-1">
                  <div className="font-mono text-lg font-bold text-white">{asset.symbol}</div>
                  <div className="text-xs text-white/40">{asset.name}</div>
                </div>
                
                {/* Price */}
                {prices[asset.symbol] && (
                  <div className="mt-3 font-mono text-sm text-white/60">
                    {formatPrice(prices[asset.symbol])}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Allocation Sliders */}
      {allocations.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs font-medium uppercase tracking-wider text-white/40">
            Set Allocation
          </div>
          
          <div className="space-y-3">
            {allocations.map((allocation) => {
              const asset = ASSETS.find(a => a.symbol === allocation.symbol)!;
              
              return (
                <div
                  key={allocation.symbol}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
                >
                  <div className="flex items-center gap-4">
                    {/* Asset info */}
                    <div className="flex items-center gap-3 w-28">
                      <Image
                        src={asset.logo}
                        alt={asset.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <span className="font-mono font-bold text-white">{asset.symbol}</span>
                    </div>
                    
                    {/* Slider */}
                    <div className="flex-1">
                      <div className="relative h-3 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full rounded-full transition-all duration-200"
                          style={{
                            width: `${allocation.percentage}%`,
                            backgroundColor: asset.color,
                          }}
                        />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={allocation.percentage}
                          onChange={(e) => updateAllocation(allocation.symbol, parseInt(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateAllocation(allocation.symbol, allocation.percentage - 5)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={allocation.percentage}
                        onChange={(e) => updateAllocation(allocation.symbol, parseInt(e.target.value) || 0)}
                        className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-center font-mono text-sm text-white focus:border-base-blue focus:outline-none"
                      />
                      <span className="text-white/40">%</span>
                      
                      <button
                        onClick={() => updateAllocation(allocation.symbol, allocation.percentage + 5)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                      
                      {/* Remove button */}
                      {allocations.length > 1 && (
                        <button
                          onClick={() => removeAsset(allocation.symbol)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:bg-accent-rose/10 hover:text-accent-rose transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Total validation */}
          {!isValid && (
            <div className="flex items-center justify-between rounded-xl border border-accent-rose/20 bg-accent-rose/5 px-4 py-3">
              <div className="flex items-center gap-2 text-accent-rose">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm">
                  {totalPercentage > 100 
                    ? `Over by ${totalPercentage - 100}%` 
                    : `${100 - totalPercentage}% unallocated`
                  }
                </span>
              </div>
              <button
                onClick={autoBalance}
                className="text-sm font-medium text-accent-rose hover:underline"
              >
                Fix it
              </button>
            </div>
          )}
        </div>
      )}

      {/* Portfolio Preview - Visual Bar */}
      {allocations.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <div className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
            Portfolio Breakdown
          </div>
          
          {/* Stacked bar */}
          <div className="h-8 rounded-full overflow-hidden flex">
            {allocations
              .filter(a => a.percentage > 0)
              .map((allocation, idx) => {
                const asset = ASSETS.find(a => a.symbol === allocation.symbol)!;
                return (
                  <div
                    key={allocation.symbol}
                    className="h-full flex items-center justify-center text-xs font-bold text-white transition-all duration-300"
                    style={{
                      width: `${allocation.percentage}%`,
                      backgroundColor: asset.color,
                      marginLeft: idx > 0 ? '2px' : 0,
                    }}
                  >
                    {allocation.percentage >= 15 && (
                      <span>{allocation.symbol}</span>
                    )}
                  </div>
                );
              })}
            {totalPercentage < 100 && (
              <div
                className="h-full flex items-center justify-center text-xs text-white/30 bg-white/5"
                style={{ width: `${100 - totalPercentage}%`, marginLeft: '2px' }}
              >
                {100 - totalPercentage >= 10 && 'Unallocated'}
              </div>
            )}
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4">
            {allocations.map((allocation) => {
              const asset = ASSETS.find(a => a.symbol === allocation.symbol)!;
              return (
                <div key={allocation.symbol} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: asset.color }}
                  />
                  <span className="text-sm text-white/60">
                    {asset.symbol}: <span className="font-mono font-bold text-white">{allocation.percentage}%</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={save}
        disabled={!canSave || saving}
        className="btn-primary w-full py-4 text-base"
      >
        {!address ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Connect Wallet to Save
          </span>
        ) : !isValid ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Allocation Must Equal 100%
          </span>
        ) : saving ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Saving...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Lock In My Portfolio
          </span>
        )}
      </button>

      {/* Status Message */}
      {status && (
        <div
          className={`animate-fade-in-up rounded-xl p-4 ${
            status.type === 'success'
              ? 'border border-accent-emerald/20 bg-accent-emerald/10 text-accent-emerald'
              : 'border border-accent-rose/20 bg-accent-rose/10 text-accent-rose'
          }`}
        >
          <div className="flex items-center gap-3">
            {status.type === 'success' ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="text-sm font-medium">{status.message}</span>
          </div>
        </div>
      )}

      {/* Info Footer */}
      <p className="text-center text-xs text-white/30">
        Allocations are tied to your wallet address. You can update until the gameweek locks.
      </p>
    </div>
  );
}
