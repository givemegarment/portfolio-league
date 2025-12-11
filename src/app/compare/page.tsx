'use client';

import { useSearchParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Suspense } from 'react';
import Nav from '@/components/chrome/Nav';
import PortfolioCompare from '@/components/portfolio/PortfolioCompare';

function CompareContent() {
  const searchParams = useSearchParams();
  const { address } = useAccount();
  
  const compareAddress = searchParams.get('address');

  if (!compareAddress) {
    return (
      <div className="rounded-2xl border border-white/5 bg-surface-2 p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <h2 className="mt-4 text-xl font-bold text-white">No Player Selected</h2>
        <p className="mt-2 text-white/60">
          Go to the leaderboard and click &quot;Compare&quot; on any player to see how your portfolio stacks up.
        </p>
        <a href="/" className="mt-6 inline-block btn-primary text-sm">
          View Leaderboard
        </a>
      </div>
    );
  }

  return (
    <PortfolioCompare
      yourAddress={address}
      compareAddress={compareAddress}
      onClose={() => window.history.back()}
    />
  );
}

export default function ComparePage() {
  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Suspense fallback={
          <div className="rounded-2xl border border-white/5 bg-surface-2 p-8">
            <div className="flex items-center justify-center gap-3">
              <svg className="h-6 w-6 animate-spin text-base-blue" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-white/60">Loading comparison...</span>
            </div>
          </div>
        }>
          <CompareContent />
        </Suspense>
      </main>
    </div>
  );
}

