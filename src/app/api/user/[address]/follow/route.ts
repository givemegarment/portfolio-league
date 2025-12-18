import { NextResponse } from 'next/server';
import { followUser, unfollowUser, isFollowing } from '@/lib/social';

/**
 * POST /api/user/[address]/follow
 * Body: { address: string, action: 'follow' | 'unfollow' }
 * 
 * Follow or unfollow a user
 */
export async function POST(
  req: Request,
  { params }: { params: { address: string } }
) {
  try {
    const body = await req.json();
    const { address: followerAddress, action } = body;
    const followingAddress = params.address;

    if (!followerAddress || !followingAddress) {
      return NextResponse.json(
        { error: 'Both addresses required' },
        { status: 400 }
      );
    }

    if (followerAddress.toLowerCase() === followingAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    if (action === 'follow') {
      await followUser(followerAddress, followingAddress);
      return NextResponse.json({ ok: true, following: true });
    } else if (action === 'unfollow') {
      await unfollowUser(followerAddress, followingAddress);
      return NextResponse.json({ ok: true, following: false });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "follow" or "unfollow"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in follow API:', error);
    return NextResponse.json(
      { error: 'Failed to update follow status' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/[address]/follow?follower=0x...
 * 
 * Check if follower follows this address
 */
export async function GET(
  req: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const followerAddress = searchParams.get('follower');
    const followingAddress = params.address;

    if (!followerAddress) {
      return NextResponse.json(
        { error: 'follower address required' },
        { status: 400 }
      );
    }

    const following = await isFollowing(followerAddress, followingAddress);

    return NextResponse.json({
      following,
      follower: followerAddress,
      followingUser: followingAddress,
    });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json(
      { error: 'Failed to check follow status' },
      { status: 500 }
    );
  }
}
