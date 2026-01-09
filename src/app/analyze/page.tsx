'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import Nav from '@/components/chrome/Nav';
import PortfolioAnalyzer from '@/components/analysis/PortfolioAnalyzer';
import CorrelationMatrix from '@/components/analysis/CorrelationMatrix';
import PortfolioMetrics from '@/components/portfolio/PortfolioMetrics';
import { AllocationItem } from '@/lib/scoring';
import { SUPPORTED_ASSETS, getAsset } from '@/lib/assets';

type PortfolioData = {
  allocations: AllocationItem[];
  entryPrices: Record<string, number>;
  timestamp: number;
  score?: number;
};

type PriceData = Record<string, { price: number; change24h: number }>;

export default function AnalyzePage() {
  const { address, isConnected } = useAccount();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [prices, setPrices] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Demo portfolio for non-connected users
  const [demoAllocations, setDemoAllocations] = useState<AllocationItem[]>([
    { symbol: 'BTC', percentage: 40 },
    { symbol: 'ETH', percentage: 30 },
    { symbol: 'SOL', percentage: 30 },
  ]);
  const [showDemo, setShowDemo] = useState(false);

  // Fetch portfolio and prices
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch prices first
        const pricesRes = await fetch('/api/prices');
        if (pricesRes.ok) {
          const pricesData = await pricesRes.json();
          setPrices(pricesData.prices || pricesData);
        }

        // Fetch portfolio if connected
        if (address && isConnected) {
          const portfolioRes = await fetch(`/api/portfolio?address=${address}`);
          if (portfolioRes.ok) {
            const data = await portfolioRes.json();
            if (data.portfolio && data.portfolio.allocations?.length > 0) {
              setPortfolio(data.portfolio);
              setShowDemo(false);
            } else {
              setShowDemo(true);
            }
          } else {
            setShowDemo(true);
          }
        } else {
          setShowDemo(true);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
        setShowDemo(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address, isConnected]);

  // Calculate returns
  const returns = useMemo(() => {
    if (!prices) return { current: 0, btc: 0, eth: 0 };

    const btcChange = prices['BTC']?.change24h || 0;
    const ethChange = prices['ETH']?.change24h || 0;

    // For current portfolio return, use score if available
    const currentReturn = portfolio?.score || 0;

    return {
      current: currentReturn,
      btc: btcChange,
      eth: ethChange,
    };
  }, [prices, portfolio]);

  // Active allocations (either real or demo)
  const activeAllocations = useMemo(() => {
    if (!showDemo && portfolio?.allocations) {
      return portfolio.allocations;
    }
    return demoAllocations;
  }, [showDemo, portfolio, demoAllocations]);

  const activeEntryPrices = useMemo(() => {
    if (!showDemo && portfolio?.entryPrices) {
      return portfolio.entryPrices;
    }
    // Use current prices as entry for demo
    const demoPrices: Record<string, number> = {};
    demoAllocations.forEach(a => {
      demoPrices[a.symbol] = prices?.[a.symbol]?.price || 0;
    });
    return demoPrices;
  }, [showDemo, portfolio, demoAllocations, prices]);

  // Handle demo portfolio changes
  const updateDemoAllocation = (symbol: string, percentage: number) => {
    setDemoAllocations(prev => {
      const existing = prev.find(a => a.symbol === symbol);
      if (existing) {
        if (percentage === 0) {
          return prev.filter(a => a.symbol !== symbol);
        }
        return prev.map(a => (a.symbol === symbol ? { ...a, percentage } : a));
      }
      if (percentage > 0) {
        return [...prev, { symbol, percentage }];
      }
      return prev;
    });
  };

  const totalAllocation = demoAllocations.reduce((sum, a) => sum + a.percentage, 0);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 rounded-2xl bg-white/5" />
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-64 rounded-2xl bg-white/5" />
              <div className="h-64 rounded-2xl bg-white/5" />
            </div>
            <div className="h-48 rounded-2xl bg-white/5" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-2">
            <span className="text-lg">📊</span>
            <span className="text-sm font-medium text-purple-400">
              Portfolio Analysis
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Analyze Your Portfolio
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/60">
            Deep dive into your portfolio with risk scoring, scenario testing,
            and actionable insights.
          </p>
        </div>

        {/* Demo Mode Toggle */}
        {showDemo && (
          <div className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-amber-400">Demo Mode</h3>
                <p className="mt-1 text-sm text-white/60">
                  {!isConnected
                    ? 'Connect wallet to analyze your real portfolio, or try the demo below.'
                    : 'No portfolio found. Build one in the main page, or try the demo below.'}
                </p>
              </div>
              <a
                href="/"
                className="shrink-0 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400"
              >
                {isConnected ? 'Build Portfolio' : 'Connect Wallet'}
              </a>
            </div>

            {/* Demo Portfolio Builder */}
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-white/80">
                  Demo Portfolio ({totalAllocation}% allocated)
                </span>
                {totalAllocation !== 100 && (
                  <span className="text-xs text-amber-400">
                    Must equal 100%
                  </span>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {['BTC', 'ETH', 'SOL', 'PEPE', 'DEGEN', 'LINK', 'USDC', 'AERO'].map(
                  (symbol) => {
                    const asset = getAsset(symbol);
                    const alloc = demoAllocations.find((a) => a.symbol === symbol);
                    const pct = alloc?.percentage || 0;

                    return (
                      <div
                        key={symbol}
                        className={`flex items-center gap-2 rounded-lg border p-2 transition-colors ${
                          pct > 0
                            ? 'border-white/20 bg-white/5'
                            : 'border-white/5 bg-white/[0.02]'
                        }`}
                      >
                        <img
                          src={asset?.logo || `/coins/${symbol.toLowerCase()}.svg`}
                          alt={symbol}
                          className="h-6 w-6"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/coins/generic.svg';
                          }}
                        />
                        <span className="text-sm font-medium text-white">
                          {symbol}
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={pct || ''}
                          onChange={(e) =>
                            updateDemoAllocation(symbol, parseInt(e.target.value) || 0)
                          }
                          placeholder="0"
                          className="ml-auto w-14 rounded bg-white/10 px-2 py-1 text-right text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
                        />
                        <span className="text-xs text-white/40">%</span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-center text-rose-400">
            {error}
          </div>
        )}

        {/* Main Analysis */}
        {activeAllocations.length > 0 && totalAllocation === 100 ? (
          <div className="space-y-8">
            {/* Portfolio Analyzer */}
            <PortfolioAnalyzer
              allocations={activeAllocations}
              currentReturn={returns.current}
              btcReturn={returns.btc}
              ethReturn={returns.eth}
            />

            {/* Additional Analysis Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Correlation Matrix */}
              <CorrelationMatrix allocations={activeAllocations} prices={prices || undefined} />

              {/* Portfolio Metrics */}
              <PortfolioMetrics
                allocations={activeAllocations}
                entryPrices={activeEntryPrices}
                prices={prices || undefined}
              />
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
              <h3 className="mb-4 text-lg font-bold text-white">Quick Actions</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <a
                  href="/"
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.05]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 text-lg">
                    ✏️
                  </div>
                  <div>
                    <div className="font-medium text-white">Edit Portfolio</div>
                    <div className="text-xs text-white/40">
                      Modify your picks
                    </div>
                  </div>
                </a>
                <a
                  href="/leagues"
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.05]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-lg">
                    🏆
                  </div>
                  <div>
                    <div className="font-medium text-white">Join Leagues</div>
                    <div className="text-xs text-white/40">Compete with others</div>
                  </div>
                </a>
                <a
                  href="/masters"
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.05]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 text-lg">
                    👑
                  </div>
                  <div>
                    <div className="font-medium text-white">Follow Masters</div>
                    <div className="text-xs text-white/40">
                      Learn from the best
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-surface-2 p-12 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 text-4xl">
              📊
            </div>
            <h3 className="text-xl font-bold text-white">
              {totalAllocation !== 100
                ? 'Allocations Must Equal 100%'
                : 'No Portfolio to Analyze'}
            </h3>
            <p className="mt-2 text-white/60">
              {totalAllocation !== 100
                ? `Current total: ${totalAllocation}%. Adjust your demo allocations above.`
                : 'Build a portfolio to see comprehensive analysis.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
