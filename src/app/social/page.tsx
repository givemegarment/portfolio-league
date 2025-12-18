'use client';

import { useState, useEffect } from 'react';
import Nav from '@/components/chrome/Nav';
import SocialFeed from '@/components/social/SocialFeed';
import FollowingList from '@/components/social/FollowingList';

export default function SocialPage() {
  const [address, setAddress] = useState<string | undefined>();

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
          }
        })
        .catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Nav />
      
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Social Feed</h1>
          <p className="text-white/60">See updates from players you follow</p>
        </div>

        {!address ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-lg font-medium text-white mb-2">Connect your wallet</p>
            <p className="text-sm text-white/60">Connect your wallet to see your social feed</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-2">
              <SocialFeed address={address} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <FollowingList address={address} type="following" />
              <FollowingList address={address} type="followers" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
