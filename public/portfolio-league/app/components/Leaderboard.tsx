'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { LeaderboardEntry } from '../types';
import { motion } from 'framer-motion';

interface LeaderboardProps {
  season: number;
}

export function Leaderboard({ season }: LeaderboardProps) {
  const { address } = useAccount();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    if (season) {
      fetchLeaderboard();
    }
  }, [season]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/league/${season}/leaderboard`);
      const data = await response.json();
      setEntries(data.entries);
      
      // Find user's rank
      if (address) {
        const userEntry = data.entries.find(
          (e: LeaderboardEntry) => e.userId.toLowerCase() === address.toLowerCase()
        );
        setUserRank(userEntry?.rank || null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getReturnColor = (returns: number) => {
    if (returns > 0) return 'text-success-green';
    if (returns < 0) return 'text-danger-red';
    return 'text-gray-400';
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-base-blue mx-auto mb-4" />
        <p className="text-gray-400">Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Position Card */}
      {userRank && (
        <div className="glass-card p-6 bg-gradient-to-r from-base-blue/10 to-success-green/10">
          <h3 className="text-lg font-semibold mb-2">Your Position</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-3xl font-bold">{getRankBadge(userRank)}</p>
              <p className="text-sm text-gray-400">
                Rank {userRank} of {entries.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Returns</p>
              <p className={`text-2xl font-bold ${getReturnColor(entries.find(e => e.rank === userRank)?.returns || 0)}`}>
                {entries.find(e => e.rank === userRank)?.returns.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold">Season #{season} Leaderboard</h3>
          <p className="text-sm text-gray-400 mt-1">
            Top {Math.ceil(entries.length * 0.1)} participants win prizes 🏆
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-base-gray">
              <tr className="text-left text-sm text-gray-400">
                <th className="p-4">Rank</th>
                <th className="p-4">Player</th>
                <th className="p-4">Portfolio</th>
                <th className="p-4 text-right">Returns</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <motion.tr
                  key={entry.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-t border-gray-700 hover:bg-gray-800/50 transition-colors ${
                    entry.userId.toLowerCase() === address?.toLowerCase()
                      ? 'bg-base-blue/5'
                      : ''
                  }`}
                >
                  <td className="p-4">
                    <span className="text-2xl font-bold">{getRankBadge(entry.rank)}</span>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-semibold">
                        {entry.username || formatAddress(entry.userId)}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        {formatAddress(entry.userId)}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {entry.portfolio.allocations.map((alloc, i) => (
                        <div
                          key={i}
                          className="px-2 py-1 bg-gray-700 rounded text-xs"
                        >
                          {alloc.asset} {alloc.percentage}%
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span
                      className={`text-lg font-bold ${getReturnColor(entry.returns)}`}
                    >
                      {entry.returns > 0 ? '+' : ''}
                      {entry.returns.toFixed(2)}%
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {entry.isWinner && (
                      <span className="inline-flex items-center px-3 py-1 bg-success-green/20 text-success-green text-sm font-semibold rounded-full">
                        🏆 Winner
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {entries.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            <p>No entries yet. Be the first to submit a portfolio!</p>
          </div>
        )}
      </div>
    </div>
  );
}
