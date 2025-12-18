import { NextResponse } from 'next/server';
import { getFollowers, getSocialStats } from '@/lib/social';

/**
 * GET /api/user/[address]/followers
 * 
 * Get list of users following this address
 */
export async function GET(
  req: Request,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address;
    const followers = await getFollowers(address);
    const stats = await getSocialStats(address);

    return NextResponse.json({
      address,
      followers,
      stats,
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch followers list' },
      { status: 500 }
    );
  }
}
