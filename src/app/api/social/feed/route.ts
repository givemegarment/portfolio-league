import { NextResponse } from 'next/server';
import { getActivityFeed } from '@/lib/social';

/**
 * GET /api/social/feed?address=0x...&limit=50
 * 
 * Get activity feed for followed users
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    const limitParam = searchParams.get('limit');
    const startTimeParam = searchParams.get('startTime');
    const endTimeParam = searchParams.get('endTime');

    if (!address) {
      return NextResponse.json(
        { error: 'address required' },
        { status: 400 }
      );
    }

    const limit = limitParam ? parseInt(limitParam) : 50;
    const startTime = startTimeParam ? parseInt(startTimeParam) : undefined;
    const endTime = endTimeParam ? parseInt(endTimeParam) : undefined;

    const activities = await getActivityFeed(address, {
      limit,
      startTime,
      endTime,
    });

    return NextResponse.json({
      address,
      activities,
      count: activities.length,
    });
  } catch (error) {
    console.error('Error fetching social feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social feed' },
      { status: 500 }
    );
  }
}
