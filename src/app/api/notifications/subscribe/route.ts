import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const SUBSCRIPTIONS_KEY = 'push:subscriptions';

type PushSubscription = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAddress?: string;
  subscribedAt: number;
};

/**
 * POST /api/notifications/subscribe
 * 
 * Store a push notification subscription
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subscription, userAddress } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription' },
        { status: 400 }
      );
    }

    // Create subscription record
    const subscriptionData: PushSubscription = {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userAddress: userAddress || undefined,
      subscribedAt: Date.now(),
    };

    // Store in Redis using endpoint as key
    const subscriptionKey = Buffer.from(subscription.endpoint).toString('base64');
    
    await redis.hset(SUBSCRIPTIONS_KEY, {
      [subscriptionKey]: JSON.stringify(subscriptionData),
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription saved',
    });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/subscribe
 * 
 * Remove a push notification subscription
 */
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint required' },
        { status: 400 }
      );
    }

    const subscriptionKey = Buffer.from(endpoint).toString('base64');
    await redis.hdel(SUBSCRIPTIONS_KEY, subscriptionKey);

    return NextResponse.json({
      success: true,
      message: 'Subscription removed',
    });
  } catch (error) {
    console.error('Error removing push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications/subscribe
 * 
 * Get subscription count (for admin/stats)
 */
export async function GET() {
  try {
    const subscriptions = await redis.hgetall(SUBSCRIPTIONS_KEY);
    const count = subscriptions ? Object.keys(subscriptions).length : 0;

    return NextResponse.json({
      count,
      lastUpdated: Date.now(),
    });
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    return NextResponse.json({
      count: 0,
      lastUpdated: Date.now(),
    });
  }
}



