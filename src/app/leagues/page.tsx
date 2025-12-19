'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import Nav from '@/components/chrome/Nav';
import {
  League,
  LeagueType,
  getLeagueTypeConfig,
  getRiskTierConfig,
  formatTimeRemaining,
} from '@/lib/competitions';

export default function LeaguesPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [selectedType, setSelectedType] = useState<LeagueType | 'all'>('all');
  const [allLeagues, setAllLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joiningLeagueId, setJoiningLeagueId] = useState<string | null>(null);
  
  // Fetch leagues from API
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedType !== 'all') {
          params.set('type', selectedType);
        }
        params.set('active', 'true');

        const response = await fetch(`/api/leagues?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch leagues');
        }
        const data = await response.json();
        setAllLeagues(data.leagues || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching leagues:', err);
        setError('Failed to load leagues. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, [selectedType]);
  
  // Filter leagues
  const filteredLeagues = useMemo(() => {
    if (selectedType === 'all') return allLeagues;
    return allLeagues.filter((l) => l.type === selectedType);
  }, [allLeagues, selectedType]);

  const handleJoinLeague = async (league: League) => {
    if (!address || !isConnected) {
      alert('Please connect your wallet to join a league');
      return;
    }

    try {
      setJoiningLeagueId(league.id);
      
      // For invite leagues, prompt for invite code
      let inviteCode: string | undefined;
      if (league.type === 'invite') {
        inviteCode = prompt('Enter invite code:');
        if (!inviteCode) {
          setJoiningLeagueId(null);
          return;
        }
      }

      const response = await fetch(`/api/leagues/${league.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, inviteCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join league');
      }

      const data = await response.json();
      alert(data.message || 'Successfully joined league!');
      
      // Refresh leagues list
      window.location.reload();
    } catch (err: any) {
      console.error('Error joining league:', err);
      alert(err.message || 'Failed to join league');
    } finally {
      setJoiningLeagueId(null);
    }
  };

  const handleCreateLeague = async (formData: {
    name: string;
    type: LeagueType;
    description: string;
    competitionType: string;
  }) => {
    if (!address || !isConnected) {
      alert('Please connect your wallet to create a league');
      return;
    }

    try {
      const response = await fetch('/api/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          createdBy: address,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create league');
      }

      const data = await response.json();
      alert('League created successfully!');
      setShowCreateModal(false);
      
      // Refresh leagues list
      window.location.reload();
    } catch (err: any) {
      console.error('Error creating league:', err);
      alert(err.message || 'Failed to create league');
    }
  };

  const featuredLeagues = allLeagues.filter((l) => l.isFeatured);
  const activeLeagues = allLeagues.filter((l) => l.isActive);

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
            <h3 className="text-lg font-bold text-white">Error Loading Leagues</h3>
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
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent-emerald/10 px-4 py-2">
            <span className="text-lg">🏆</span>
            <span className="text-sm font-medium text-accent-emerald">
              Competitive Leagues
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Join a League
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/60">
            Compete in specialized leagues based on narratives, risk levels, or
            specific Masters. Find your community and climb the ranks.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Active Leagues"
            value={activeLeagues.length.toString()}
            icon="🏆"
          />
          <StatCard
            label="Total Players"
            value={allLeagues
              .reduce((sum, l) => sum + l.playerCount, 0)
              .toLocaleString()}
            icon="👥"
          />
          <StatCard
            label="Total Prize Pool"
            value={`$${allLeagues
              .reduce((sum, l) => sum + l.prizePool, 0)
              .toLocaleString()}`}
            icon="💰"
          />
          <StatCard
            label="Featured Leagues"
            value={featuredLeagues.length.toString()}
            icon="⭐"
          />
        </div>

        {/* Featured Leagues */}
        {featuredLeagues.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-bold text-white">
              Featured Leagues
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {featuredLeagues.map((league) => (
                <LeagueCard key={league.id} league={league} featured />
              ))}
            </div>
          </section>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          <FilterButton
            active={selectedType === 'all'}
            onClick={() => setSelectedType('all')}
          >
            All Leagues
          </FilterButton>
          <FilterButton
            active={selectedType === 'open'}
            onClick={() => setSelectedType('open')}
          >
            🌐 Open
          </FilterButton>
          <FilterButton
            active={selectedType === 'narrative'}
            onClick={() => setSelectedType('narrative')}
          >
            📖 Narrative
          </FilterButton>
          <FilterButton
            active={selectedType === 'master-follow'}
            onClick={() => setSelectedType('master-follow')}
          >
            👑 Master
          </FilterButton>
          <FilterButton
            active={selectedType === 'risk-tier'}
            onClick={() => setSelectedType('risk-tier')}
          >
            📊 Risk-Tier
          </FilterButton>
          <FilterButton
            active={selectedType === 'invite'}
            onClick={() => setSelectedType('invite')}
          >
            🔒 Private
          </FilterButton>
        </div>

        {/* Leagues Grid */}
        {filteredLeagues.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLeagues.map((league) => (
              <LeagueCard key={league.id} league={league} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-surface-2 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">
              🔍
            </div>
            <h3 className="text-lg font-bold text-white">No leagues found</h3>
            <p className="mt-2 text-sm text-white/60">
              No leagues match your filter. Try a different type.
            </p>
          </div>
        )}

        {/* Create League CTA */}
        <div className="mt-12 rounded-2xl border border-base-blue/20 bg-gradient-to-br from-base-blue/10 to-purple-600/10 p-8 text-center">
          <h2 className="text-2xl font-bold text-white">
            Want to Start Your Own League?
          </h2>
          <p className="mt-2 text-white/60">
            Create a private league and invite friends to compete
          </p>
          <button
            className="mt-6 btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create a League
          </button>
        </div>
      </main>

      {/* Create League Modal */}
      {showCreateModal && (
        <CreateLeagueModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateLeague}
        />
      )}
    </div>
  );
}

function CreateLeagueModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: {
    name: string;
    type: LeagueType;
    description: string;
    competitionType: string;
  }) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'open' as LeagueType,
    description: '',
    competitionType: 'weekly',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface-2 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Create a League</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-white/60">
              League Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/40 focus:border-base-blue focus:outline-none"
              placeholder="e.g., Memecoin Masters"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-white/60">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as LeagueType })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-base-blue focus:outline-none"
            >
              <option value="open">Open</option>
              <option value="narrative">Narrative</option>
              <option value="master-follow">Master Follow</option>
              <option value="risk-tier">Risk Tier</option>
              <option value="invite">Private (Invite Only)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-white/60">
              Competition Type
            </label>
            <select
              value={formData.competitionType}
              onChange={(e) => setFormData({ ...formData, competitionType: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-base-blue focus:outline-none"
            >
              <option value="weekly">Weekly</option>
              <option value="daily">Daily</option>
              <option value="threeDay">3-Day</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-white/60">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/40 focus:border-base-blue focus:outline-none"
              placeholder="Describe your league..."
              rows={3}
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-base-blue px-4 py-2 font-medium text-white hover:bg-base-blue/90"
            >
              Create League
            </button>
          </div>
        </form>
      </div>
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

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
        active
          ? 'bg-base-blue text-white'
          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function LeagueCard({ league, featured = false }: { league: League; featured?: boolean }) {
  const typeConfig = getLeagueTypeConfig(league.type);
  const now = Date.now();
  const timeRemaining = Math.max(0, league.endsAt - now);
  const progress = ((now - league.startsAt) / (league.endsAt - league.startsAt)) * 100;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-surface-2 p-6 transition-all hover:border-white/10 ${
        featured
          ? 'border-accent-amber/20 bg-gradient-to-br from-accent-amber/5 to-transparent'
          : 'border-white/5'
      }`}
    >
      {/* Featured badge */}
      {featured && (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-accent-amber/20 px-2 py-1 text-xs font-medium text-accent-amber">
          ⭐ Featured
        </div>
      )}

      {/* Type icon and name */}
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-xl"
          style={{ backgroundColor: `${typeConfig.color}20` }}
        >
          {typeConfig.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate">{league.name}</h3>
          <div
            className="text-xs font-medium"
            style={{ color: typeConfig.color }}
          >
            {typeConfig.name}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 text-sm text-white/50 line-clamp-2">
        {league.description}
      </p>

      {/* Narrative/Risk tier badge */}
      {league.narrative && (
        <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-xs text-white/60">
          📖 {league.narrative}
        </div>
      )}
      {league.riskTier && (
        <div
          className="mt-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs"
          style={{
            backgroundColor: `${getRiskTierConfig(league.riskTier).color}20`,
            color: getRiskTierConfig(league.riskTier).color,
          }}
        >
          📊 {getRiskTierConfig(league.riskTier).name}
        </div>
      )}

      {/* Progress bar */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-white/40">Time remaining</span>
          <span className="font-mono text-white/60">
            {formatTimeRemaining(timeRemaining)}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-base-blue transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-sm font-bold text-white">{league.playerCount}</div>
          <div className="text-xs text-white/40">Players</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-accent-emerald">
            ${league.prizePool.toLocaleString()}
          </div>
          <div className="text-xs text-white/40">Prize Pool</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-white">
            {league.entryFee === 0 ? 'Free' : `$${league.entryFee}`}
          </div>
          <div className="text-xs text-white/40">Entry</div>
        </div>
      </div>

      {/* Join button */}
      <button
        onClick={() => handleJoinLeague(league)}
        disabled={joiningLeagueId === league.id}
        className="mt-4 w-full rounded-xl bg-white/5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10 group-hover:bg-base-blue group-hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {joiningLeagueId === league.id
          ? 'Joining...'
          : league.type === 'invite'
          ? 'Enter Code'
          : 'Join League'}
      </button>
    </div>
  );
}




