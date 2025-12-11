import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { isAdmin, type PrizePoolConfig } from '@/lib/admin';

const PRIZE_POOL_KEY = 'config:prizePool';

const DEFAULT_CONFIG: PrizePoolConfig = {
  total: 1000,
  distribution: {
    first: 500,
    second: 250,
    third: 150,
    topTen: 100,
  },
  currency: 'USD',
};

export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const address = request.headers.get('x-admin-address');
    
    if (!address || !isAdmin(address)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await redis.get(PRIZE_POOL_KEY);
    
    if (!data) {
      return NextResponse.json(DEFAULT_CONFIG);
    }

    return NextResponse.json(JSON.parse(data as string));
  } catch (error) {
    console.error('Error fetching prize pool config:', error);
    return NextResponse.json(DEFAULT_CONFIG);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    const address = request.headers.get('x-admin-address');
    
    if (!address || !isAdmin(address)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const config: PrizePoolConfig = {
      total: body.total ?? DEFAULT_CONFIG.total,
      distribution: {
        first: body.distribution?.first ?? DEFAULT_CONFIG.distribution.first,
        second: body.distribution?.second ?? DEFAULT_CONFIG.distribution.second,
        third: body.distribution?.third ?? DEFAULT_CONFIG.distribution.third,
        topTen: body.distribution?.topTen ?? DEFAULT_CONFIG.distribution.topTen,
      },
      currency: body.currency ?? DEFAULT_CONFIG.currency,
      sponsoredBy: body.sponsoredBy,
    };

    await redis.set(PRIZE_POOL_KEY, JSON.stringify(config));

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error) {
    console.error('Error updating prize pool config:', error);
    return NextResponse.json(
      { error: 'Failed to update prize pool' },
      { status: 500 }
    );
  }
}


