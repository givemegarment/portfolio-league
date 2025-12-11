import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const EMAIL_SUBSCRIPTIONS_KEY = 'email:subscriptions';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio-league.vercel.app';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.redirect(`${SITE_URL}?error=missing_address`);
    }

    // Remove subscription from Redis
    await redis.hdel(EMAIL_SUBSCRIPTIONS_KEY, address.toLowerCase());

    // Redirect to success page with message
    return NextResponse.redirect(`${SITE_URL}?unsubscribed=true`);
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return NextResponse.redirect(`${SITE_URL}?error=unsubscribe_failed`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Remove subscription from Redis
    await redis.hdel(EMAIL_SUBSCRIPTIONS_KEY, address.toLowerCase());

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from email notifications',
    });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}


