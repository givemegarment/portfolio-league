'use client';

import { useState, useEffect } from 'react';
import { getRiskScoreColor, getRiskScoreLabel, type RiskMetrics } from '@/lib/scoring';

type PlayerStats = {
  address: string;
  totalCompetitions: number;
  bestRank: number | null;
  worstRank: number | null;
  winRate: number;
  totalReturn: number;
  averageReturn: number;
  joinDate: number | null;
  lastActive: number | null;
  competitionBreakdown: {
    daily: number;
    weekly: number;
    monthly: number;
  };
};

type Props = {
  address: string;
  className?: string;
  compact?: boolean;
};

// Animated stat counter
function AnimatedNumber({ value, suffix = '', prefix = '', decimals = 0 }: { 
  value: number; 
  suffix?: string; 
  prefix?: string;
  decimals?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <span className="tabular-nums">
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
}

// Hexagon badge component for Web3 aesthetic
function HexBadge({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="relative group">
      {/* Glow effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"
        style={{ backgroundColor: `${color}30` }}
      />
      
      <div className="relative flex flex-col items-center p-4">
        {/* Hexagon shape */}
        <div 
          className="relative w-16 h-16 flex items-center justify-center mb-2"
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            background: `linear-gradient(135deg, ${color}40 0%, ${color}10 100%)`,
          }}
        >
          <div 
            className="absolute inset-[2px] flex items-center justify-center"
            style={{
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              background: 'var(--surface-2)',
            }}
          >
            <span className="font-mono font-bold text-lg text-white">{value}</span>
          </div>
        </div>
        <span className="text-xs text-white/50 text-center">{label}</span>
      </div>
    </div>
  );
}

// Progress ring component
function ProgressRing({ progress, size = 80, strokeWidth = 6, color }: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
  color: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        style={{
          transition: 'stroke-dashoffset 1s ease-out',
          filter: `drop-shadow(0 0 6px ${color})`,
        }}
      />
    </svg>
  );
}

export default function PlayerStatsCard({ address, className = '', compact = false }: Props) {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!address) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/user/${address}/stats`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [address]);

  if (loading) {
    return (
      <div className={`rounded-2xl border border-white/5 bg-white/[0.02] p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 rounded bg-white/10" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={`rounded-2xl border border-white/5 bg-white/[0.02] p-6 ${className}`}>
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-white/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-white/50 text-sm">No competition history yet</p>
          <p className="text-white/30 text-xs mt-1">Join a competition to start tracking</p>
        </div>
      </div>
    );
  }

  const isPositiveReturn = stats.totalReturn >= 0;
  const winRateColor = stats.winRate >= 50 ? '#10B981' : stats.winRate >= 25 ? '#F59E0B' : '#F43F5E';
  const returnColor = isPositiveReturn ? '#10B981' : '#F43F5E';

  if (compact) {
    return (
      <div className={`rounded-2xl border border-white/5 bg-white/[0.02] p-4 ${className}`}>
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.totalCompetitions}</div>
            <div className="text-xs text-white/40">Competitions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-amber">
              {stats.bestRank ? `#${stats.bestRank}` : '—'}
            </div>
            <div className="text-xs text-white/40">Best Rank</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: winRateColor }}>
              {stats.winRate}%
            </div>
            <div className="text-xs text-white/40">Win Rate</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold font-mono ${isPositiveReturn ? 'text-accent-emerald' : 'text-accent-rose'}`}>
              {isPositiveReturn ? '+' : ''}{stats.totalReturn.toFixed(1)}%
            </div>
            <div className="text-xs text-white/40">Total Return</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden ${className}`}>
      {/* Web3 background effects */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-base-blue/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-600/10 to-transparent rounded-full blur-3xl" />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="h-5 w-5 text-base-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Competition Stats
            </h3>
            {stats.joinDate && (
              <p className="text-xs text-white/40 mt-0.5">
                Playing since {new Date(stats.joinDate).toLocaleDateString()}
              </p>
            )}
          </div>
          
          {/* Trophy count indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-amber/10 border border-accent-amber/20">
            <span className="text-lg">🏆</span>
            <span className="font-mono font-bold text-accent-amber">{stats.totalCompetitions}</span>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Win Rate Ring */}
          <div className="relative flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="relative">
              <ProgressRing progress={stats.winRate} color={winRateColor} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono font-bold text-xl text-white">
                  <AnimatedNumber value={stats.winRate} suffix="%" />
                </span>
              </div>
            </div>
            <span className="text-xs text-white/50 mt-2">Win Rate</span>
            <span className="text-[10px] text-white/30">Top 10% Finishes</span>
          </div>

          {/* Best Rank */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="relative">
              <div className="absolute inset-0 bg-accent-amber/20 rounded-full blur-xl animate-pulse" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent-amber/20 to-accent-amber/5 border border-accent-amber/30">
                <span className="font-mono font-bold text-2xl text-accent-amber">
                  {stats.bestRank ? `#${stats.bestRank}` : '—'}
                </span>
              </div>
            </div>
            <span className="text-xs text-white/50 mt-2">Best Finish</span>
          </div>

          {/* Total Return */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className={`
              relative flex h-20 w-20 items-center justify-center rounded-xl
              ${isPositiveReturn ? 'bg-accent-emerald/10 border border-accent-emerald/20' : 'bg-accent-rose/10 border border-accent-rose/20'}
            `}>
              {/* Arrow indicator */}
              <div className="absolute -top-2 -right-2">
                <div className={`
                  h-6 w-6 rounded-full flex items-center justify-center
                  ${isPositiveReturn ? 'bg-accent-emerald text-white' : 'bg-accent-rose text-white'}
                `}>
                  {isPositiveReturn ? '↑' : '↓'}
                </div>
              </div>
              <span className={`font-mono font-bold text-xl ${isPositiveReturn ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                <AnimatedNumber 
                  value={Math.abs(stats.totalReturn)} 
                  prefix={isPositiveReturn ? '+' : '-'} 
                  suffix="%" 
                  decimals={1}
                />
              </span>
            </div>
            <span className="text-xs text-white/50 mt-2">Total Return</span>
          </div>

          {/* Average Return */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-xl bg-white/5 border border-white/10">
              <span className={`font-mono font-bold text-xl ${stats.averageReturn >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                {stats.averageReturn >= 0 ? '+' : ''}{stats.averageReturn.toFixed(1)}%
              </span>
            </div>
            <span className="text-xs text-white/50 mt-2">Avg per Week</span>
          </div>
        </div>

        {/* Competition Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
            <div className="text-2xl font-bold text-white">{stats.competitionBreakdown.weekly}</div>
            <div className="text-xs text-white/40">Weekly</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
            <div className="text-2xl font-bold text-white">{stats.competitionBreakdown.daily}</div>
            <div className="text-xs text-white/40">Daily</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
            <div className="text-2xl font-bold text-white">{stats.competitionBreakdown.monthly}</div>
            <div className="text-xs text-white/40">Monthly</div>
          </div>
        </div>

        {/* Last Active */}
        {stats.lastActive && (
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
            <span>Last active</span>
            <span>{new Date(stats.lastActive).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}




