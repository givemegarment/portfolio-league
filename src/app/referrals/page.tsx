'use client';

import { useAccount } from 'wagmi';
import Nav from '@/components/chrome/Nav';
import ReferralCard from '@/components/referrals/ReferralCard';
import BonusHistory from '@/components/referrals/BonusHistory';

export default function ReferralsPage() {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen">
      <Nav />
      
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Referrals & Bonuses</h1>
          <p className="mt-2 text-white/50">
            Invite friends to Portfolio League and earn bonus points for each successful referral
          </p>
        </div>

        {/* How it works */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-lg font-bold text-white mb-4">How It Works</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-base-blue/20 text-base-blue font-bold text-sm">
                1
              </div>
              <div>
                <p className="font-medium text-white">Share Your Link</p>
                <p className="text-sm text-white/50">Copy your unique referral link and share it with friends</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 font-bold text-sm">
                2
              </div>
              <div>
                <p className="font-medium text-white">Friends Join</p>
                <p className="text-sm text-white/50">When they connect wallet and save a portfolio using your link</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-amber/20 text-accent-amber font-bold text-sm">
                3
              </div>
              <div>
                <p className="font-medium text-white">Earn Points</p>
                <p className="text-sm text-white/50">Get 100 bonus points for each successful referral</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Referral Card */}
          <div>
            <ReferralCard address={address} />
          </div>

          {/* Bonus History */}
          <div>
            <BonusHistory address={address} />
          </div>
        </div>

        {/* Season Info */}
        <div className="mt-8 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex items-center gap-3 mb-4">
            <svg className="h-6 w-6 text-base-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-bold text-white">About Bonus Points</h3>
          </div>
          <div className="space-y-3 text-sm text-white/70">
            <p>
              Bonus points are earned through referrals and special achievements. While they don&apos;t affect 
              your weekly portfolio performance score, they contribute to your overall standing in the 
              Portfolio League ecosystem.
            </p>
            <p>
              Future seasons may include exclusive rewards, NFT badges, or prize pool multipliers 
              based on your accumulated bonus points.
            </p>
          </div>
        </div>

        {/* Back to main */}
        <div className="mt-8 text-center">
          <a 
            href="/"
            className="inline-flex items-center gap-2 text-base-blue hover:text-base-blue-light transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Portfolio League
          </a>
        </div>
      </main>
    </div>
  );
}

