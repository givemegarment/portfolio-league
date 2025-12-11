'use client';

import { useState, useEffect } from 'react';

type Props = {
  address: string;
};

type Preferences = {
  weeklyDigest: boolean;
  achievements: boolean;
  leaderboardUpdates: boolean;
};

export default function EmailSubscription({ address }: Props) {
  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState<Preferences>({
    weeklyDigest: true,
    achievements: true,
    leaderboardUpdates: true,
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Check if already subscribed
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch(`/api/notifications/email/subscribe?address=${address}`);
        if (response.ok) {
          const data = await response.json();
          if (data.subscribed) {
            setIsSubscribed(true);
            setEmail(data.subscription.email);
            setPreferences(data.subscription.preferences);
          }
        }
      } catch (err) {
        console.error('Failed to check subscription:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [address]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch('/api/notifications/email/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, address, preferences }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setIsSubscribed(true);
      setStatus({ type: 'success', message: 'Successfully subscribed! Check your email for confirmation.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to subscribe';
      setStatus({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnsubscribe = async () => {
    setSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch('/api/notifications/email/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        throw new Error('Failed to unsubscribe');
      }

      setIsSubscribed(false);
      setEmail('');
      setStatus({ type: 'success', message: 'Successfully unsubscribed from email notifications.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to unsubscribe';
      setStatus({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-surface-2 p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg shimmer" />
          <div className="flex-1">
            <div className="h-4 w-32 rounded shimmer mb-2" />
            <div className="h-3 w-48 rounded shimmer" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-2 p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-base-blue/20">
          <svg className="h-5 w-5 text-base-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-white">Email Notifications</h3>
          <p className="text-xs text-white/50">
            {isSubscribed ? 'Manage your email preferences' : 'Get weekly updates and achievement alerts'}
          </p>
        </div>
      </div>

      {isSubscribed ? (
        // Subscribed state
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-accent-emerald/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-accent-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-accent-emerald font-medium">Subscribed</span>
            </div>
            <span className="text-xs text-white/50 font-mono">{email}</span>
          </div>

          {/* Preferences */}
          <div className="space-y-2">
            {Object.entries(preferences).map(([key, value]) => {
              const labels: Record<string, string> = {
                weeklyDigest: 'Weekly digest',
                achievements: 'Achievement alerts',
                leaderboardUpdates: 'Leaderboard updates',
              };
              return (
                <div key={key} className="flex items-center justify-between py-2">
                  <span className="text-sm text-white/70">{labels[key]}</span>
                  <span className={`text-xs ${value ? 'text-accent-emerald' : 'text-white/30'}`}>
                    {value ? 'On' : 'Off'}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleUnsubscribe}
            disabled={submitting}
            className="w-full rounded-xl border border-accent-rose/20 bg-accent-rose/10 px-4 py-2 text-sm font-medium text-accent-rose hover:bg-accent-rose/20 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Unsubscribing...' : 'Unsubscribe'}
          </button>
        </div>
      ) : (
        // Subscribe form
        <form onSubmit={handleSubscribe} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-base-blue focus:outline-none"
            />
          </div>

          {/* Preferences toggles */}
          <div className="space-y-2">
            {Object.entries(preferences).map(([key, value]) => {
              const labels: Record<string, string> = {
                weeklyDigest: 'Weekly digest',
                achievements: 'Achievement alerts',
                leaderboardUpdates: 'Leaderboard updates',
              };
              return (
                <label key={key} className="flex items-center justify-between cursor-pointer py-2">
                  <span className="text-sm text-white/70">{labels[key]}</span>
                  <button
                    type="button"
                    onClick={() => setPreferences(prev => ({ ...prev, [key]: !prev[key as keyof Preferences] }))}
                    className={`
                      relative h-6 w-11 rounded-full transition-colors
                      ${value ? 'bg-base-blue' : 'bg-white/10'}
                    `}
                  >
                    <span
                      className={`
                        absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform
                        ${value ? 'translate-x-5' : 'translate-x-0'}
                      `}
                    />
                  </button>
                </label>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={submitting || !email}
            className="btn-primary w-full py-3 text-sm"
          >
            {submitting ? 'Subscribing...' : 'Subscribe to Updates'}
          </button>
        </form>
      )}

      {/* Status message */}
      {status && (
        <div
          className={`mt-4 rounded-xl px-4 py-3 text-sm ${
            status.type === 'success'
              ? 'bg-accent-emerald/10 text-accent-emerald'
              : 'bg-accent-rose/10 text-accent-rose'
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}


