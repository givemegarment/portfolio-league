'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { 
  TROPHY_CONTRACT_ADDRESS, 
  TROPHY_CONTRACT_ABI, 
  TROPHY_METADATA,
  TrophyType,
  getTrophyRarityColor,
  formatContractScore,
  type OnChainTrophy,
} from '@/lib/contracts/trophies';

type TrophyDisplay = {
  tokenId: number;
  trophyType: TrophyType;
  name: string;
  description: string;
  emoji: string;
  rarity: string;
  season: number;
  week: number;
  score: number;
  timestamp: Date;
};

function TrophyCard({ trophy, onClick }: { trophy: TrophyDisplay; onClick: () => void }) {
  const color = getTrophyRarityColor(trophy.trophyType);
  
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center gap-2 rounded-xl p-4 transition-all hover:scale-105"
      style={{ 
        backgroundColor: `${color}15`,
        border: `1px solid ${color}30`,
      }}
    >
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
        style={{ backgroundColor: color }}
      />
      
      {/* Content */}
      <div className="relative">
        <span className="text-4xl">{trophy.emoji}</span>
      </div>
      
      <div className="relative text-center">
        <div className="text-sm font-semibold text-white">{trophy.name}</div>
        <div className="text-xs text-white/50">
          S{trophy.season} W{trophy.week}
        </div>
      </div>

      {/* Rarity badge */}
      <span 
        className="absolute -top-1 -right-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
        style={{ backgroundColor: color, color: '#000' }}
      >
        {trophy.rarity}
      </span>
    </button>
  );
}

function TrophyModal({ 
  trophy, 
  onClose 
}: { 
  trophy: TrophyDisplay; 
  onClose: () => void;
}) {
  const color = getTrophyRarityColor(trophy.trophyType);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-surface-2 p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center">
          {/* Trophy icon */}
          <div 
            className="mb-4 flex h-24 w-24 items-center justify-center rounded-2xl text-6xl"
            style={{ 
              backgroundColor: `${color}20`,
              border: `2px solid ${color}`,
            }}
          >
            {trophy.emoji}
          </div>

          {/* Name and rarity */}
          <h3 className="text-xl font-bold text-white">{trophy.name}</h3>
          <span 
            className="mt-1 rounded-full px-3 py-0.5 text-xs font-semibold uppercase"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {trophy.rarity}
          </span>

          {/* Description */}
          <p className="mt-4 text-sm text-white/60">{trophy.description}</p>

          {/* Details */}
          <div className="mt-4 w-full space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Season</span>
              <span className="font-mono text-white">{trophy.season}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Week</span>
              <span className="font-mono text-white">{trophy.week}</span>
            </div>
            {trophy.score > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Score</span>
                <span className="font-mono text-accent-emerald">+{trophy.score.toFixed(2)}%</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Earned</span>
              <span className="text-white">{trophy.timestamp.toLocaleDateString()}</span>
            </div>
          </div>

          {/* On-chain badge */}
          <div className="mt-4 flex items-center gap-2 rounded-full bg-base-blue/10 px-3 py-1.5">
            <svg className="h-4 w-4 text-base-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs font-medium text-base-blue">Verified On-Chain</span>
          </div>

          {/* Token ID */}
          <div className="mt-2 text-xs text-white/30">
            Token ID: {trophy.tokenId}
          </div>
        </div>
      </div>
    </>
  );
}

export default function TrophyGallery() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  
  const [trophies, setTrophies] = useState<TrophyDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrophy, setSelectedTrophy] = useState<TrophyDisplay | null>(null);
  const [isContractDeployed, setIsContractDeployed] = useState(false);

  useEffect(() => {
    // Check if contract is deployed
    if (TROPHY_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      setIsContractDeployed(false);
      return;
    }
    setIsContractDeployed(true);
  }, []);

  useEffect(() => {
    if (!isConnected || !address || !publicClient || !isContractDeployed) {
      setTrophies([]);
      return;
    }

    const fetchTrophies = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get player's trophy token IDs
        const tokenIds = await publicClient.readContract({
          address: TROPHY_CONTRACT_ADDRESS,
          abi: TROPHY_CONTRACT_ABI,
          functionName: 'getPlayerTrophies',
          args: [address],
        }) as bigint[];

        if (!tokenIds || tokenIds.length === 0) {
          setTrophies([]);
          return;
        }

        // Fetch trophy data for each token
        const trophyPromises = tokenIds.map(async (tokenId) => {
          const trophy = await publicClient.readContract({
            address: TROPHY_CONTRACT_ADDRESS,
            abi: TROPHY_CONTRACT_ABI,
            functionName: 'getTrophy',
            args: [tokenId],
          }) as OnChainTrophy;

          const metadata = TROPHY_METADATA[trophy.trophyType as TrophyType];

          return {
            tokenId: Number(tokenId),
            trophyType: trophy.trophyType as TrophyType,
            name: metadata?.name || 'Unknown Trophy',
            description: metadata?.description || '',
            emoji: metadata?.emoji || '🏆',
            rarity: metadata?.rarity || 'common',
            season: Number(trophy.season),
            week: Number(trophy.week),
            score: formatContractScore(trophy.score),
            timestamp: new Date(Number(trophy.timestamp) * 1000),
          };
        });

        const fetchedTrophies = await Promise.all(trophyPromises);
        setTrophies(fetchedTrophies);
      } catch (err) {
        console.error('Error fetching trophies:', err);
        setError('Failed to load trophies');
      } finally {
        setLoading(false);
      }
    };

    fetchTrophies();
  }, [address, isConnected, publicClient, isContractDeployed]);

  // Not connected state
  if (!isConnected) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
        <div className="text-4xl mb-3">🏆</div>
        <p className="text-white/60">Connect wallet to view your trophies</p>
      </div>
    );
  }

  // Contract not deployed state
  if (!isContractDeployed) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
        <div className="text-4xl mb-3">🚧</div>
        <p className="text-white/60">Trophy system coming soon!</p>
        <p className="text-xs text-white/40 mt-2">On-chain trophies will be minted to winners</p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div className="flex items-center justify-center gap-3">
          <svg className="h-5 w-5 animate-spin text-base-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-white/60">Loading trophies...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-2xl border border-accent-rose/20 bg-accent-rose/5 p-6 text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="text-accent-rose">{error}</p>
      </div>
    );
  }

  // Empty state
  if (trophies.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
        <div className="text-4xl mb-3">🏆</div>
        <p className="text-white/60">No trophies yet</p>
        <p className="text-xs text-white/40 mt-2">Win competitions to earn on-chain trophies!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">On-Chain Trophies</h3>
          <span className="text-xs text-white/40">{trophies.length} earned</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {trophies.map((trophy) => (
            <TrophyCard
              key={trophy.tokenId}
              trophy={trophy}
              onClick={() => setSelectedTrophy(trophy)}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedTrophy && (
        <TrophyModal
          trophy={selectedTrophy}
          onClose={() => setSelectedTrophy(null)}
        />
      )}
    </>
  );
}







