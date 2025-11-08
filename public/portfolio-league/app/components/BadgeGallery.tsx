'use client';

import { useEffect, useState } from 'react';
import { SeasonBadge } from '../types';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface BadgeGalleryProps {
  userAddress: string | undefined;
}

export function BadgeGallery({ userAddress }: BadgeGalleryProps) {
  const [badges, setBadges] = useState<SeasonBadge[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userAddress) {
      fetchBadges();
      fetchStats();
    }
  }, [userAddress]);

  const fetchBadges = async () => {
    try {
      const response = await fetch(`/api/badges/${userAddress}`);
      const data = await response.json();
      setBadges(data.badges);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/user/${userAddress}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '🏆';
    return '🎖️';
  };

  if (isLoading) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-base-blue mx-auto mb-4" />
        <p className="text-gray-400">Loading your badges...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-6">
            <p className="text-sm text-gray-400 mb-1">Total Seasons</p>
            <p className="text-3xl font-bold">{stats.totalSeasons}</p>
          </div>
          <div className="glass-card p-6">
            <p className="text-sm text-gray-400 mb-1">Wins</p>
            <p className="text-3xl font-bold text-success-green">{stats.wins}</p>
          </div>
          <div className="glass-card p-6">
            <p className="text-sm text-gray-400 mb-1">Top 10% Finishes</p>
            <p className="text-3xl font-bold text-base-blue">{stats.topDecileFinishes}</p>
          </div>
          <div className="glass-card p-6">
            <p className="text-sm text-gray-400 mb-1">Best Rank</p>
            <p className="text-3xl font-bold">{stats.bestRank ? `#${stats.bestRank}` : 'N/A'}</p>
          </div>
        </div>
      )}

      {/* Performance Stats */}
      {stats && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-4">Performance History</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-2">Best Returns</p>
              <p className="text-2xl font-bold text-success-green">
                +{stats.bestReturns.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Average Returns</p>
              <p className="text-2xl font-bold">
                {stats.averageReturns > 0 ? '+' : ''}
                {stats.averageReturns.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Badge Gallery */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold mb-6">Season Badges</h3>
        
        {badges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map((badge, index) => (
              <motion.div
                key={badge.tokenId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="gradient-border"
              >
                <div className="gradient-border-inner p-6">
                  {/* Badge Image */}
                  <div className="aspect-square bg-gradient-to-br from-base-blue to-success-green rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-2">{getRankBadge(badge.rank)}</div>
                      <p className="text-sm font-semibold">Season #{badge.season}</p>
                    </div>
                  </div>

                  {/* Badge Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Rank</span>
                      <span className="font-semibold">#{badge.rank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Returns</span>
                      <span className={`font-semibold ${badge.returns > 0 ? 'text-success-green' : 'text-danger-red'}`}>
                        {badge.returns > 0 ? '+' : ''}
                        {badge.returns.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Minted</span>
                      <span className="text-sm">
                        {format(new Date(badge.mintedAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>

                  {/* Attributes */}
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex flex-wrap gap-2">
                      {badge.metadata.attributes.map((attr, i) => (
                        <div
                          key={i}
                          className="px-2 py-1 bg-gray-700/50 rounded text-xs"
                        >
                          {attr.trait_type}: {attr.value}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* View on OpenSea */}
                  <button
                    onClick={() => window.open(`https://opensea.io/assets/base/${badge.tokenId}`, '_blank')}
                    className="mt-4 w-full px-4 py-2 bg-base-blue/20 hover:bg-base-blue/30 text-base-blue text-sm font-semibold rounded-lg transition-colors"
                  >
                    View on OpenSea
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏅</div>
            <h4 className="text-xl font-semibold mb-2">No Badges Yet</h4>
            <p className="text-gray-400">
              Complete a season to earn your first badge NFT!
            </p>
          </div>
        )}
      </div>

      {/* Mint New Badge */}
      {stats?.totalSeasons > badges.length && (
        <div className="glass-card p-6 bg-success-green/10 border border-success-green/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold mb-1">🎉 New Badge Available!</h4>
              <p className="text-sm text-gray-400">
                You have {stats.totalSeasons - badges.length} badge(s) ready to mint
              </p>
            </div>
            <button className="px-6 py-2 bg-success-green hover:bg-green-600 text-white font-semibold rounded-lg transition-colors">
              Mint Badge
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
