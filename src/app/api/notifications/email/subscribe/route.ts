import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { sendWelcomeEmail, type EmailSubscription } from '@/lib/email';

const EMAIL_SUBSCRIPTIONS_KEY = 'email:subscriptions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, address, preferences } = body;

    // Validate input
    if (!email || !address) {
      return NextResponse.json(
        { error: 'Email and address are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate address format
    if (!address.startsWith('0x') || address.length !== 42) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Create subscription
    const subscription: EmailSubscription = {
      email: email.toLowerCase(),
      address: address.toLowerCase(),
      subscribedAt: Date.now(),
      preferences: {
        weeklyDigest: preferences?.weeklyDigest ?? true,
        achievements: preferences?.achievements ?? true,
        leaderboardUpdates: preferences?.leaderboardUpdates ?? true,
      },
    };

    // Store in Redis (using address as key for easy lookup)
    await redis.hset(EMAIL_SUBSCRIPTIONS_KEY, address.toLowerCase(), JSON.stringify(subscription));

    // Send welcome email
    await sendWelcomeEmail({ email: subscription.email, address: subscription.address });

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to email notifications',
      subscription: {
        email: subscription.email,
        address: subscription.address,
        preferences: subscription.preferences,
      },
    });
  } catch (error) {
    console.error('Error subscribing to email:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Get subscription from Redis
    const data = await redis.hget(EMAIL_SUBSCRIPTIONS_KEY, address.toLowerCase());
    
    if (!data) {
      return NextResponse.json({
        subscribed: false,
      });
    }

    const subscription = JSON.parse(data as string) as EmailSubscription;

    return NextResponse.json({
      subscribed: true,
      subscription: {
        email: subscription.email,
        preferences: subscription.preferences,
      },
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription' },
      { status: 500 }
    );
  }
}
