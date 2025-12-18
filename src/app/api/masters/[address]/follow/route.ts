import { NextRequest, NextResponse } from 'next/server';
import { followMaster, unfollowMaster, isFollowing } from '@/lib/masters';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const masterAddress = params.address.toLowerCase();
    const body = await request.json();
    const { userAddress, action } = body;

    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address required' },
        { status: 400 }
      );
    }

    if (action === 'follow') {
      await followMaster(userAddress, masterAddress);
      return NextResponse.json({ success: true, following: true });
    } else if (action === 'unfollow') {
      await unfollowMaster(userAddress, masterAddress);
      return NextResponse.json({ success: true, following: false });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "follow" or "unfollow"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    return NextResponse.json(
      { error: 'Failed to update follow status' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const masterAddress = params.address.toLowerCase();
    const searchParams = request.nextUrl.searchParams;
    const userAddress = searchParams.get('userAddress');

    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address required' },
        { status: 400 }
      );
    }

    const following = await isFollowing(userAddress, masterAddress);
    return NextResponse.json({ following });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json(
      { error: 'Failed to check follow status' },
      { status: 500 }
    );
  }
}




