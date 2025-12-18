'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import ShareButtons from '@/components/share/ShareButtons';
import CoachPanel from '@/components/coach/CoachPanel';
import AssetSelector from '@/components/portfolio/AssetSelector';
import { SUPPORTED_ASSETS, getAsset, type Asset } from '@/lib/assets';
import { type Suggestion } from '@/lib/ai-coach';
import { playSuccessBeep, playErrorBeep } from '@/lib/sounds';

type Allocation = { symbol: string; percentage: number };
type PriceData = { price: number; change24h: number };
type Props = { address?: `0x${string}` };

type EmulationTemplate = {
  masterAddress: string;
  masterName: string;
  allocations: Allocation[];
};

// Default allocations for new users
const DEFAULT_ALLOCATIONS: Allocation[] = [
  { symbol: 'BTC', percentage: 50 },
  { symbol: 'ETH', percentage: 30 },
  { symbol: 'SOL', percentage: 20 },
];

export default function PortfolioBuilder({ address }: Props) {
  // Start with empty allocations - will load from server or use defaults
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [pricesLoading, setPricesLoading] = useState(true);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [hasSavedPortfolio, setHasSavedPortfolio] = useState(false);
  const [currentScore, setCurrentScore] = useState<number | undefined>(undefined);
  const [currentRank, setCurrentRank] = useState<number | undefined>(undefined);
  const [savedTimestamp, setSavedTimestamp] = useState<number | null>(null);
  const [entryPrices, setEntryPrices] = useState<Record<string, number>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioInitialized, setPortfolioInitialized] = useState(false);
  const [emulatingMaster, setEmulatingMaster] = useState<EmulationTemplate | null>(null);

  // Check for emulation template on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const templateData = sessionStorage.getItem('emulation_template');
    if (templateData) {
      try {
        const template: EmulationTemplate = JSON.parse(templateData);
        setEmulatingMaster(template);
        setAllocations(template.allocations);
        setPortfolioInitialized(true);
        // Clear the template after loading
        sessionStorage.removeItem('emulation_template');
      } catch (e) {
        console.error('Error parsing emulation template:', e);
      }
    }
  }, []);

  // Fetch real prices from API
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('/api/prices');
        if (!response.ok) throw new Error('Failed to fetch prices');
        
        const data = await response.json();
        
        if (data.prices) {
          setPrices(data.prices);
          setLastPriceUpdate(data.lastUpdated);
        }
      } catch (error) {
        console.error('Error fetching prices:', error);
        // Fallback to show something
        setPrices({
          BTC: { price: 97000, change24h: 0 },
          ETH: { price: 3600, change24h: 0 },
          SOL: { price: 230, change24h: 0 },
          USDC: { price: 1, change24h: 0 },
        });
      } finally {
        setPricesLoading(false);
      }
    };

    fetchPrices();
    
    // Refresh prices every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // Load existing portfolio if user is connected
  useEffect(() => {
    // If no address, set defaults and mark as initialized
    if (!address) {
      if (!portfolioInitialized) {
        setAllocations(DEFAULT_ALLOCATIONS);
        setPortfolioInitialized(true);
        setPortfolioLoading(false);
      }
      return;
    }

    const loadPortfolio = async () => {
      setPortfolioLoading(true);
      setLoadError(null);
      
      try {
        const response = await fetch(`/api/portfolio?address=${address}`);
        if (!response.ok) {
          // Server error - use defaults
          if (!portfolioInitialized) {
            setAllocations(DEFAULT_ALLOCATIONS);
          }
          setPortfolioInitialized(true);
          setPortfolioLoading(false);
          return;
        }
        
        const data = await response.json();
        
        if (data.redisError) {
          setLoadError('Unable to load saved portfolio. Storage service may be temporarily unavailable.');
        }
        
        if (data.isLocked) {
          setIsLocked(true);
        }
        
        if (data.portfolio?.allocations && data.portfolio.allocations.length > 0) {
          // User has a saved portfolio - use it
          setAllocations(data.portfolio.allocations as Allocation[]);
          setHasSavedPortfolio(true);
          if (data.portfolio.timestamp) {
            setSavedTimestamp(data.portfolio.timestamp);
          }
          if (data.portfolio.entryPrices) {
            setEntryPrices(data.portfolio.entryPrices);
          }
          
          // Fetch leaderboard to get current score and rank
          try {
            const leaderboardRes = await fetch('/api/leaderboard?limit=100');
            if (leaderboardRes.ok) {
              const leaderboard = await leaderboardRes.json();
              const entry = leaderboard.find((r: { user: string; score: number; rank: number }) => 
                r.user.toLowerCase() === address.toLowerCase()
              );
              if (entry) {
                setCurrentScore(entry.score);
                setCurrentRank(entry.rank);
              }
            }
          } catch (e) {
            console.error('Error fetching leaderboard:', e);
          }
        } else {
          // No saved portfolio - use defaults (only if not already initialized)
          if (!portfolioInitialized) {
            setAllocations(DEFAULT_ALLOCATIONS);
          }
        }
        
        setPortfolioInitialized(true);
      } catch (error) {
        console.error('Error loading portfolio:', error);
        setLoadError('Failed to load portfolio. Please refresh the page.');
        // On error, use defaults if not initialized
        if (!portfolioInitialized) {
          setAllocations(DEFAULT_ALLOCATIONS);
          setPortfolioInitialized(true);
        }
      } finally {
        setPortfolioLoading(false);
      }
    };

    loadPortfolio();
  }, [address, portfolioInitialized]);

  const totalPercentage = allocations.reduce((sum, a) => sum + a.percentage, 0);
  const isValid = totalPercentage === 100 && allocations.length > 0;

  const toggleAsset = (symbol: string) => {
    const existing = allocations.find(a => a.symbol === symbol);
    if (existing) {
      // Remove asset (but keep at least 1)
      if (allocations.length > 1) {
        setAllocations(prev => prev.filter(a => a.symbol !== symbol));
      }
    } else {
      // Add asset with 0% allocation
      setAllocations(prev => [...prev, { symbol, percentage: 0 }]);
    }
  };

  const updateAllocation = useCallback((symbol: string, newPercentage: number) => {
    const clampedPercentage = Math.max(0, Math.min(100, newPercentage));
    setAllocations(prev => 
      prev.map(a => 
        a.symbol === symbol ? { ...a, percentage: clampedPercentage } : a
      )
    );
  }, []);

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

  // Apply AI coach suggestion
  const applySuggestion = (suggestion: Suggestion) => {
    if (isLocked) return;
    
    setAllocations(prev => {
      const existing = prev.find(a => a.symbol === suggestion.asset);
      
      if (suggestion.type === 'add' && !existing) {
        // Add new asset
        return [...prev, { symbol: suggestion.asset, percentage: suggestion.suggestedAllocation }];
      }
      
      if (suggestion.type === 'remove' && existing) {
        // Remove asset
        return prev.filter(a => a.symbol !== suggestion.asset);
      }
      
      // Update existing allocation
      if (existing) {
        return prev.map(a => 
          a.symbol === suggestion.asset 
            ? { ...a, percentage: suggestion.suggestedAllocation }
            : a
        );
      }
      
      return prev;
    });
  };

  const canSave = !!address && isValid && !isLocked;

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
      
      const responseData = await res.json();
      
      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to save');
      }
      
      // Check if the server verified the save
      if (!responseData.verified) {
        console.warn('[PortfolioBuilder] Server did not confirm verification');
      }
      
      // EXTRA VERIFICATION: Fetch the portfolio back to confirm it was saved
      // Add a small delay to account for Redis propagation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('[PortfolioBuilder] Verifying save by fetching portfolio back...');
      const verifyRes = await fetch(`/api/portfolio?address=${address}`);
      const verifyData = await verifyRes.json();
      
      // Filter out 0% allocations for comparison (API filters these out when saving)
      const nonZeroAllocations = allocations.filter(a => a.percentage > 0);
      const savedAllocations = verifyData.portfolio?.allocations || [];
      
      // Compare allocations: check that we have the same number of non-zero allocations
      // and that all symbols match
      const savedSymbols = new Set(savedAllocations.map((a: { symbol: string }) => a.symbol));
      const expectedSymbols = new Set(nonZeroAllocations.map(a => a.symbol));
      
      if (!verifyData.portfolio || 
          savedAllocations.length !== nonZeroAllocations.length ||
          savedSymbols.size !== expectedSymbols.size ||
          !Array.from(expectedSymbols).every(symbol => savedSymbols.has(symbol))) {
        console.error('[PortfolioBuilder] VERIFICATION FAILED - Portfolio not found after save!');
        console.error('[PortfolioBuilder] Expected allocations:', nonZeroAllocations);
        console.error('[PortfolioBuilder] Got:', savedAllocations);
        throw new Error('Portfolio save verification failed. Your portfolio was not saved. Please try again.');
      }
      
      console.log('[PortfolioBuilder] Save verified successfully!');
      
      setStatus({ type: 'success', message: 'Portfolio locked in! Good luck this week.' });
      playSuccessBeep();
      
      // Track referral if this is first portfolio save and user was referred
      if (!hasSavedPortfolio && typeof window !== 'undefined') {
        const refCode = localStorage.getItem('portfolio_league_ref');
        if (refCode && address) {
          try {
            await fetch('/api/referral/track', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                referralCode: refCode,
                newUserAddress: address,
              }),
            });
            // Clear the ref code after tracking
            localStorage.removeItem('portfolio_league_ref');
          } catch (refError) {
            console.error('Error tracking referral:', refError);
          }
        }
      }
      
      setHasSavedPortfolio(true);
      
      // Update entry prices and timestamp from server response
      if (responseData.portfolio) {
        setSavedTimestamp(responseData.portfolio.timestamp);
        if (responseData.portfolio.entryPrices) {
          setEntryPrices(responseData.portfolio.entryPrices);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setStatus({ type: 'error', message });
      playErrorBeep();
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return '—';
    if (price >= 1000) return `$${(price / 1000).toFixed(1)}k`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(4)}`;
  };

  const selectedSymbols = allocations.map(a => a.symbol);

  // Show loading state while fetching portfolio
  if (portfolioLoading && address) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Build Your Portfolio</h2>
            <p className="text-sm text-white/50">Loading your saved portfolio...</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <svg className="h-8 w-8 animate-spin text-base-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-sm text-white/50">Fetching your portfolio data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Build Your Portfolio</h2>
          <p className="text-sm text-white/50">
            {isLocked 
              ? 'Picks are locked. Come back next Monday!'
              : 'Select up to 3 assets and allocate percentages'
            }
          </p>
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

      {/* Emulation Banner */}
      {emulatingMaster && (
        <div className="rounded-xl border border-base-blue/20 bg-gradient-to-r from-base-blue/10 to-purple-600/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-base-blue/20 text-lg">
                👑
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <span>Emulating</span>
                  <span className="text-base-blue">{emulatingMaster.masterName}</span>
                </div>
                <p className="text-xs text-white/50">
                  Customize the strategy to make it your own
                </p>
              </div>
            </div>
            <button
              onClick={() => setEmulatingMaster(null)}
              className="text-xs text-white/40 hover:text-white/60"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Lock Warning */}
      {isLocked && (
        <div className="rounded-xl border border-accent-amber/20 bg-accent-amber/10 px-4 py-3">
          <div className="flex items-center gap-2 text-accent-amber">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-sm font-medium">Week is locked - your picks are set!</span>
          </div>
        </div>
      )}

      {/* My Portfolio Status Card */}
      {hasSavedPortfolio && address && (
        <div className="rounded-2xl border border-accent-emerald/20 bg-accent-emerald/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-emerald/20">
                <svg className="h-4 w-4 text-accent-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Your Portfolio is Saved</h3>
                {savedTimestamp && (
                  <p className="text-xs text-white/40">
                    Submitted {new Date(savedTimestamp).toLocaleDateString()} at {new Date(savedTimestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            {currentRank && (
              <div className="flex items-center gap-2 rounded-full bg-accent-amber/10 px-3 py-1.5 border border-accent-amber/20">
                <span className="text-xs text-white/60">Rank</span>
                <span className="text-sm font-bold text-accent-amber">#{currentRank}</span>
              </div>
            )}
          </div>
          
          {/* Performance */}
          {currentScore !== undefined && (
            <div className="flex items-center gap-4 mb-4 p-3 rounded-xl bg-white/5">
              <div>
                <span className="text-xs text-white/40 block">Current Return</span>
                <span className={`text-xl font-bold font-mono ${currentScore >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                  {currentScore >= 0 ? '+' : ''}{currentScore.toFixed(2)}%
                </span>
              </div>
              {Object.keys(entryPrices).length > 0 && (
                <div className="flex-1 flex flex-wrap gap-2 justify-end">
                  {allocations.filter(a => a.percentage > 0).map(a => (
                    <div key={a.symbol} className="text-xs text-white/50">
                      <span className="font-mono">{a.symbol}</span>
                      <span className="text-white/30 ml-1">
                        @${entryPrices[a.symbol]?.toLocaleString() || '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Quick allocation summary */}
          <div className="flex items-center gap-2 flex-wrap">
            {allocations.filter(a => a.percentage > 0).map((a) => {
              const asset = getAsset(a.symbol);
              return (
                <div
                  key={a.symbol}
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs"
                  style={{ backgroundColor: `${asset?.color || '#666'}20` }}
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: asset?.color || '#666' }}
                  />
                  <span className="font-mono text-white">{a.symbol}</span>
                  <span className="text-white/50">{a.percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Update Indicator */}
      {lastPriceUpdate && (
        <div className="flex items-center justify-end gap-2 text-xs text-white/30">
          <div className="h-1.5 w-1.5 rounded-full bg-accent-emerald animate-pulse" />
          <span>Live prices • Updated {new Date(lastPriceUpdate).toLocaleTimeString()}</span>
        </div>
      )}

      {/* Load Error Warning */}
      {loadError && (
        <div className="rounded-xl border border-accent-rose/20 bg-accent-rose/10 px-4 py-3">
          <div className="flex items-center gap-2 text-accent-rose">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-medium">{loadError}</span>
          </div>
        </div>
      )}

      {/* Asset Selection with new AssetSelector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-white/40">Select Assets</span>
          <button
            onClick={autoBalance}
            disabled={isLocked || allocations.length === 0}
            className="text-xs text-base-blue hover:text-base-blue-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Auto-balance
          </button>
        </div>
        
        <AssetSelector
          selectedAssets={selectedSymbols}
          onToggleAsset={toggleAsset}
          maxAssets={3}
          disabled={!address || isLocked}
          prices={prices}
          pricesLoading={pricesLoading}
        />
      </div>

      {/* Allocation Sliders */}
      {allocations.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs font-medium uppercase tracking-wider text-white/40">
            Set Allocation
          </div>
          
          <div className="space-y-3">
            {allocations.map((allocation) => {
              const asset = getAsset(allocation.symbol);
              if (!asset) return null;
              
              return (
                <div
                  key={allocation.symbol}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-3 sm:p-4"
                >
                  {/* Mobile: Stack layout, Desktop: Row layout */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    {/* Asset info and remove button (mobile) */}
                    <div className="flex items-center justify-between sm:justify-start sm:w-28">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div 
                          className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${asset.color}20` }}
                        >
                          <Image
                            src={asset.logo}
                            alt={asset.name}
                            width={24}
                            height={24}
                            className="rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                        <span className="font-mono text-sm sm:text-base font-bold text-white">{asset.symbol}</span>
                      </div>
                      
                      {/* Mobile remove button */}
                      {allocations.length > 1 && !isLocked && (
                        <button
                          onClick={() => toggleAsset(allocation.symbol)}
                          className="flex sm:hidden h-7 w-7 items-center justify-center rounded-lg text-white/30 hover:bg-accent-rose/10 hover:text-accent-rose transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
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
                          disabled={isLocked}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => updateAllocation(allocation.symbol, allocation.percentage - 5)}
                        disabled={isLocked}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                        disabled={isLocked}
                        className="w-14 sm:w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-center font-mono text-sm text-white focus:border-base-blue focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className="text-white/40">%</span>
                      
                      <button
                        onClick={() => updateAllocation(allocation.symbol, allocation.percentage + 5)}
                        disabled={isLocked}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                      
                      {/* Desktop remove button */}
                      {allocations.length > 1 && !isLocked && (
                        <button
                          onClick={() => toggleAsset(allocation.symbol)}
                          className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:bg-accent-rose/10 hover:text-accent-rose transition-colors"
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
          {!isValid && !isLocked && (
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

      {/* AI Coach Panel */}
      {!isLocked && allocations.length > 0 && (
        <CoachPanel
          allocations={allocations}
          onApplySuggestion={applySuggestion}
        />
      )}

      {/* Portfolio Preview */}
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
                const asset = getAsset(allocation.symbol);
                return (
                  <div
                    key={allocation.symbol}
                    className="h-full flex items-center justify-center text-xs font-bold text-white transition-all duration-300"
                    style={{
                      width: `${allocation.percentage}%`,
                      backgroundColor: asset?.color || '#666',
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
              const asset = getAsset(allocation.symbol);
              return (
                <div key={allocation.symbol} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: asset?.color || '#666' }}
                  />
                  <span className="text-sm text-white/60">
                    {allocation.symbol}: <span className="font-mono font-bold text-white">{allocation.percentage}%</span>
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
        {isLocked ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Week Locked
          </span>
        ) : !address ? (
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

      {/* Share Section */}
      {hasSavedPortfolio && address && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-center">
            <p className="text-sm font-medium text-white">Share your portfolio</p>
            <p className="text-xs text-white/50">Challenge friends on Farcaster or X</p>
          </div>
          <ShareButtons
            address={address}
            allocations={allocations}
            score={currentScore}
            rank={currentRank}
          />
        </div>
      )}

      {/* Info Footer */}
      <p className="text-center text-xs text-white/30">
        {isLocked 
          ? 'Your picks are locked for this week. Results will be calculated on Sunday.'
          : 'Allocations are tied to your wallet address. You can update until Sunday 23:59 UTC.'
        }
      </p>
    </div>
  );
}
