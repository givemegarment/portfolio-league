'use client';

import { Master, getTierColor, getTierLabel } from '@/lib/masters';
import { getNarrative } from '@/lib/narratives';
import { formatScore } from '@/lib/scoring';

type MasterCardProps = {
  master: Master;
  onClick?: () => void;
};

export default function MasterCard({ master, onClick }: MasterCardProps) {
  const narrative = getNarrative(master.primaryNarrative);
  const tierColor = getTierColor(master.tier);

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-white/5 bg-surface-2 p-6 transition-all hover:border-white/10 hover:bg-surface-3 cursor-pointer"
    >
      {/* Tier badge */}
      <div
        className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
        style={{
          backgroundColor: `${tierColor}20`,
          color: tierColor,
        }}
      >
        {master.tier === 'legendary' && '👑'}
        {master.tier === 'elite' && '⭐'}
        {master.tier === 'rising' && '📈'}
        {getTierLabel(master.tier)}
      </div>

      {/* Header */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
          style={{ backgroundColor: `${tierColor}20` }}
        >
          {narrative.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white truncate">{master.name}</h3>
            {master.isVerified && (
              <svg
                className="h-4 w-4 text-base-blue flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <div
            className="text-xs font-medium mt-0.5"
            style={{ color: narrative.color }}
          >
            {narrative.name}
          </div>
        </div>
      </div>

      {/* Description */}
      {master.description && (
        <p className="mt-4 text-sm text-white/50 line-clamp-2">
          {master.description}
        </p>
      )}

      {/* Holdings preview */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {master.holdings.slice(0, 4).map((holding) => (
          <div
            key={holding.symbol}
            className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-xs"
          >
            <span className="text-white/80">{holding.symbol}</span>
            <span className="text-white/40">{holding.percentage}%</span>
          </div>
        ))}
        {master.holdings.length > 4 && (
          <div className="flex items-center rounded-lg bg-white/5 px-2 py-1 text-xs text-white/40">
            +{master.holdings.length - 4}
          </div>
        )}
      </div>

      {/* Performance metrics */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-white/[0.03] p-2.5">
          <div className="text-xs text-white/40">7D Return</div>
          <div
            className={`text-sm font-bold ${
              master.performance.return7D >= 0
                ? 'text-accent-emerald'
                : 'text-accent-rose'
            }`}
          >
            {formatScore(master.performance.return7D)}
          </div>
        </div>
        <div className="rounded-lg bg-white/[0.03] p-2.5">
          <div className="text-xs text-white/40">30D Return</div>
          <div
            className={`text-sm font-bold ${
              master.performance.return30D >= 0
                ? 'text-accent-emerald'
                : 'text-accent-rose'
            }`}
          >
            {formatScore(master.performance.return30D)}
          </div>
        </div>
        <div className="rounded-lg bg-white/[0.03] p-2.5">
          <div className="text-xs text-white/40">Win Rate</div>
          <div className="text-sm font-bold text-white">
            {master.performance.winRate}%
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 flex items-center justify-between text-xs text-white/40">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {master.followerCount.toLocaleString()} followers
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            {master.emulatorCount.toLocaleString()} emulators
          </span>
        </div>
        <svg
          className="h-4 w-4 text-white/20 group-hover:text-white/40 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  );
}




