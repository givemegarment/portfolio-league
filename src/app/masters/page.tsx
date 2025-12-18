'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/chrome/Nav';
import MasterCard from '@/components/masters/MasterCard';
import MasterFilters, { FilterState } from '@/components/masters/MasterFilters';
import { Master, sortMastersByPerformance } from '@/lib/masters';
import { NarrativeType } from '@/lib/narratives';

export default function MastersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({
    narrative: 'all',
    tier: 'all',
    sortBy: 'return7D',
    search: '',
  });
  const [allMasters, setAllMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch masters from API
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.narrative !== 'all') {
          params.set('narrative', filters.narrative);
        }
        if (filters.tier !== 'all') {
          params.set('tier', filters.tier);
        }
        params.set('sortBy', filters.sortBy);
        params.set('limit', '100');

        const response = await fetch(`/api/masters?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch masters');
        }
        const data = await response.json();
        setAllMasters(data.masters || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching masters:', err);
        setError('Failed to load masters. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMasters();
  }, [filters.narrative, filters.tier, filters.sortBy]);

  // Apply filters
  const filteredMasters = useMemo(() => {
    let result = [...allMasters];

    // Filter by narrative
    if (filters.narrative !== 'all') {
      result = result.filter((m) =>
        m.narratives.includes(filters.narrative as NarrativeType)
      );
    }

    // Filter by tier
    if (filters.tier !== 'all') {
      result = result.filter((m) => m.tier === filters.tier);
    }

    // Filter by search
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(search) ||
          m.description?.toLowerCase().includes(search) ||
          m.tags.some((t) => t.toLowerCase().includes(search))
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'return7D':
        result = sortMastersByPerformance(result, 'return7D');
        break;
      case 'return30D':
        result = sortMastersByPerformance(result, 'return30D');
        break;
      case 'followers':
        result = result.sort((a, b) => b.followerCount - a.followerCount);
        break;
      case 'emulators':
        result = result.sort((a, b) => b.emulatorCount - a.emulatorCount);
        break;
    }

    return result;
  }, [allMasters, filters]);

  const handleMasterClick = (master: Master) => {
    router.push(`/masters/${master.address}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-48 rounded-2xl bg-white/5" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-white/5" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <div className="rounded-2xl border border-white/5 bg-surface-2 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-white">Error Loading Masters</h3>
            <p className="mt-2 text-sm text-white/60">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-base-blue/10 px-4 py-2">
            <span className="text-lg">👑</span>
            <span className="text-sm font-medium text-base-blue">
              Discover Masters
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Learn from the Best
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/60">
            Study high-performing wallets and their strategies. Emulate their
            approach and compete to see if you can improve upon their methods.
          </p>
        </div>

        {/* Stats overview */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Active Masters"
            value={allMasters.length.toString()}
            icon="👑"
          />
          <StatCard
            label="Total Followers"
            value={allMasters
              .reduce((sum, m) => sum + m.followerCount, 0)
              .toLocaleString()}
            icon="👥"
          />
          <StatCard
            label="Emulations Today"
            value={allMasters
              .reduce((sum, m) => sum + m.emulatorCount, 0)
              .toLocaleString()}
            icon="📋"
          />
          <StatCard
            label="Avg. 7D Return"
            value={`${(
              allMasters.reduce((sum, m) => sum + m.performance.return7D, 0) /
              allMasters.length
            ).toFixed(1)}%`}
            icon="📈"
          />
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-white/5 bg-surface-2 p-6">
          <MasterFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Results count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-white/40">
            Showing {filteredMasters.length} master
            {filteredMasters.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Masters grid */}
        {filteredMasters.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMasters.map((master) => (
              <MasterCard
                key={master.address}
                master={master}
                onClick={() => handleMasterClick(master)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-surface-2 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">
              🔍
            </div>
            <h3 className="text-lg font-bold text-white">No masters found</h3>
            <p className="mt-2 text-sm text-white/60">
              Try adjusting your filters to see more results
            </p>
            <button
              onClick={() =>
                setFilters({
                  narrative: 'all',
                  tier: 'all',
                  sortBy: 'return7D',
                  search: '',
                })
              }
              className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-base-blue/20 bg-gradient-to-br from-base-blue/10 to-purple-600/10 p-8 text-center">
          <h2 className="text-2xl font-bold text-white">
            Ready to Emulate a Master?
          </h2>
          <p className="mt-2 text-white/60">
            Select a master above to study their strategy and create your own
            adaptation
          </p>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-surface-2 p-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-white/40">{label}</span>
      </div>
      <div className="mt-2 text-xl font-bold text-white">{value}</div>
    </div>
  );
}




