'use client';

import React, { useState, useEffect } from 'react';

const ASSETS = [
  { 
    symbol: 'BTC', 
    name: 'Bitcoin', 
    color: '#F7931A',
    icon: (
      <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
        <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm7.189-17.98c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"/>
      </svg>
    )
  },
  { 
    symbol: 'ETH', 
    name: 'Ethereum', 
    color: '#627EEA',
    icon: (
      <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
        <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm7.994-15.781L16.498 4 9 16.22l7.498 4.353 7.496-4.354zM24 17.616l-7.502 4.351L9 17.617l7.498 10.378L24 17.616z"/>
      </svg>
    )
  },
  { 
    symbol: 'SOL', 
    name: 'Solana', 
    color: '#9945FF',
    icon: (
      <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
        <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zM9.925 18.466l1.143-1.21a.47.47 0 01.342-.147h12.553c.216 0 .324.261.171.414l-1.143 1.21a.47.47 0 01-.342.147H10.096c-.216 0-.324-.261-.171-.414zm0-5.358l1.143-1.21a.47.47 0 01.342-.147h12.553c.216 0 .324.261.171.414l-1.143 1.21a.47.47 0 01-.342.147H10.096c-.216 0-.324-.261-.171-.414zm14.02 2.677l-1.143-1.21a.47.47 0 00-.342-.147H9.907c-.216 0-.324.261-.171.414l1.143 1.21a.47.47 0 00.342.147h12.553c.216 0 .324-.261.171-.414z"/>
      </svg>
    )
  },
  { 
    symbol: 'USDC', 
    name: 'USD Coin', 
    color: '#2775CA',
    icon: (
      <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
        <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm-1.326-3.14v1.12h2.652v-1.12c3.265-.453 5.352-2.312 5.352-5.18 0-3.776-3.078-4.63-5.352-5.312v-4.82c1.479.282 2.466 1.12 2.652 2.312h2.838c-.186-2.687-2.466-4.54-5.49-4.914V9.84h-2.652v1.107c-3.078.374-5.352 2.227-5.352 5.007 0 3.589 2.838 4.63 5.352 5.312v5.007c-1.666-.374-2.652-1.307-2.838-2.593H8.998c.186 2.78 2.466 4.726 5.676 5.18zm0-13.52v4.54c-1.479-.467-2.466-1.12-2.466-2.312 0-1.214.987-1.948 2.466-2.228zm2.652 9.728v-4.727c1.666.467 2.652 1.12 2.652 2.406 0 1.307-1.066 2.04-2.652 2.32z"/>
      </svg>
    )
  },
] as const;

type AssetSymbol = typeof ASSETS[number]['symbol'];
type Props = { address?: `0x${string}` };

export default function PortfolioBuilder({ address }: Props) {
  const [basket, setBasket] = useState<AssetSymbol[]>(['BTC', 'ETH', 'SOL']);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});

  // Fetch prices on mount
  useEffect(() => {
    // Simulated prices - in production, fetch from /api/oracle/prices
    setPrices({
      BTC: 97234.50,
      ETH: 3642.18,
      SOL: 234.56,
      USDC: 1.00,
    });
  }, []);

  const toggleAsset = (symbol: AssetSymbol) => {
    setBasket((prev) => {
      if (prev.includes(symbol)) {
        // Remove if already selected (but keep at least 1)
        if (prev.length > 1) {
          return prev.filter((s) => s !== symbol);
        }
        return prev;
      } else {
        // Add if under 3, or replace oldest if at 3
        if (prev.length < 3) {
          return [...prev, symbol];
        }
        return [...prev.slice(1), symbol];
      }
    });
  };

  const canSave = !!address && basket.length === 3;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, basket }),
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Build Your Portfolio</h2>
          <p className="text-sm text-white/50">Select 3 assets for this week's competition</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
          <span className="text-sm text-white/50">Selected:</span>
          <span className="font-mono font-bold text-base-blue">{basket.length}/3</span>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ASSETS.map((asset, idx) => {
          const isSelected = basket.includes(asset.symbol);
          const selectionIndex = basket.indexOf(asset.symbol);
          
          return (
            <button
              key={asset.symbol}
              onClick={() => toggleAsset(asset.symbol)}
              disabled={!address}
              className={`
                group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300
                ${isSelected 
                  ? 'border-base-blue/50 bg-base-blue/10' 
                  : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/5'
                }
                ${!address ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
              style={{
                animationDelay: `${idx * 50}ms`,
              }}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div 
                  className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: asset.color }}
                >
                  {selectionIndex + 1}
                </div>
              )}
              
              {/* Glow effect on selection */}
              {isSelected && (
                <div 
                  className="absolute inset-0 opacity-20 blur-2xl"
                  style={{ backgroundColor: asset.color }}
                />
              )}
              
              {/* Icon */}
              <div 
                className={`mb-3 transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}
                style={{ color: asset.color }}
              >
                {asset.icon}
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

      {/* Portfolio Preview */}
      {basket.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <div className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
            Your Portfolio
          </div>
          <div className="flex items-center gap-3">
            {basket.map((symbol, idx) => {
              const asset = ASSETS.find((a) => a.symbol === symbol)!;
              return (
                <div
                  key={`${symbol}-${idx}`}
                  className="flex flex-1 items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <div style={{ color: asset.color }}>{asset.icon}</div>
                  <div>
                    <div className="font-mono font-bold text-white">{asset.symbol}</div>
                    <div className="text-xs text-white/40">33.33%</div>
                  </div>
                </div>
              );
            })}
            {/* Empty slots */}
            {Array.from({ length: 3 - basket.length }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-3 py-6"
              >
                <span className="text-sm text-white/20">Select asset</span>
              </div>
            ))}
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
            Lock In My Picks
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
        Picks are tied to your wallet address. You can update until the gameweek locks.
      </p>
    </div>
  );
}
