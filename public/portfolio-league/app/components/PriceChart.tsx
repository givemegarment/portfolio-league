'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Asset, PriceData } from '../types';

export function PriceChart() {
  const [selectedAsset, setSelectedAsset] = useState<Asset>('BTC');
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState<PriceData | null>(null);

  useEffect(() => {
    fetchPriceData();
    const interval = setInterval(fetchPriceData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [selectedAsset]);

  const fetchPriceData = async () => {
    try {
      const [currentRes, historyRes] = await Promise.all([
        fetch(`/api/prices/${selectedAsset}`),
        fetch(`/api/prices/${selectedAsset}/history?period=7d`),
      ]);
      
      const current = await currentRes.json();
      const history = await historyRes.json();
      
      setCurrentPrice(current);
      setPriceHistory(history);
    } catch (error) {
      console.error('Error fetching price data:', error);
    }
  };

  const assets: Array<{ value: Asset; label: string; icon: string }> = [
    { value: 'BTC', label: 'Bitcoin', icon: '₿' },
    { value: 'ETH', label: 'Ethereum', icon: 'Ξ' },
    { value: 'SOL', label: 'Solana', icon: '◎' },
    { value: 'USDC_YIELD', label: 'USDC Yield', icon: '$' },
  ];

  const formatPrice = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold mb-4">Asset Prices</h3>

      {/* Asset Selector */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {assets.map(asset => (
          <button
            key={asset.value}
            onClick={() => setSelectedAsset(asset.value)}
            className={`p-3 rounded-lg border transition-all ${
              selectedAsset === asset.value
                ? 'bg-base-blue border-base-blue'
                : 'border-gray-700 hover:border-gray-500 bg-base-gray'
            }`}
          >
            <div className="text-2xl mb-1">{asset.icon}</div>
            <div className="text-xs font-semibold">{asset.label}</div>
          </button>
        ))}
      </div>

      {/* Current Price */}
      {currentPrice && (
        <div className="mb-6 p-4 bg-base-gray rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Current Price</p>
          <p className="text-3xl font-bold">
            {selectedAsset === 'USDC_YIELD' 
              ? `${currentPrice.price.toFixed(2)}% APY`
              : `$${currentPrice.price.toLocaleString()}`
            }
          </p>
          <p className={`text-sm mt-1 ${currentPrice.change24h >= 0 ? 'text-success-green' : 'text-danger-red'}`}>
            {currentPrice.change24h >= 0 ? '+' : ''}
            {currentPrice.change24h.toFixed(2)}% (24h)
          </p>
        </div>
      )}

      {/* Price Chart */}
      {priceHistory.length > 0 && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="timestamp" 
                stroke="#666"
                tick={{ fill: '#999', fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="#666"
                tick={{ fill: '#999', fontSize: 12 }}
                tickFormatter={formatPrice}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E1F21',
                  border: '1px solid #333',
                  borderRadius: '8px',
                }}
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: number) => [
                  selectedAsset === 'USDC_YIELD' 
                    ? `${value.toFixed(2)}% APY`
                    : `$${value.toLocaleString()}`,
                  'Price'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#0052FF" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-base-gray rounded-lg">
        <p className="text-xs text-gray-400">
          📊 Prices updated via Chainlink oracles every 30 seconds
        </p>
      </div>
    </div>
  );
}
