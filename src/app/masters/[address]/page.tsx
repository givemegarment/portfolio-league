'use client';

import { useState, useEffect, use } from 'react';
import { Master, MasterActivity as MasterActivityType } from '@/app/types';
import { MasterActivity } from '@/components/masters/MasterActivity';

interface MasterPageProps {
  params: Promise<{ address: string }>;
}

interface MasterData {
  master: Master;
  activities: MasterActivityType[];
  metrics: {
    totalTransactions: number;
    swapCount: number;
    stakeCount: number;
    lpCount: number;
    avgTimeBetweenTrades: number;
  };
}

export default function MasterPage({ params }: MasterPageProps) {
  const { address } = use(params);
  const [data, setData] = useState<MasterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMasterData();
  }, [address]);

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/masters/${address}/activity`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load master data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-gray-800 rounded-xl"></div>
            <div className="h-64 bg-gray-800 rounded-xl"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-red-400">{error || 'Master not found'}</p>
          <a href="/" className="mt-4 inline-block text-amber-500 hover:underline">
            ← Back to Home
          </a>
        </div>
      </main>
    );
  }

  const { master, metrics } = data;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'defi': return 'bg-blue-500/20 text-blue-400';
      case 'nft': return 'bg-purple-500/20 text-purple-400';
      case 'yield': return 'bg-green-500/20 text-green-400';
      case 'momentum': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link */}
        <a href="/" className="text-amber-500 hover:underline text-sm">
          ← Back to Chamber
        </a>

        {/* Master Profile Header */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/30">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">
                  {master.alias || 'Anonymous Master'}
                </h1>
                {master.verified && (
                  <span className="text-amber-400" title="Verified Master">✓</span>
                )}
              </div>
              <p className="font-mono text-gray-400 text-sm">{address}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(master.category)}`}>
              {master.category.toUpperCase()}
            </span>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-xs text-gray-400">30d Return</p>
              <p className={`text-2xl font-bold ${master.performance30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {master.performance30d >= 0 ? '+' : ''}{master.performance30d.toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-xs text-gray-400">7d Return</p>
              <p className={`text-2xl font-bold ${master.performance7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {master.performance7d >= 0 ? '+' : ''}{master.performance7d.toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-xs text-gray-400">Scholars</p>
              <p className="text-2xl font-bold text-white">{master.followers}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-xs text-gray-400">Risk Profile</p>
              <p className={`text-xl font-bold capitalize
                ${master.riskProfile === 'aggressive' ? 'text-red-400' : ''}
                ${master.riskProfile === 'moderate' ? 'text-yellow-400' : ''}
                ${master.riskProfile === 'conservative' ? 'text-green-400' : ''}
              `}>
                {master.riskProfile}
              </p>
            </div>
          </div>
        </div>

        {/* Current Holdings */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Current Strategy</h2>
          <div className="space-y-3">
            {master.currentHoldings.map(holding => (
              <div key={holding.asset} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium text-white">{holding.asset}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-48 h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${holding.percentage}%` }}
                    />
                  </div>
                  <span className="text-white font-bold w-12 text-right">{holding.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trading Metrics */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Trading Behavior</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{metrics.totalTransactions}</p>
              <p className="text-xs text-gray-400">Total Txns (7d)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{metrics.swapCount}</p>
              <p className="text-xs text-gray-400">Swaps</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{metrics.stakeCount}</p>
              <p className="text-xs text-gray-400">Stakes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-400">{metrics.avgTimeBetweenTrades}h</p>
              <p className="text-xs text-gray-400">Avg Trade Gap</p>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-6 border border-indigo-500/30">
          <h2 className="text-lg font-semibold text-white mb-4">
            What Makes This Master Successful
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-indigo-400">•</span>
              <span className="text-gray-300">
                Maintains high ETH exposure during bullish market conditions, typically 40-50% of portfolio
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400">•</span>
              <span className="text-gray-300">
                Quick to rotate into stables during drawdowns, showing strong risk management
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400">•</span>
              <span className="text-gray-300">
                Average holding period of 48 hours suggests active but not over-traded approach
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400">•</span>
              <span className="text-gray-300">
                Historically outperforms during high volatility periods by 15-25%
              </span>
            </li>
          </ul>
        </div>

        {/* Recent Activity */}
        <MasterActivity masterAddress={address} />

        {/* Study This Master CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/95 border-t border-gray-700 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Ready to learn?</p>
              <p className="font-semibold text-white">
                Study {master.alias || 'this Master'} in the next Epoch
              </p>
            </div>
            <a
              href={`/?master=${address}`}
              className="px-6 py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors"
            >
              Study This Master →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
