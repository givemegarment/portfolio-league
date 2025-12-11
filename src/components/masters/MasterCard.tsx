'use client';

import { Master } from '@/app/types';
import { Badge } from '@/components/ui/Badge';

interface MasterCardProps {
  master: Master;
  isSelected?: boolean;
  onSelect?: (master: Master) => void;
  showDetails?: boolean;
}

export function MasterCard({ master, isSelected, onSelect, showDetails = false }: MasterCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'defi':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'nft':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'yield':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'momentum':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'conservative':
        return 'text-green-400';
      case 'moderate':
        return 'text-yellow-400';
      case 'aggressive':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div
      onClick={() => onSelect?.(master)}
      className={`
        relative p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer
        ${isSelected
          ? 'border-amber-500 bg-amber-500/10 scale-[1.02] shadow-lg shadow-amber-500/20'
          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70'
        }
      `}
    >
      {/* Verified Badge */}
      {master.verified && (
        <div className="absolute top-3 right-3">
          <span className="text-amber-400 text-sm" title="Verified Master">
            ✓
          </span>
        </div>
      )}

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-3 left-3 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
          <span className="text-black text-sm font-bold">★</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          {master.alias ? (
            <h3 className="font-semibold text-white">{master.alias}</h3>
          ) : (
            <h3 className="font-mono text-sm text-gray-300">{formatAddress(master.address)}</h3>
          )}
        </div>
        {master.alias && (
          <p className="font-mono text-xs text-gray-500">{formatAddress(master.address)}</p>
        )}
      </div>

      {/* Category & Risk */}
      <div className="flex gap-2 mb-4">
        <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(master.category)}`}>
          {master.category.toUpperCase()}
        </span>
        <span className={`text-xs ${getRiskColor(master.riskProfile)}`}>
          {master.riskProfile}
        </span>
      </div>

      {/* Performance */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-gray-500">30d Return</p>
          <p className={`text-lg font-bold ${master.performance30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {master.performance30d >= 0 ? '+' : ''}{master.performance30d.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">7d Return</p>
          <p className={`text-lg font-bold ${master.performance7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {master.performance7d >= 0 ? '+' : ''}{master.performance7d.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Current Holdings */}
      {showDetails && master.currentHoldings && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Current Strategy</p>
          <div className="flex gap-1 flex-wrap">
            {master.currentHoldings.map((holding) => (
              <Badge key={holding.asset} variant="default" className="text-xs">
                {holding.asset} {holding.percentage}%
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Followers */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-700">
        <span className="text-xs text-gray-500">Scholars studying</span>
        <span className="text-sm font-semibold text-white">{master.followers}</span>
      </div>
    </div>
  );
}
