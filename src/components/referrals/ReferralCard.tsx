'use client';

import { useState, useEffect } from 'react';

type ReferralData = {
  code: string;
  stats: {
    totalReferrals: number;
    totalBonusPoints: number;
    referredAddresses: string[];
  } | null;
  shareUrl: string;
};

type Props = {
  address?: `0x${string}`;
};

export default function ReferralCard({ address }: Props) {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    const fetchReferralCode = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/referral?address=${address}`);
        
        if (!response.ok) {
          throw new Error('Failed to get referral code');
        }

        const data = await response.json();
        setReferralData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load referral data');
      } finally {
        setLoading(false);
      }
    };

    fetchReferralCode();
  }, [address]);

  const copyLink = async () => {
    if (!referralData?.shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(referralData.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyCode = async () => {
    if (!referralData?.code) return;
    
    try {
      await navigator.clipboard.writeText(referralData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!address) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <p className="mt-3 text-white/50">Connect wallet to get your referral link</p>
        </div>
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
          <p className="text-white/50">Loading referral code...</p>
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
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-base-blue/10 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-base-blue">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Your Referral Link</h3>
          <p className="text-sm text-white/50">Earn 100 points per referral</p>
        </div>
      </div>

      {/* Referral Code */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-white/40">Your Code</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
            <span className="font-mono text-2xl font-bold tracking-wider text-white">
              {referralData?.code}
            </span>
          </div>
          <button
            onClick={copyCode}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            {copied ? (
              <svg className="h-5 w-5 text-accent-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Share URL */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-white/40">Share Link</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={referralData?.shareUrl || ''}
            readOnly
            className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/70 font-mono truncate"
          />
          <button
            onClick={copyLink}
            className="rounded-xl bg-gradient-to-r from-purple-500 to-base-blue px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Stats */}
      {referralData?.stats && (
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{referralData.stats.totalReferrals}</p>
            <p className="text-sm text-white/50">Referrals</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-accent-amber">{referralData.stats.totalBonusPoints}</p>
            <p className="text-sm text-white/50">Points Earned</p>
          </div>
        </div>
      )}

      {/* Recent Referrals */}
      {referralData?.stats?.referredAddresses && referralData.stats.referredAddresses.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-white/10">
          <span className="text-xs font-medium uppercase tracking-wider text-white/40">Recent Referrals</span>
          <div className="space-y-2">
            {referralData.stats.referredAddresses.slice(0, 5).map((addr, idx) => (
              <div key={idx} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-base-blue flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{idx + 1}</span>
                </div>
                <span className="font-mono text-sm text-white/70">{addr}</span>
                <span className="ml-auto text-xs text-accent-emerald">+100 pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}









