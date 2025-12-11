'use client';

import { useState, useMemo } from 'react';
import { Master, AssetAllocation, Asset } from '@/app/types';
import { Badge } from '@/components/ui/Badge';

interface EmulationBuilderProps {
  master: Master;
  onSubmit: (strategy: AssetAllocation[]) => void;
  maxAssets?: number;
}

interface AssetOption {
  id: Asset;
  name: string;
  icon: string;
  color: string;
}

const AVAILABLE_ASSETS: AssetOption[] = [
  { id: 'BTC', name: 'Bitcoin', icon: '₿', color: 'text-orange-400' },
  { id: 'ETH', name: 'Ethereum', icon: 'Ξ', color: 'text-blue-400' },
  { id: 'SOL', name: 'Solana', icon: '◎', color: 'text-purple-400' },
  { id: 'USDC_YIELD', name: 'USDC Yield', icon: '$', color: 'text-green-400' },
];

export function EmulationBuilder({ master, onSubmit, maxAssets = 3 }: EmulationBuilderProps) {
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [allocations, setAllocations] = useState<Record<Asset, number>>({
    BTC: 0,
    ETH: 0,
    SOL: 0,
    USDC_YIELD: 0,
  });

  // Calculate fidelity score based on how closely strategy matches master
  const fidelityScore = useMemo(() => {
    if (selectedAssets.length === 0) return 0;

    const masterAssets = master.currentHoldings.map(h => h.asset);
    const matchingAssets = selectedAssets.filter(a => masterAssets.includes(a));
    
    // Base score from asset matching (0-60 points)
    const assetMatchScore = (matchingAssets.length / Math.max(masterAssets.length, selectedAssets.length)) * 60;
    
    // Allocation similarity score (0-40 points)
    let allocationScore = 0;
    if (matchingAssets.length > 0) {
      const masterAllocMap = Object.fromEntries(
        master.currentHoldings.map(h => [h.asset, h.percentage])
      );
      
      let totalDiff = 0;
      matchingAssets.forEach(asset => {
        const masterAlloc = masterAllocMap[asset] || 0;
        const scholarAlloc = allocations[asset] || 0;
        totalDiff += Math.abs(masterAlloc - scholarAlloc);
      });
      
      // Max possible diff is 200 (100% difference on 2 assets)
      allocationScore = Math.max(0, 40 - (totalDiff / 5));
    }

    return Math.round(assetMatchScore + allocationScore);
  }, [selectedAssets, allocations, master]);

  // Calculate expected adaptation potential
  const adaptationPotential = useMemo(() => {
    if (selectedAssets.length === 0) return 'neutral';
    
    const masterAssets = master.currentHoldings.map(h => h.asset);
    const uniqueAssets = selectedAssets.filter(a => !masterAssets.includes(a));
    
    if (uniqueAssets.length >= 2) return 'high';
    if (uniqueAssets.length === 1) return 'moderate';
    if (fidelityScore > 80) return 'low';
    return 'moderate';
  }, [selectedAssets, master, fidelityScore]);

  const handleAssetToggle = (asset: Asset) => {
    if (selectedAssets.includes(asset)) {
      setSelectedAssets(prev => prev.filter(a => a !== asset));
      setAllocations(prev => ({ ...prev, [asset]: 0 }));
    } else if (selectedAssets.length < maxAssets) {
      setSelectedAssets(prev => [...prev, asset]);
      // Auto-distribute allocation
      const newCount = selectedAssets.length + 1;
      const evenAlloc = Math.floor(100 / newCount);
      const newAllocations = { ...allocations };
      [...selectedAssets, asset].forEach((a, i) => {
        newAllocations[a] = i === newCount - 1 ? 100 - (evenAlloc * (newCount - 1)) : evenAlloc;
      });
      setAllocations(newAllocations);
    }
  };

  const handleAllocationChange = (asset: Asset, value: number) => {
    const otherAssets = selectedAssets.filter(a => a !== asset);
    const remaining = 100 - value;
    
    if (otherAssets.length > 0) {
      const evenSplit = Math.floor(remaining / otherAssets.length);
      const newAllocations = { ...allocations, [asset]: value };
      otherAssets.forEach((a, i) => {
        newAllocations[a] = i === otherAssets.length - 1 
          ? remaining - (evenSplit * (otherAssets.length - 1))
          : evenSplit;
      });
      setAllocations(newAllocations);
    } else {
      setAllocations(prev => ({ ...prev, [asset]: value }));
    }
  };

  const handleSubmit = () => {
    const strategy: AssetAllocation[] = selectedAssets.map(asset => ({
      asset,
      percentage: allocations[asset],
    }));
    onSubmit(strategy);
  };

  const totalAllocation = selectedAssets.reduce((sum, asset) => sum + allocations[asset], 0);
  const isValid = selectedAssets.length === maxAssets && totalAllocation === 100;

  return (
    <div className="space-y-6">
      {/* Master Reference */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-amber-400">
            Studying: {master.alias || master.address.slice(0, 10) + '...'}
          </h3>
          <span className="text-xs text-gray-400">Reference Strategy</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {master.currentHoldings.map(holding => (
            <div
              key={holding.asset}
              className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1.5"
            >
              <span className="text-sm font-medium">{holding.asset}</span>
              <span className="text-xs text-gray-400">{holding.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Asset Selection */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Build Your Strategy</h3>
        <div className="grid grid-cols-2 gap-3">
          {AVAILABLE_ASSETS.map(asset => {
            const isSelected = selectedAssets.includes(asset.id);
            const isDisabled = !isSelected && selectedAssets.length >= maxAssets;
            const isMasterAsset = master.currentHoldings.some(h => h.asset === asset.id);

            return (
              <button
                key={asset.id}
                onClick={() => handleAssetToggle(asset.id)}
                disabled={isDisabled}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-200
                  ${isSelected
                    ? 'border-amber-500 bg-amber-500/10 scale-[1.02]'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }
                  ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {/* Master indicator */}
                {isMasterAsset && (
                  <span className="absolute top-2 right-2 text-xs text-amber-400">★</span>
                )}
                
                {/* Selection number */}
                {isSelected && (
                  <div className="absolute top-2 left-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-black text-xs font-bold">
                      {selectedAssets.indexOf(asset.id) + 1}
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <span className={`text-3xl ${asset.color}`}>{asset.icon}</span>
                  <p className="font-medium text-white mt-2">{asset.name}</p>
                  <p className="text-xs text-gray-400">{asset.id}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Allocation Sliders */}
      {selectedAssets.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <h4 className="text-sm font-semibold text-white mb-4">Allocations</h4>
          <div className="space-y-4">
            {selectedAssets.map(asset => {
              const assetInfo = AVAILABLE_ASSETS.find(a => a.id === asset);
              return (
                <div key={asset} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${assetInfo?.color}`}>
                      {assetInfo?.icon} {asset}
                    </span>
                    <span className="text-white font-bold">{allocations[asset]}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={allocations[asset]}
                    onChange={(e) => handleAllocationChange(asset, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              );
            })}
          </div>

          {/* Total indicator */}
          <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between">
            <span className="text-gray-400">Total</span>
            <span className={`font-bold ${totalAllocation === 100 ? 'text-green-400' : 'text-red-400'}`}>
              {totalAllocation}%
            </span>
          </div>
        </div>
      )}

      {/* Fidelity vs Adaptation Analysis */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Fidelity Score</p>
          <p className="text-2xl font-bold text-indigo-400">{fidelityScore}%</p>
          <p className="text-xs text-gray-500 mt-1">Match to Master's strategy</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Adaptation Potential</p>
          <p className={`text-2xl font-bold capitalize
            ${adaptationPotential === 'high' ? 'text-green-400' : ''}
            ${adaptationPotential === 'moderate' ? 'text-yellow-400' : ''}
            ${adaptationPotential === 'low' ? 'text-orange-400' : ''}
            ${adaptationPotential === 'neutral' ? 'text-gray-400' : ''}
          `}>
            {adaptationPotential}
          </p>
          <p className="text-xs text-gray-500 mt-1">Chance to outperform</p>
        </div>
      </div>

      {/* Strategy Summary */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <p className="text-sm text-gray-400 mb-2">Your Strategy</p>
        {selectedAssets.length === 0 ? (
          <p className="text-gray-500">Select {maxAssets} assets to build your strategy</p>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {selectedAssets.map((asset, index) => {
              const assetInfo = AVAILABLE_ASSETS.find(a => a.id === asset);
              return (
                <Badge key={asset} variant="default" className={`${assetInfo?.color}`}>
                  {index + 1}. {assetInfo?.icon} {asset} ({allocations[asset]}%)
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className={`
          w-full py-4 rounded-xl font-semibold text-lg transition-all
          ${isValid
            ? 'bg-amber-500 text-black hover:bg-amber-400'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {!isValid 
          ? `Select ${maxAssets - selectedAssets.length} more asset${maxAssets - selectedAssets.length !== 1 ? 's' : ''}`
          : 'Submit Emulation'
        }
      </button>
    </div>
  );
}
