import { NextResponse } from 'next/server';
import { getFollowing, getFollowers, getSocialStats } from '@/lib/social';

/**
 * GET /api/user/[address]/following
 * 
 * Get list of users that this address follows
 */
export async function GET(
  req: Request,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address;
    const following = await getFollowing(address);
    const stats = await getSocialStats(address);

    return NextResponse.json({
      address,
      following,
      stats,
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    return NextResponse.json(
      { error: 'Failed to fetch following list' },
      { status: 500 }
    );
  }
}
