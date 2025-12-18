'use client';

import { useState, useEffect } from 'react';

type Props = {
  address: string;
  targetAddress: string;
  className?: string;
  onFollowChange?: (following: boolean) => void;
};

export default function FollowButton({
  address,
  targetAddress,
  className = '',
  onFollowChange,
}: Props) {
  const [following, setFollowing] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!address || !targetAddress) {
      setLoading(false);
      return;
    }

    const checkFollowStatus = async () => {
      try {
        const response = await fetch(
          `/api/user/${targetAddress}/follow?follower=${address}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setFollowing(data.following || false);
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkFollowStatus();
  }, [address, targetAddress]);

  const handleToggle = async () => {
    if (!address || updating) return;

    setUpdating(true);
    
    try {
      const response = await fetch(`/api/user/${targetAddress}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          action: following ? 'unfollow' : 'follow',
        }),
      });

      if (response.ok) {
        const newFollowing = !following;
        setFollowing(newFollowing);
        onFollowChange?.(newFollowing);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !address || address.toLowerCase() === targetAddress.toLowerCase()) {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      disabled={updating}
      className={`
        px-4 py-2 rounded-lg text-sm font-medium transition-colors
        ${following
          ? 'bg-white/10 text-white border border-white/20 hover:bg-white/15'
          : 'bg-base-blue text-white hover:bg-base-blue-light'
        }
        ${updating ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {updating ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {following ? 'Unfollowing...' : 'Following...'}
        </span>
      ) : (
        <span className="flex items-center gap-2">
          {following ? (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Following
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Follow
            </>
          )}
        </span>
      )}
    </button>
  );
}
