'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/chrome/Nav';
import {
  League,
  LeagueType,
  createSampleLeagues,
  getLeagueTypeConfig,
  getRiskTierConfig,
  formatTimeRemaining,
} from '@/lib/competitions';

export default function LeaguesPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<LeagueType | 'all'>('all');
  
  // Load sample leagues
  const allLeagues = useMemo(() => createSampleLeagues(), []);
  
  // Filter leagues
  const filteredLeagues = useMemo(() => {
    if (selectedType === 'all') return allLeagues;
    return allLeagues.filter((l) => l.type === selectedType);
  }, [allLeagues, selectedType]);

  const featuredLeagues = allLeagues.filter((l) => l.isFeatured);
  const activeLeagues = allLeagues.filter((l) => l.isActive);

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
            onClick={() => {
              // TODO: Implement league creation
              alert('League creation coming soon!');
            }}
          >
            Create a League
          </button>
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
      <button className="mt-4 w-full rounded-xl bg-white/5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10 group-hover:bg-base-blue group-hover:text-white">
        {league.type === 'invite' ? 'Enter Code' : 'Join League'}
      </button>
    </div>
  );
}




