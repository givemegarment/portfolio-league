'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Props = {
  address: string;
  type: 'following' | 'followers';
  className?: string;
};

export default function FollowingList({ address, type, className = '' }: Props) {
  const [users, setUsers] = useState<string[]>([]);
  const [stats, setStats] = useState<{ followingCount: number; followersCount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchList = async () => {
      setLoading(true);
      setError(null);

      try {
        const endpoint = type === 'following'
          ? `/api/user/${address}/following`
          : `/api/user/${address}/followers`;
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error('Failed to fetch list');
        }

        const data = await response.json();
        setUsers(type === 'following' ? data.following : data.followers);
        setStats(data.stats);
      } catch (err) {
        console.error('Error fetching list:', err);
        setError(err instanceof Error ? err.message : 'Failed to load list');
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      fetchList();
    }
  }, [address, type]);

  if (loading) {
    return (
      <div className={`rounded-2xl border border-white/5 bg-white/[0.02] p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <svg className="h-8 w-8 animate-spin text-base-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl border border-accent-rose/20 bg-accent-rose/5 p-6 text-center ${className}`}>
        <p className="text-sm text-accent-rose">{error}</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-white/5 bg-white/[0.02] p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white capitalize">
          {type === 'following' ? 'Following' : 'Followers'}
        </h3>
        {stats && (
          <span className="text-sm text-white/40">
            {type === 'following' ? stats.followingCount : stats.followersCount} {type}
          </span>
        )}
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-white/60">No {type} yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((userAddress) => {
            const shortAddress = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
            
            return (
              <Link
                key={userAddress}
                href={`/profile/${userAddress}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
              >
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    backgroundColor: `#${userAddress.slice(2, 8)}`,
                  }}
                >
                  {userAddress.slice(2, 4).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-mono text-sm font-medium text-white">
                    {shortAddress}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
