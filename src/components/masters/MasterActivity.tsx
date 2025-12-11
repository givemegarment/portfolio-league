'use client';

import { useState, useEffect } from 'react';
import { MasterActivity as MasterActivityType } from '@/app/types';

interface MasterActivityProps {
  masterAddress: string;
}

export function MasterActivity({ masterAddress }: MasterActivityProps) {
  const [activities, setActivities] = useState<MasterActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivity();
  }, [masterAddress]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/masters/${masterAddress}/activity`);
      const data = await response.json();

      if (data.success) {
        setActivities(data.data.activities);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load activity');
      console.error('Error fetching activity:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'swap':
        return '↔';
      case 'stake':
        return '📥';
      case 'unstake':
        return '📤';
      case 'bridge':
        return '🌉';
      case 'lp_add':
        return '💧';
      case 'lp_remove':
        return '🔥';
      case 'transfer':
        return '→';
      default:
        return '•';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'swap':
        return 'text-blue-400';
      case 'stake':
        return 'text-green-400';
      case 'unstake':
        return 'text-orange-400';
      case 'bridge':
        return 'text-purple-400';
      case 'lp_add':
        return 'text-cyan-400';
      case 'lp_remove':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60 * 60 * 1000) {
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return `${Math.floor(diff / 86400000)}d ago`;
    }
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-700/50 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        <button
          onClick={fetchActivity}
          className="text-sm text-amber-500 hover:underline"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div
            key={`${activity.txHash}-${index}`}
            className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className={`text-xl ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white capitalize">
                    {activity.type.replace('_', ' ')}
                  </span>
                  {activity.fromAsset && activity.toAsset && (
                    <span className="text-xs text-gray-400">
                      {activity.fromAsset} → {activity.toAsset}
                    </span>
                  )}
                  {!activity.fromAsset && activity.toAsset && (
                    <span className="text-xs text-gray-400">
                      {activity.toAsset}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {formatTime(activity.timestamp)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-white">
                {formatAmount(activity.amount)}
              </span>
              <a
                href={`https://basescan.org/tx/${activity.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-amber-500 hover:underline"
              >
                View tx
              </a>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <p className="text-center text-gray-500 py-4">No recent activity</p>
      )}
    </div>
  );
}
