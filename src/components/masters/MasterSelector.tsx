'use client';

import { useState, useEffect } from 'react';
import { Master } from '@/app/types';
import { MasterCard } from './MasterCard';

interface MasterSelectorProps {
  onMasterSelect: (master: Master) => void;
  selectedMaster?: Master | null;
}

type Category = 'all' | 'defi' | 'nft' | 'yield' | 'momentum' | 'general';
type RiskProfile = 'all' | 'conservative' | 'moderate' | 'aggressive';
type SortOption = 'performance30d' | 'performance7d' | 'followers';

export function MasterSelector({ onMasterSelect, selectedMaster }: MasterSelectorProps) {
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [category, setCategory] = useState<Category>('all');
  const [riskProfile, setRiskProfile] = useState<RiskProfile>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('performance30d');

  useEffect(() => {
    fetchMasters();
  }, [category, riskProfile, verifiedOnly, sortBy]);

  const fetchMasters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (riskProfile !== 'all') params.set('risk', riskProfile);
      if (verifiedOnly) params.set('verified', 'true');
      params.set('sortBy', sortBy);

      const response = await fetch(`/api/masters/discover?${params}`);
      const data = await response.json();

      if (data.success) {
        setMasters(data.data.masters);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load masters');
      console.error('Error fetching masters:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Master</h2>
        <p className="text-gray-400">
          Study a Master's strategy and adapt it to compete in the Chamber
        </p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="defi">DeFi</option>
              <option value="nft">NFT</option>
              <option value="yield">Yield</option>
              <option value="momentum">Momentum</option>
              <option value="general">General</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Risk Profile</label>
            <select
              value={riskProfile}
              onChange={(e) => setRiskProfile(e.target.value as RiskProfile)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Profiles</option>
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="performance30d">30d Performance</option>
              <option value="performance7d">7d Performance</option>
              <option value="followers">Most Studied</option>
            </select>
          </div>

          {/* Verified Toggle */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-300">Verified Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent"></div>
          <p className="text-gray-400 mt-2">Discovering Masters...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchMasters}
            className="mt-4 px-4 py-2 bg-amber-500 text-black rounded-lg hover:bg-amber-400"
          >
            Retry
          </button>
        </div>
      )}

      {/* Masters Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {masters.map((master) => (
            <MasterCard
              key={master.address}
              master={master}
              isSelected={selectedMaster?.address === master.address}
              onSelect={onMasterSelect}
              showDetails={true}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && masters.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No Masters found matching your filters</p>
          <button
            onClick={() => {
              setCategory('all');
              setRiskProfile('all');
              setVerifiedOnly(false);
            }}
            className="mt-4 text-amber-500 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Selected Master Summary */}
      {selectedMaster && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/95 border-t border-gray-700 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Studying</p>
              <p className="font-semibold text-white">
                {selectedMaster.alias || selectedMaster.address.slice(0, 10) + '...'}
              </p>
            </div>
            <button
              className="px-6 py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors"
            >
              Continue to Strategy Builder →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
