'use client';

import { useState, useEffect } from 'react';

type BonusEntry = {
  type: 'referral' | 'achievement' | 'weekly_bonus';
  points: number;
  description: string;
  timestamp: number;
  metadata?: Record<string, string>;
};

type BonusData = {
  address: string;
  totalPoints: number;
  history: BonusEntry[];
  referrals: {
    code: string;
    totalReferrals: number;
    referralPoints: number;
  } | null;
};

const BONUS_TYPE_CONFIG = {
  referral: {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    bgColor: 'bg-purple-500/20',
    textColor: 'text-purple-400',
  },
  achievement: {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    bgColor: 'bg-accent-amber/20',
    textColor: 'text-accent-amber',
  },
  weekly_bonus: {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bgColor: 'bg-accent-emerald/20',
    textColor: 'text-accent-emerald',
  },
};

type Props = {
  address?: `0x${string}`;
};

export default function BonusHistory({ address }: Props) {
  const [bonusData, setBonusData] = useState<BonusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    const fetchBonuses = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/bonuses?address=${address}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch bonus data');
        }

        const data = await response.json();
        setBonusData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bonus data');
      } finally {
        setLoading(false);
      }
    };

    fetchBonuses();
  }, [address]);

  if (!address) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <p className="text-center text-white/50">Connect wallet to view bonus history</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div className="flex items-center justify-center gap-3">
          <svg className="h-5 w-5 animate-spin text-base-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-white/50">Loading bonus history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-accent-rose/20 bg-accent-rose/5 p-6">
        <p className="text-center text-accent-rose">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Points Card */}
      <div className="rounded-2xl border border-accent-amber/20 bg-gradient-to-br from-accent-amber/10 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/50">Total Bonus Points</p>
            <p className="text-4xl font-bold text-accent-amber">{bonusData?.totalPoints || 0}</p>
          </div>
          <div className="h-16 w-16 rounded-2xl bg-accent-amber/20 flex items-center justify-center">
            <svg className="h-8 w-8 text-accent-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        {/* Points breakdown */}
        {bonusData?.referrals && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">From referrals ({bonusData.referrals.totalReferrals})</span>
              <span className="text-white font-mono">{bonusData.referrals.referralPoints} pts</span>
            </div>
          </div>
        )}
      </div>

      {/* History */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Bonus History</h3>
        
        {!bonusData?.history || bonusData.history.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-3 text-white/50">No bonus history yet</p>
            <p className="mt-1 text-sm text-white/30">Earn points by referring friends!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {bonusData.history.map((entry, idx) => {
              const config = BONUS_TYPE_CONFIG[entry.type] || BONUS_TYPE_CONFIG.referral;
              
              return (
                <div 
                  key={idx} 
                  className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bgColor} ${config.textColor}`}>
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{entry.description}</p>
                    <p className="text-xs text-white/40">
                      {new Date(entry.timestamp).toLocaleDateString()} at{' '}
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-bold ${config.textColor}`}>
                      +{entry.points}
                    </p>
                    <p className="text-xs text-white/40">points</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}




