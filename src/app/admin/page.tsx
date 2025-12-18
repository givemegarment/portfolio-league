'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import StatsOverview from '@/components/admin/StatsOverview';
import PlayerTable from '@/components/admin/PlayerTable';
import { type AdminStats, type PrizePoolConfig } from '@/lib/admin';

export default function AdminDashboard() {
  const { address } = useAccount();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [prizePool, setPrizePool] = useState<PrizePoolConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingPrizePool, setEditingPrizePool] = useState(false);
  const [newPrizePool, setNewPrizePool] = useState<number>(1000);
  const [savingPrizePool, setSavingPrizePool] = useState(false);

  useEffect(() => {
    if (!address) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch stats
        const statsRes = await fetch('/api/admin/stats', {
          headers: { 'x-admin-address': address },
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch prize pool
        const prizeRes = await fetch('/api/admin/prize-pool', {
          headers: { 'x-admin-address': address },
        });
        if (prizeRes.ok) {
          const prizeData = await prizeRes.json();
          setPrizePool(prizeData);
          setNewPrizePool(prizeData.total);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address]);

  const handleSavePrizePool = async () => {
    if (!address) return;
    
    setSavingPrizePool(true);
    try {
      const response = await fetch('/api/admin/prize-pool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-address': address,
        },
        body: JSON.stringify({
          total: newPrizePool,
          distribution: prizePool?.distribution,
          currency: prizePool?.currency || 'USD',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPrizePool(data.config);
        setEditingPrizePool(false);
      }
    } catch (error) {
      console.error('Error saving prize pool:', error);
    } finally {
      setSavingPrizePool(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-white/50">
          Monitor Portfolio League activity and manage settings
        </p>
      </div>

      {/* Stats Overview */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Overview</h2>
        <StatsOverview stats={stats} loading={loading} />
      </section>

      {/* Prize Pool Management */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Prize Pool Management</h2>
        <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-white/50">Current Prize Pool</p>
              <p className="text-3xl font-bold text-accent-amber">
                ${prizePool?.total.toLocaleString() || 1000}
              </p>
            </div>
            {!editingPrizePool ? (
              <button
                onClick={() => setEditingPrizePool(true)}
                className="rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
              >
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={newPrizePool}
                  onChange={(e) => setNewPrizePool(parseInt(e.target.value) || 0)}
                  className="w-32 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-base-blue"
                />
                <button
                  onClick={handleSavePrizePool}
                  disabled={savingPrizePool}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  {savingPrizePool ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditingPrizePool(false);
                    setNewPrizePool(prizePool?.total || 1000);
                  }}
                  className="rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-white/60 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Distribution */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl bg-white/5 p-4 text-center">
              <div className="text-2xl mb-1">🥇</div>
              <p className="text-xl font-bold text-white">${prizePool?.distribution.first || 500}</p>
              <p className="text-xs text-white/50">1st Place</p>
            </div>
            <div className="rounded-xl bg-white/5 p-4 text-center">
              <div className="text-2xl mb-1">🥈</div>
              <p className="text-xl font-bold text-white">${prizePool?.distribution.second || 250}</p>
              <p className="text-xs text-white/50">2nd Place</p>
            </div>
            <div className="rounded-xl bg-white/5 p-4 text-center">
              <div className="text-2xl mb-1">🥉</div>
              <p className="text-xl font-bold text-white">${prizePool?.distribution.third || 150}</p>
              <p className="text-xs text-white/50">3rd Place</p>
            </div>
            <div className="rounded-xl bg-white/5 p-4 text-center">
              <div className="text-2xl mb-1">🏆</div>
              <p className="text-xl font-bold text-white">${prizePool?.distribution.topTen || 100}</p>
              <p className="text-xs text-white/50">Top 10 Pool</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <button className="rounded-2xl border border-white/5 bg-surface-2 p-6 text-left hover:bg-surface-3 transition-colors group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-base-blue/20 mb-4 group-hover:bg-base-blue/30 transition-colors">
              <svg className="h-6 w-6 text-base-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-1">Send Weekly Digest</h3>
            <p className="text-sm text-white/50">Trigger email digest for all subscribers</p>
          </button>

          <button className="rounded-2xl border border-white/5 bg-surface-2 p-6 text-left hover:bg-surface-3 transition-colors group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-emerald/20 mb-4 group-hover:bg-accent-emerald/30 transition-colors">
              <svg className="h-6 w-6 text-accent-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-1">Refresh Prices</h3>
            <p className="text-sm text-white/50">Force refresh all asset prices</p>
          </button>

          <button className="rounded-2xl border border-white/5 bg-surface-2 p-6 text-left hover:bg-surface-3 transition-colors group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 mb-4 group-hover:bg-purple-500/30 transition-colors">
              <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-1">Export Data</h3>
            <p className="text-sm text-white/50">Download leaderboard and stats as CSV</p>
          </button>
        </div>
      </section>

      {/* Player Table */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">All Players</h2>
        <PlayerTable />
      </section>
    </main>
  );
}






