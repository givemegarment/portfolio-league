'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type ReferralStats = {
  code: string;
  stats: {
    totalReferrals: number;
    totalBonusPoints: number;
  } | null;
};

type Props = {
  address: string;
};

export default function ReferralSummary({ address }: Props) {
  const [data, setData] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReferralStats = async () => {
      try {
        const response = await fetch(`/api/referral?address=${address}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (err) {
        console.error('Failed to fetch referral stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralStats();
  }, [address]);

  const copyCode = async () => {
    if (!data?.code) return;
    
    try {
      const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}?ref=${data.code}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-surface-2 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl shimmer" />
          <div className="flex-1">
            <div className="h-4 w-24 rounded shimmer mb-2" />
            <div className="h-3 w-32 rounded shimmer" />
          </div>
        </div>
      </div>
    );
  }

  const totalReferrals = data?.stats?.totalReferrals || 0;
  const totalPoints = data?.stats?.totalBonusPoints || 0;

  return (
    <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-purple-500/5 to-base-blue/5 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-base-blue/20">
            <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span className="font-semibold text-white">Referrals</span>
        </div>
        <Link
          href="/referrals"
          className="text-xs text-base-blue hover:text-base-blue-light transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl bg-white/5 p-3 text-center">
          <p className="text-2xl font-bold text-white">{totalReferrals}</p>
          <p className="text-xs text-white/50">Referrals</p>
        </div>
        <div className="rounded-xl bg-white/5 p-3 text-center">
          <p className="text-2xl font-bold text-accent-amber">{totalPoints}</p>
          <p className="text-xs text-white/50">Points Earned</p>
        </div>
      </div>

      {/* Referral Code */}
      {data?.code && (
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-lg bg-white/5 px-3 py-2 font-mono text-sm text-white/70 truncate">
            {data.code}
          </div>
          <button
            onClick={copyCode}
            className="rounded-lg bg-gradient-to-r from-purple-500 to-base-blue px-3 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      )}

      {/* Empty state */}
      {totalReferrals === 0 && (
        <p className="text-xs text-white/40 text-center mt-3">
          Share your referral link to earn bonus points!
        </p>
      )}
    </div>
  );
}


