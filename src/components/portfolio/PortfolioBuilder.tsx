'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import ShareButtons from '@/components/share/ShareButtons';
import CoachPanel from '@/components/coach/CoachPanel';
import { type Suggestion } from '@/lib/ai-coach';
import { calculateScore, type StoredPortfolio } from '@/lib/scoring';

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
type PriceData = { price: number; change24h: number };
type Props = { address?: `0x${string}` };

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
  const [liveReturn, setLiveReturn] = useState<number | undefined>(undefined);
  const [livePortfolioValue, setLivePortfolioValue] = useState<number | undefined>(undefined);
  const [scoreBreakdown, setScoreBreakdown] = useState<Array<{
    symbol: string;
    percentage: number;
    assetReturn: number;
    weightedReturn: number;
  }>>([]);

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

  // Calculate live portfolio return when we have entry prices and current prices
  useEffect(() => {
    if (allocations.length === 0 || Object.keys(entryPrices).length === 0 || Object.keys(prices).length === 0) {
      setLiveReturn(undefined);
      setLivePortfolioValue(undefined);
      setScoreBreakdown([]);
      return;
    }

    try {
      // Create StoredPortfolio object for calculation
      const portfolio: StoredPortfolio = {
        allocations: allocations.map(a => ({ symbol: a.symbol, percentage: a.percentage })),
        entryPrices,
        timestamp: savedTimestamp || Date.now(),
      };

      // Convert prices to PriceData format
      const priceDataMap: Record<string, { price: number; change24h?: number }> = {};
      for (const [symbol, priceData] of Object.entries(prices)) {
        priceDataMap[symbol] = {
          price: priceData.price,
          change24h: priceData.change24h,
        };
      }

      // Calculate score
      const result = calculateScore(portfolio, priceDataMap);
      setLiveReturn(result.totalScore);
      
      // Calculate portfolio value (starting from base value of 100)
      const BASE_VALUE = 100;
      const portfolioValue = BASE_VALUE * (1 + result.totalScore / 100);
      setLivePortfolioValue(portfolioValue);
      
      // Store breakdown
      setScoreBreakdown(result.breakdown);
    } catch (error) {
      console.error('Error calculating live portfolio return:', error);
      setLiveReturn(undefined);
      setLivePortfolioValue(undefined);
    }
  }, [allocations, entryPrices, prices, savedTimestamp]);

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

  const addAsset = (symbol: AssetSymbol) => {
    if (allocations.find(a => a.symbol === symbol)) return;
    setAllocations(prev => [...prev, { symbol, percentage: 0 }]);
  };

  const removeAsset = (symbol: AssetSymbol) => {
    if (allocations.length <= 1) return;
    setAllocations(prev => prev.filter(a => a.symbol !== symbol));
  };

  const updateAllocation = useCallback((symbol: AssetSymbol, newPercentage: number) => {
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
        return [...prev, { symbol: suggestion.asset as AssetSymbol, percentage: suggestion.suggestedAllocation }];
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
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save');
      }
      
      const responseData = await res.json();
      
      setStatus({ type: 'success', message: 'Portfolio locked in! Good luck this week. 🎯' });
      
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
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${(price / 1000).toFixed(1)}k`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(4)}`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
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
              : 'Allocate percentages to your selected assets'
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
          </div>
          
          {/* Live Performance */}
          {(liveReturn !== undefined || currentScore !== undefined) && (
            <div className="mb-4 space-y-3">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10">
                <div className="flex-1">
                  <span className="text-xs text-white/40 block mb-1">Current Return</span>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold font-mono ${(liveReturn ?? currentScore ?? 0) >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                      {(liveReturn ?? currentScore ?? 0) >= 0 ? '+' : ''}{(liveReturn ?? currentScore ?? 0).toFixed(2)}%
                    </span>
                    {livePortfolioValue !== undefined && (
                      <span className="text-sm text-white/60 font-mono">
                        (${livePortfolioValue.toFixed(2)})
                      </span>
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
              
              {/* Score Breakdown */}
              {scoreBreakdown.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {scoreBreakdown.map((item) => (
                    <div key={item.symbol} className="rounded-lg bg-white/[0.03] p-2">
                      <div className="text-xs text-white/40 mb-1">{item.symbol}</div>
                      <div className={`text-sm font-bold font-mono ${item.assetReturn >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                        {item.assetReturn >= 0 ? '+' : ''}{item.assetReturn.toFixed(2)}%
                      </div>
                      <div className="text-xs text-white/30 mt-0.5">
                        {item.percentage}% • {item.weightedReturn >= 0 ? '+' : ''}{item.weightedReturn.toFixed(2)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Entry Prices */}
              {Object.keys(entryPrices).length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {allocations.filter(a => a.percentage > 0).map(a => (
                    <div key={a.symbol} className="text-white/50">
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
          <div className="flex items-center gap-2">
            {allocations.filter(a => a.percentage > 0).map((a) => {
              const asset = ASSETS.find(asset => asset.symbol === a.symbol);
              return (
                <div
                  key={a.symbol}
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs"
                  style={{ backgroundColor: `${asset?.color}20` }}
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: asset?.color }}
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

      {/* Asset Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-white/40">Select Assets</span>
          <button
            onClick={autoBalance}
            disabled={isLocked}
            className="text-xs text-base-blue hover:text-base-blue-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Auto-balance
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ASSETS.map((asset) => {
            const isSelected = selectedSymbols.includes(asset.symbol);
            const priceData = prices[asset.symbol];
            const isPositive = priceData && priceData.change24h >= 0;
            
            return (
              <button
                key={asset.symbol}
                onClick={() => isSelected ? removeAsset(asset.symbol) : addAsset(asset.symbol)}
                disabled={!address || isLocked}
                className={`
                  group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300
                  ${isSelected 
                    ? 'border-base-blue/50 bg-base-blue/10' 
                    : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/5'
                  }
                  ${(!address || isLocked) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
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
                
                {/* Glow effect */}
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
                
                {/* Price with 24h change */}
                <div className="mt-3 space-y-1">
                  {pricesLoading ? (
                    <div className="h-4 w-16 rounded shimmer" />
                  ) : priceData ? (
                    <>
                      <div className="font-mono text-sm text-white/80">
                        {formatPrice(priceData.price)}
                      </div>
                      <div className={`font-mono text-xs ${isPositive ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                        {formatChange(priceData.change24h)}
                      </div>
                    </>
                  ) : null}
                </div>
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
                          disabled={isLocked}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex items-center gap-2">
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
                        className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-center font-mono text-sm text-white focus:border-base-blue focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                      
                      {/* Remove button */}
                      {allocations.length > 1 && !isLocked && (
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
