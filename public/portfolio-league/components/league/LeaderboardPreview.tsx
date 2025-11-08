'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';

interface LeaderboardEntry {
  rank: number;
  address: string;
  portfolio: string[];
  return: number;
  prize: number;
}

export function LeaderboardPreview() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Fetch leaderboard data
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();
        setLeaders(data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        // Mock data for demo
        setLeaders([
          { rank: 1, address: '0x1234...5678', portfolio: ['BTC', 'ETH', 'SOL'], return: 12.5, prize: 250 },
          { rank: 2, address: '0xabcd...efgh', portfolio: ['ETH', 'SOL', 'USDC'], return: 9.8, prize: 150 },
          { rank: 3, address: '0x9876...4321', portfolio: ['BTC', 'SOL', 'USDC'], return: 8.3, prize: 100 },
          { rank: 4, address: '0xdef0...1234', portfolio: ['ETH', 'BTC', 'USDC'], return: 6.7, prize: 75 },
          { rank: 5, address: '0x5555...9999', portfolio: ['BTC', 'ETH', 'USDC'], return: 5.2, prize: 50 },
        ]);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Leaderboard</h2>
        <a href="/leaderboard" className="text-base-blue hover:underline text-sm">
          View All →
        </a>
      </div>

      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr className="text-left text-sm text-gray-400">
              <th className="p-3">Rank</th>
              <th className="p-3">Player</th>
              <th className="p-3">Portfolio</th>
              <th className="p-3 text-right">Return</th>
              <th className="p-3 text-right">Prize</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((entry) => (
              <tr key={entry.rank} className="border-t border-gray-700/50 hover:bg-gray-700/20">
                <td className="p-3">
                  <span className="text-lg">{getRankBadge(entry.rank)}</span>
                </td>
                <td className="p-3">
                  <span className="font-mono text-sm">{entry.address}</span>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {entry.portfolio.map((asset) => (
                      <Badge key={asset} variant="default" className="text-xs">
                        {asset}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="p-3 text-right">
                  <span className={entry.return > 0 ? 'text-green-400' : 'text-red-400'}>
                    {entry.return > 0 ? '+' : ''}{entry.return.toFixed(2)}%
                  </span>
                </td>
                <td className="p-3 text-right">
                  <span className="text-green-400 font-semibold">{entry.prize} USDC</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-center text-gray-400 text-sm">
        <p>Top 10% (25 players) share the prize pool</p>
      </div>
    </section>
  );
}
