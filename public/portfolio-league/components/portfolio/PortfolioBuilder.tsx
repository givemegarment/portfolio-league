'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';

interface Asset {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface PortfolioBuilderProps {
  assets: Asset[];
  maxSelection?: number;
  onSelectionChange?: (selected: string[]) => void;
}

export function PortfolioBuilder({ 
  assets, 
  maxSelection = 3,
  onSelectionChange 
}: PortfolioBuilderProps) {
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  const handleToggle = (assetId: string) => {
    let newSelection: string[];
    
    if (selectedAssets.includes(assetId)) {
      newSelection = selectedAssets.filter(id => id !== assetId);
    } else if (selectedAssets.length < maxSelection) {
      newSelection = [...selectedAssets, assetId];
    } else {
      return; // Max selection reached
    }

    setSelectedAssets(newSelection);
    onSelectionChange?.(newSelection);
  };

  return (
    <div className="space-y-6">
      {/* Asset Grid */}
      <div className="grid grid-cols-2 gap-4">
        {assets.map((asset) => {
          const isSelected = selectedAssets.includes(asset.id);
          const isDisabled = !isSelected && selectedAssets.length >= maxSelection;

          return (
            <button
              key={asset.id}
              onClick={() => handleToggle(asset.id)}
              disabled={isDisabled}
              className={`
                relative p-6 rounded-xl border-2 transition-all duration-200
                ${isSelected
                  ? 'border-base-blue bg-base-blue/10 scale-105 shadow-lg shadow-base-blue/20'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }
                ${isDisabled
                  ? 'opacity-40 cursor-not-allowed'
                  : 'cursor-pointer hover:scale-102'
                }
              `}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-base-blue rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {selectedAssets.indexOf(asset.id) + 1}
                  </span>
                </div>
              )}

              {/* Asset Info */}
              <div className="text-center">
                <div className={`text-4xl mb-2 ${asset.color}`}>
                  {asset.icon}
                </div>
                <div className="font-semibold text-lg">{asset.name}</div>
                <div className="text-sm text-gray-400">{asset.id}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selection Summary */}
      <div className="bg-gray-800/50 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-400 text-sm">Your Portfolio</span>
            <div className="flex gap-2 mt-2">
              {selectedAssets.length === 0 ? (
                <span className="text-gray-500 text-sm">No assets selected</span>
              ) : (
                selectedAssets.map((id, index) => {
                  const asset = assets.find(a => a.id === id);
                  return (
                    <Badge 
                      key={id} 
                      variant="default" 
                      className={`${asset?.color} flex items-center gap-1`}
                    >
                      <span>{index + 1}.</span>
                      <span>{asset?.icon}</span>
                      <span>{asset?.id}</span>
                    </Badge>
                  );
                })
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-gray-400 text-sm">Selected</span>
            <div className="text-2xl font-bold text-white mt-1">
              {selectedAssets.length}/{maxSelection}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {selectedAssets.length < maxSelection && (
        <p className="text-center text-gray-400 text-sm">
          Select {maxSelection - selectedAssets.length} more asset{maxSelection - selectedAssets.length !== 1 ? 's' : ''} to complete your portfolio
        </p>
      )}
    </div>
  );
}
