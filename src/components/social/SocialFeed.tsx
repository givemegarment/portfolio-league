'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PortfolioViewer from './PortfolioViewer';

type Props = {
  address: string;
  className?: string;
};

type Activity = {
  id: string;
  address: string;
  type: 'portfolio_update' | 'achievement' | 'rank_change';
  timestamp: number;
  data: Record<string, any>;
};

export default function SocialFeed({ address, className = '' }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/social/feed?address=${address}&limit=20`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch feed');
        }

        const data = await response.json();
        setActivities(data.activities || []);
      } catch (err) {
        console.error('Error fetching social feed:', err);
        setError(err instanceof Error ? err.message : 'Failed to load feed');
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      fetchFeed();
      const interval = setInterval(fetchFeed, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [address]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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

  if (activities.length === 0) {
    return (
      <div className={`rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center ${className}`}>
        <svg className="mx-auto h-12 w-12 text-white/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <p className="text-sm text-white/60">No activity from followed users</p>
        <p className="text-xs text-white/40 mt-1">Follow some players to see their updates here</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {activities.map((activity) => {
        const shortAddress = `${activity.address.slice(0, 6)}...${activity.address.slice(-4)}`;

        return (
          <div
            key={activity.id}
            className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Link
                    href={`/profile/${activity.address}`}
                    className="font-mono text-sm font-bold text-white hover:text-base-blue transition-colors"
                  >
                    {shortAddress}
                  </Link>
                  <span className="text-xs text-white/40">{formatTime(activity.timestamp)}</span>
                </div>

                {activity.type === 'portfolio_update' && (
                  <div>
                    {activity.data.action === 'copied' ? (
                      <p className="text-sm text-white/80">
                        Copied portfolio from{' '}
                        <Link
                          href={`/profile/${activity.data.fromAddress}`}
                          className="text-base-blue hover:underline"
                        >
                          {`${activity.data.fromAddress.slice(0, 6)}...${activity.data.fromAddress.slice(-4)}`}
                        </Link>
                      </p>
                    ) : (
                      <p className="text-sm text-white/80">Updated portfolio</p>
                    )}
                    <PortfolioViewer
                      address={activity.address}
                      currentUserAddress={address}
                      className="mt-3"
                    />
                  </div>
                )}

                {activity.type === 'achievement' && (
                  <p className="text-sm text-white/80">
                    🏆 Earned achievement: {activity.data.achievementName || 'Unknown'}
                  </p>
                )}

                {activity.type === 'rank_change' && (
                  <p className="text-sm text-white/80">
                    📈 Rank changed to #{activity.data.newRank}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
