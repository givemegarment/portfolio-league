'use client';

import { useState } from 'react';
import { NarrativeType, getAllNarratives, getNarrative } from '@/lib/narratives';
import { MasterTier } from '@/lib/masters';

type FilterState = {
  narrative: NarrativeType | 'all';
  tier: MasterTier | 'all';
  sortBy: 'return7D' | 'return30D' | 'followers' | 'emulators';
  search: string;
};

type MasterFiltersProps = {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
};

export default function MasterFilters({ filters, onFiltersChange }: MasterFiltersProps) {
  const narratives = getAllNarratives();

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search masters..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:border-base-blue focus:outline-none"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Narrative filter */}
        <div className="flex-1 min-w-[150px]">
          <select
            value={filters.narrative}
            onChange={(e) => updateFilter('narrative', e.target.value as NarrativeType | 'all')}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-base-blue focus:outline-none"
          >
            <option value="all">All Narratives</option>
            {narratives.map((n) => (
              <option key={n.id} value={n.id}>
                {n.icon} {n.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tier filter */}
        <div className="flex-1 min-w-[120px]">
          <select
            value={filters.tier}
            onChange={(e) => updateFilter('tier', e.target.value as MasterTier | 'all')}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-base-blue focus:outline-none"
          >
            <option value="all">All Tiers</option>
            <option value="legendary">👑 Legendary</option>
            <option value="elite">⭐ Elite</option>
            <option value="rising">📈 Rising</option>
            <option value="community">🌐 Community</option>
          </select>
        </div>

        {/* Sort by */}
        <div className="flex-1 min-w-[140px]">
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value as FilterState['sortBy'])}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-base-blue focus:outline-none"
          >
            <option value="return7D">Sort: 7D Return</option>
            <option value="return30D">Sort: 30D Return</option>
            <option value="followers">Sort: Followers</option>
            <option value="emulators">Sort: Emulators</option>
          </select>
        </div>
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2">
        {narratives.slice(0, 6).map((n) => (
          <button
            key={n.id}
            onClick={() => updateFilter('narrative', filters.narrative === n.id ? 'all' : n.id)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              filters.narrative === n.id
                ? 'bg-base-blue text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>{n.icon}</span>
            <span>{n.shortName}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export type { FilterState };




