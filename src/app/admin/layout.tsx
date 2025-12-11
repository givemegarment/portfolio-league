'use client';

import { ReactNode } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { isAdmin } from '@/lib/admin';

function AdminGuard({ children }: { children: ReactNode }) {
  const { address, isConnected, isConnecting } = useAccount();
  
  // Still loading
  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="h-8 w-8 animate-spin text-base-blue mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-white/50">Checking admin access...</p>
        </div>
      </div>
    );
  }
  
  // Not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-rose/10 mx-auto">
            <svg className="h-8 w-8 text-accent-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Access Required</h1>
          <p className="text-white/50 mb-6">
            Please connect your wallet to access the admin dashboard.
          </p>
          <Link
            href="/"
            className="inline-block rounded-xl bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }
  
  // Connected but not admin
  if (!isAdmin(address)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-rose/10 mx-auto">
            <svg className="h-8 w-8 text-accent-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-white/50 mb-4">
            Your wallet is not authorized to access the admin dashboard.
          </p>
          <p className="font-mono text-xs text-white/30 mb-6">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
          <Link
            href="/"
            className="inline-block rounded-xl bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }
  
  // Admin access granted
  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen">
        {/* Admin Nav */}
        <nav className="border-b border-white/5 bg-surface-2">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="text-sm">Back to App</span>
                </Link>
                <div className="h-6 w-px bg-white/10" />
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-amber/20">
                    <svg className="h-4 w-4 text-accent-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="font-bold text-white">Admin Dashboard</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="rounded-full bg-accent-emerald/10 px-3 py-1 text-xs text-accent-emerald border border-accent-emerald/20">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </nav>
        
        {children}
      </div>
    </AdminGuard>
  );
}


