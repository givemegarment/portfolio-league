import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, assets, week } = body;

    // Validate input
    if (!address || !assets || assets.length !== 3 || !week) {
      return NextResponse.json(
        { error: 'Invalid input: address, 3 assets, and week required' },
        { status: 400 }
      );
    }

    // Check if portfolio already submitted for this week
    const existingEntry = await redis.hget(`portfolio:week:${week}`, address);
    if (existingEntry) {
      return NextResponse.json(
        { error: 'Portfolio already submitted for this week' },
        { status: 409 }
      );
    }

    // Fetch current prices for starting baseline
    const pricesResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/oracle/prices`);
    const prices = await pricesResponse.json();

    // Store portfolio submission
    const portfolioData = {
      address,
      assets,
      week,
      submittedAt: Date.now(),
      startPrices: {
        BTC: prices.BTC,
        ETH: prices.ETH,
        SOL: prices.SOL,
        USDC: 1.0, // Fixed at $1
      },
    };

    await redis.hset(`portfolio:week:${week}`, address, JSON.stringify(portfolioData));

    // Increment participant count
    await redis.incr(`participants:week:${week}`);

    return NextResponse.json({
      success: true,
      message: 'Portfolio submitted successfully',
      data: portfolioData,
    });
  } catch (error) {
    console.error('Error submitting portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const week = searchParams.get('week') || '1';

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter required' },
        { status: 400 }
      );
    }

    const portfolio = await redis.hget(`portfolio:week:${week}`, address);

    if (!portfolio) {
      return NextResponse.json({ portfolio: null });
    }

    return NextResponse.json({ portfolio: JSON.parse(portfolio as string) });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
