/**
 * Social features utilities
 * 
 * Handles follow/unfollow relationships and social activity
 */

import { redis } from './redis';

/**
 * Follow a user
 */
export async function followUser(followerAddress: string, followingAddress: string): Promise<void> {
  const followerKey = `follows:${followerAddress.toLowerCase()}`;
  const followingKey = `followers:${followingAddress.toLowerCase()}`;
  
  // Add to sets
  await redis.sadd(followerKey, followingAddress.toLowerCase());
  await redis.sadd(followingKey, followerAddress.toLowerCase());
  
  // Set expiration (1 year)
  await redis.expire(followerKey, 365 * 24 * 60 * 60);
  await redis.expire(followingKey, 365 * 24 * 60 * 60);
}

/**
 * Unfollow a user
 */
export async function unfollowUser(followerAddress: string, followingAddress: string): Promise<void> {
  const followerKey = `follows:${followerAddress.toLowerCase()}`;
  const followingKey = `followers:${followingAddress.toLowerCase()}`;
  
  // Remove from sets
  await redis.srem(followerKey, followingAddress.toLowerCase());
  await redis.srem(followingKey, followerAddress.toLowerCase());
}

/**
 * Check if user A follows user B
 */
export async function isFollowing(followerAddress: string, followingAddress: string): Promise<boolean> {
  const followerKey = `follows:${followerAddress.toLowerCase()}`;
  const result = await redis.sismember(followerKey, followingAddress.toLowerCase());
  return result === 1;
}

/**
 * Get list of users that an address follows
 */
export async function getFollowing(address: string): Promise<string[]> {
  const key = `follows:${address.toLowerCase()}`;
  const members = await redis.smembers<string[]>(key);
  return members || [];
}

/**
 * Get list of users following an address
 */
export async function getFollowers(address: string): Promise<string[]> {
  const key = `followers:${address.toLowerCase()}`;
  const members = await redis.smembers<string[]>(key);
  return members || [];
}

/**
 * Get follower/following counts
 */
export async function getSocialStats(address: string): Promise<{
  followingCount: number;
  followersCount: number;
}> {
  const [following, followers] = await Promise.all([
    getFollowing(address),
    getFollowers(address),
  ]);
  
  return {
    followingCount: following.length,
    followersCount: followers.length,
  };
}

/**
 * Add activity to social feed
 */
export type ActivityType = 'portfolio_update' | 'achievement' | 'rank_change';

export type SocialActivity = {
  id: string;
  address: string;
  type: ActivityType;
  timestamp: number;
  data: Record<string, any>;
};

export async function addActivity(activity: Omit<SocialActivity, 'id'>): Promise<string> {
  const id = `${activity.address.toLowerCase()}-${activity.timestamp}`;
  const fullActivity: SocialActivity = { ...activity, id };
  
  // Store in sorted set with timestamp as score
  const key = `social:activity:${activity.address.toLowerCase()}`;
  
  await redis.zadd(key, {
    score: activity.timestamp,
    member: JSON.stringify(fullActivity),
  });
  
  // Set expiration (keep activities for 90 days)
  await redis.expire(key, 90 * 24 * 60 * 60);
  
  return id;
}

/**
 * Get activity feed for followed users
 */
export async function getActivityFeed(
  address: string,
  options?: {
    limit?: number;
    startTime?: number;
    endTime?: number;
  }
): Promise<SocialActivity[]> {
  const following = await getFollowing(address);
  
  if (following.length === 0) {
    return [];
  }
  
  const limit = options?.limit || 50;
  const startTime = options?.startTime || 0;
  const endTime = options?.endTime || Date.now();
  
  // Get activities from all followed users
  const allActivities: SocialActivity[] = [];
  
  for (const followedAddress of following) {
    const key = `social:activity:${followedAddress.toLowerCase()}`;
    
    const members = await redis.zrange<string[]>(
      key,
      startTime,
      endTime,
      {
        byScore: true,
        rev: true,
        limit: { count: 20, offset: 0 },
      }
    );
    
    if (members) {
      for (const member of members) {
        try {
          const activity = JSON.parse(member) as SocialActivity;
          allActivities.push(activity);
        } catch {
          continue;
        }
      }
    }
  }
  
  // Sort by timestamp (newest first) and limit
  allActivities.sort((a, b) => b.timestamp - a.timestamp);
  
  return allActivities.slice(0, limit);
}

/**
 * Copy portfolio from one user to another
 */
export async function copyPortfolio(
  fromAddress: string,
  toAddress: string,
  weekKey: string
): Promise<boolean> {
  try {
    // Get source portfolio
    const sourcePortfolio = await redis.hget<any>(weekKey, fromAddress);
    
    if (!sourcePortfolio) {
      return false;
    }
    
    // Save as destination portfolio
    await redis.hset(weekKey, {
      [toAddress]: sourcePortfolio,
    });
    
    // Add activity
    await addActivity({
      address: toAddress,
      type: 'portfolio_update',
      timestamp: Date.now(),
      data: {
        action: 'copied',
        fromAddress,
        weekKey,
      },
    });
    
    return true;
  } catch (error) {
    console.error('Error copying portfolio:', error);
    return false;
  }
}
