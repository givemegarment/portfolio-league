'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Asset, AssetAllocation, PriceData } from '../types';
import { motion } from 'framer-motion';

interface PortfolioBuilderProps {
  hasSubmitted: boolean;
  onSubmit: () => void;
  currentLeague: any;
}

const ASSETS: Array<{ value: Asset; label: string; icon: string; color: string }> = [
  { value: 'BTC', label: 'Bitcoin', icon: '₿', color: 'bg-orange-500' },
  { value: 'ETH', label: 'Ethereum', icon: 'Ξ', color: 'bg-purple-500' },
  { value: 'SOL', label: 'Solana', icon: '◎', color: 'bg-cyan-500' },
  { value: 'USDC_YIELD', label: 'USDC Yield', icon: '$', color: 'bg-green-500' },
];

export function PortfolioBuilder({ hasSubmitted, onSubmit, currentLeague }: PortfolioBuilderProps) {
  const { address } = useAccount();
  const [selectedAssets, setSelectedAssets] = useState<(Asset | null)[]>([null, null, null]);
  const [allocations, setAllocations] = useState<number[]>([33, 33, 34]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prices, setPrices] = useState<Record<Asset, PriceData>>({} as any);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchPrices = async () => {
    try {
      const response = await fetch('/api/prices');
      const data = await response.json();
      setPrices(data);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const handleAssetSelect = (index: number, asset: Asset) => {
    const newAssets = [...selectedAssets];
    
    // Check if asset is already selected
    if (selectedAssets.includes(asset)) {
      alert('This asset is already selected. Please choose a different one.');
      return;
    }
    
    newAssets[index] = asset;
    setSelectedAssets(newAssets);
  };

  const handleAllocationChange = (index: number, value: number) => {
    const newAllocations = [...allocations];
    newAllocations[index] = Math.max(0, Math.min(100, value));
    
    // Auto-adjust other allocations
    const total = newAllocations.reduce((a, b) => a + b, 0);
    if (total !== 100) {
      const diff = 100 - total;
      const otherIndices = [0, 1, 2].filter(i => i !== index);
      const adjust = diff / otherIndices.length;
      otherIndices.forEach(i => {
        newAllocations[i] = Math.max(0, Math.min(100, newAllocations[i] + adjust));
      });
    }
    
    setAllocations(newAllocations);
  };

  const handleEqualSplit = () => {
    setAllocations([33.33, 33.33, 33.34]);
  };

  const getTotalAllocation = () => {
    return allocations.reduce((a, b) => a + b, 0).toFixed(2);
  };

  const canSubmit = () => {
    return (
      !hasSubmitted &&
      selectedAssets.every(asset => asset !== null) &&
      Math.abs(parseFloat(getTotalAllocation()) - 100) < 0.01 &&
      currentLeague?.status === 'active'
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/portfolio/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          assets: selectedAssets,
          allocations: allocations.map(a => Math.round(a)),
          season: currentLeague.season,
        }),
      });

      if (response.ok) {
        onSubmit();
        // Generate Frame for sharing
        await generateFrame();
      } else {
        alert('Failed to submit portfolio');
      }
    } catch (error) {
      console.error('Error submitting portfolio:', error);
      alert('Error submitting portfolio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateFrame = async () => {
    try {
      await fetch('/api/frame/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          assets: selectedAssets,
          allocations,
          season: currentLeague.season,
        }),
      });
    } catch (error) {
      console.error('Error generating frame:', error);
    }
  };

  if (hasSubmitted) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-2xl font-bold mb-2">Portfolio Submitted!</h3>
        <p className="text-gray-400 mb-6">
          Your portfolio has been recorded on-chain. Track your performance in the Leaderboard tab.
        </p>
        <div className="glass-card p-4 bg-base-gray">
          <p className="text-sm text-gray-400 mb-2">Your Portfolio</p>
          <div className="space-y-2">
            {selectedAssets.map((asset, i) => (
              asset && (
                <div key={i} className="flex justify-between items-center">
                  <span className="font-semibold">{asset}</span>
                  <span className="text-gray-400">{allocations[i].toFixed(0)}%</span>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8">
      <h2 className="text-2xl font-bold mb-6">Build Your Portfolio</h2>
      <p className="text-gray-400 mb-8">
        Select 3 assets from the whitelist and allocate 100% across them.
      </p>

      {/* Asset Selection */}
      <div className="space-y-6 mb-8">
        {[0, 1, 2].map(index => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-700 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold">
                Asset #{index + 1}
              </label>
              {selectedAssets[index] && (
                <button
                  onClick={() => {
                    const newAssets = [...selectedAssets];
                    newAssets[index] = null;
                    setSelectedAssets(newAssets);
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Asset Selector */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {ASSETS.map(asset => (
                <button
                  key={asset.value}
                  onClick={() => handleAssetSelect(index, asset.value)}
                  disabled={selectedAssets.includes(asset.value) && selectedAssets[index] !== asset.value}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedAssets[index] === asset.value
                      ? `${asset.color} border-transparent`
                      : selectedAssets.includes(asset.value)
                      ? 'border-gray-700 bg-gray-800 opacity-50 cursor-not-allowed'
                      : 'border-gray-700 hover:border-gray-500 bg-base-gray'
                  }`}
                >
                  <div className="text-2xl mb-1">{asset.icon}</div>
                  <div className="text-xs font-semibold">{asset.label}</div>
                  {prices[asset.value] && (
                    <div className="text-xs text-gray-400 mt-1">
                      ${prices[asset.value].price.toLocaleString()}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Allocation Slider */}
            {selectedAssets[index] && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-400">Allocation</label>
                  <span className="text-lg font-bold">{allocations[index].toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={allocations[index]}
                  onChange={e => handleAllocationChange(index, parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Total & Actions */}
      <div className="border-t border-gray-700 pt-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">Total Allocation:</span>
          <span
            className={`text-2xl font-bold ${
              Math.abs(parseFloat(getTotalAllocation()) - 100) < 0.01
                ? 'text-success-green'
                : 'text-danger-red'
            }`}
          >
            {getTotalAllocation()}%
          </span>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleEqualSplit}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Equal Split (33/33/34)
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit() || isSubmitting}
            className="flex-1 px-6 py-3 bg-base-blue hover:bg-blue-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Portfolio'}
          </button>
        </div>

        {!canSubmit() && selectedAssets.every(a => a !== null) && (
          <p className="text-sm text-danger-red mt-2 text-center">
            {Math.abs(parseFloat(getTotalAllocation()) - 100) >= 0.01
              ? 'Allocations must sum to 100%'
              : currentLeague?.status !== 'active'
              ? 'League is not active'
              : 'Already submitted for this season'}
          </p>
        )}
      </div>
    </div>
  );
}
