'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Player = {
  rank: number;
  user: string;
  score: number;
  allocations: Array<{ symbol: string; percentage: number }>;
};

export default function PlayerTable() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('/api/leaderboard?limit=100');
        if (response.ok) {
          const data = await response.json();
          setPlayers(data);
        }
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const filteredPlayers = players.filter(player => {
    if (!searchQuery) return true;
    return player.user.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-surface-2 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <div className="h-6 w-32 rounded shimmer" />
        </div>
        <div className="p-6 space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 rounded shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-2 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Players</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/50">
              {filteredPlayers.length} players
            </span>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 rounded-lg bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 border border-white/10 focus:outline-none focus:border-base-blue"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs font-medium uppercase tracking-wider text-white/40">
              <th className="px-6 py-4">Rank</th>
              <th className="px-6 py-4">Address</th>
              <th className="px-6 py-4">Return</th>
              <th className="px-6 py-4">Portfolio</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-white/50">
                  {searchQuery ? 'No players found' : 'No players yet'}
                </td>
              </tr>
            ) : (
              filteredPlayers.map((player) => (
                <tr
                  key={player.user}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className={`
                      inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold
                      ${player.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black' : 
                        player.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-black' :
                        player.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                        'bg-white/10 text-white/60'}
                    `}>
                      {player.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-white">
                      {player.user.slice(0, 6)}...{player.user.slice(-4)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-mono font-bold ${player.score >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                      {player.score >= 0 ? '+' : ''}{player.score.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {player.allocations?.slice(0, 3).map((a, i) => (
                        <span
                          key={i}
                          className="rounded bg-white/10 px-2 py-0.5 text-xs font-mono text-white/70"
                        >
                          {a.symbol}
                        </span>
                      ))}
                      {player.allocations?.length > 3 && (
                        <span className="text-xs text-white/40">
                          +{player.allocations.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/profile/${player.user}`}
                      className="text-sm text-base-blue hover:text-base-blue-light transition-colors"
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

