'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { Wallet } from '@coinbase/onchainkit/wallet';
import { PortfolioBuilder } from '@/components/portfolio/PortfolioBuilder';
import { LeaderboardPreview } from '@/components/league/LeaderboardPreview';
import { SeasonInfo } from '@/components/league/SeasonInfo';
import { Badge } from '@/components/ui/Badge';

const ASSETS = [
  { id: 'BTC', name: 'Bitcoin', icon: '₿', color: 'text-orange-500' },
  { id: 'ETH', name: 'Ethereum', icon: 'Ξ', color: 'text-blue-500' },
  { id: 'SOL', name: 'Solana', icon: '◎', color: 'text-purple-500' },
  { id: 'USDC', name: 'USDC Yield', icon: '$', color: 'text-green-500' },
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const { context } = useMiniKit();
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState('6d 23h 45m');

  useEffect(() => {
    // Fetch current season info
    const fetchSeasonInfo = async () => {
      try {
        const response = await fetch('/api/league/current');
        const data = await response.json();
        setCurrentWeek(data.week);
      } catch (error) {
        console.error('Error fetching season info:', error);
      }
    };

    fetchSeasonInfo();
  }, []);

  const handleAssetToggle = (assetId: string) => {
    if (selectedAssets.includes(assetId)) {
      setSelectedAssets(selectedAssets.filter(id => id !== assetId));
    } else if (selectedAssets.length < 3) {
      setSelectedAssets([...selectedAssets, assetId]);
    }
  };

  const handleSubmitPortfolio = async () => {
    if (selectedAssets.length !== 3 || !address) return;

    try {
      const response = await fetch('/api/portfolio/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          assets: selectedAssets,
          week: currentWeek,
        }),
      });

      if (response.ok) {
        alert('Portfolio submitted successfully!');
        // Share on Farcaster
        shareToFarcaster();
      }
    } catch (error) {
      console.error('Error submitting portfolio:', error);
    }
  };

  const shareToFarcaster = () => {
    const text = `Just locked in my Week ${currentWeek} portfolio! ${selectedAssets.map(a => ASSETS.find(asset => asset.id === a)?.icon).join(' ')} Let's see who's top decile! 🏆`;
    
    // Use MiniKit to compose cast
    if (context) {
      // This would use the composeCast function from MiniKit
      console.log('Sharing to Farcaster:', text);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-base-dark to-gray-900 text-white p-4">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 pt-4">
        <div>
          <h1 className="text-3xl font-bold text-base-blue">Portfolio League</h1>
          <p className="text-gray-400 text-sm">Week {currentWeek} • Season 1</p>
        </div>
        <Wallet>
          <Badge variant="success" className="px-4 py-2">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect'}
          </Badge>
        </Wallet>
      </header>

      {/* Season Timer */}
      <SeasonInfo week={currentWeek} timeRemaining={timeRemaining} />

      {/* Portfolio Builder */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Pick Your 3-Asset Portfolio</h2>
        <p className="text-gray-400 mb-6">
          Select 3 assets for this week's competition. Top 10% split the prize pool!
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {ASSETS.map((asset) => (
            <button
              key={asset.id}
              onClick={() => handleAssetToggle(asset.id)}
              className={`
                p-6 rounded-xl border-2 transition-all duration-200
                ${selectedAssets.includes(asset.id)
                  ? 'border-base-blue bg-base-blue/10 scale-105'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }
                ${selectedAssets.length >= 3 && !selectedAssets.includes(asset.id)
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
                }
              `}
              disabled={selectedAssets.length >= 3 && !selectedAssets.includes(asset.id)}
            >
              <div className="text-center">
                <div className={`text-4xl mb-2 ${asset.color}`}>{asset.icon}</div>
                <div className="font-semibold">{asset.name}</div>
                <div className="text-sm text-gray-400">{asset.id}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Assets Display */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Your Selection:</span>
            <div className="flex gap-2">
              {selectedAssets.length === 0 ? (
                <span className="text-gray-500">No assets selected</span>
              ) : (
                selectedAssets.map((id) => {
                  const asset = ASSETS.find(a => a.id === id);
                  return (
                    <Badge key={id} variant="default" className={asset?.color}>
                      {asset?.icon} {asset?.id}
                    </Badge>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmitPortfolio}
          disabled={selectedAssets.length !== 3 || !isConnected}
          className={`
            w-full py-4 rounded-xl font-semibold text-lg transition-all
            ${selectedAssets.length === 3 && isConnected
              ? 'bg-base-blue hover:bg-blue-600 cursor-pointer'
              : 'bg-gray-700 cursor-not-allowed opacity-50'
            }
          `}
        >
          {!isConnected
            ? 'Connect Wallet to Submit'
            : selectedAssets.length !== 3
            ? `Select ${3 - selectedAssets.length} More Asset${3 - selectedAssets.length !== 1 ? 's' : ''}`
            : 'Lock In Portfolio 🔒'
          }
        </button>
      </section>

      {/* Leaderboard Preview */}
      <LeaderboardPreview />

      {/* Info Section */}
      <section className="mt-8 p-6 bg-gray-800/30 rounded-xl border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">How It Works</h3>
        <ul className="space-y-3 text-gray-300">
          <li className="flex items-start">
            <span className="text-base-blue mr-2">•</span>
            <span>Pick 3 assets from BTC, ETH, SOL, or USDC yield each week</span>
          </li>
          <li className="flex items-start">
            <span className="text-base-blue mr-2">•</span>
            <span>Performance tracked on-chain via Chainlink oracles</span>
          </li>
          <li className="flex items-start">
            <span className="text-base-blue mr-2">•</span>
            <span>Top 10% of performers split the weekly prize pool</span>
          </li>
          <li className="flex items-start">
            <span className="text-base-blue mr-2">•</span>
            <span>Everyone mints a season badge NFT at the end</span>
          </li>
          <li className="flex items-start">
            <span className="text-base-blue mr-2">•</span>
            <span>v1: Paper portfolio with USDC prizes • v2: Real pooled vault</span>
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-500 text-sm pb-8">
        <p>Built on Base with MiniKit</p>
        <p className="mt-1">Portfolio League • Season 1</p>
      </footer>
    </main>
  );
}
