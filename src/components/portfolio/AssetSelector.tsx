'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { 
  SUPPORTED_ASSETS, 
  ASSET_CATEGORIES, 
  searchAssets,
  type Asset,
  type AssetCategory 
} from '@/lib/assets';

type PriceData = {
  price: number;
  change24h: number;
};

type Props = {
  selectedAssets: string[];
  onToggleAsset: (symbol: string) => void;
  maxAssets?: number;
  disabled?: boolean;
  prices?: Record<string, PriceData>;
  pricesLoading?: boolean;
};

const categoryNames = Object.keys(ASSET_CATEGORIES) as AssetCategory[];

export default function AssetSelector({
  selectedAssets,
  onToggleAsset,
  maxAssets = 3,
  disabled = false,
  prices = {},
  pricesLoading = false,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<AssetCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter assets based on search or category
  const filteredAssets = useMemo(() => {
    if (searchQuery.trim()) {
      return searchAssets(searchQuery);
    }
    
    const categorySymbols = ASSET_CATEGORIES[activeCategory] as readonly string[];
    return SUPPORTED_ASSETS.filter(a => categorySymbols.includes(a.symbol));
  }, [searchQuery, activeCategory]);

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return '—';
    if (price >= 1000) return `$${(price / 1000).toFixed(1)}k`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(6)}`;
  };

  const formatChange = (change: number | undefined) => {
    if (change === undefined || change === null) return '';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <svg 
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
        <input
          type="text"
          placeholder="Search tokens..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={disabled}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:border-base-blue focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categoryNames.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setSearchQuery('');
            }}
            disabled={disabled}
            className={`
              whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all
              ${activeCategory === cat && !searchQuery
                ? 'bg-base-blue text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Selection Info */}
      <div className="flex items-center justify-between text-xs text-white/40">
        <span>
          {selectedAssets.length} of {maxAssets} selected
        </span>
        {searchQuery && (
          <span>{filteredAssets.length} results</span>
        )}
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filteredAssets.map((asset) => {
          const isSelected = selectedAssets.includes(asset.symbol);
          const isDisabled = disabled || (!isSelected && selectedAssets.length >= maxAssets);
          const priceData = prices[asset.symbol];
          const isPositive = priceData && priceData.change24h >= 0;

          return (
            <button
              key={asset.symbol}
              onClick={() => onToggleAsset(asset.symbol)}
              disabled={isDisabled}
              className={`
                group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300
                ${isSelected
                  ? 'border-base-blue/50 bg-base-blue/10'
                  : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/5'
                }
                ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute right-2 top-2">
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
                <div 
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${asset.color}20` }}
                >
                  <Image
                    src={asset.logo}
                    alt={asset.name}
                    width={28}
                    height={28}
                    className="rounded-full"
                    onError={(e) => {
                      // Fallback to colored circle with symbol
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="space-y-1">
                <div className="font-mono text-base font-bold text-white">{asset.symbol}</div>
                <div className="text-xs text-white/40 truncate">{asset.name}</div>
              </div>

              {/* Price */}
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
                ) : (
                  <div className="text-xs text-white/30">—</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* No Results */}
      {filteredAssets.length === 0 && (
        <div className="py-8 text-center">
          <svg className="mx-auto h-12 w-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-2 text-sm text-white/40">No tokens found</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('All');
            }}
            className="mt-2 text-xs text-base-blue hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}




