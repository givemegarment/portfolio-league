import { NextResponse } from 'next/server';
import { getReferralByCode, trackReferral, getReferredBy } from '@/lib/referrals';

/**
 * POST /api/referral/track
 * Track a referral when a new user saves their first portfolio
 * 
 * Body: { referralCode: string, newUserAddress: string }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { referralCode, newUserAddress } = body;

    if (!referralCode || !newUserAddress) {
      return NextResponse.json(
        { error: 'referralCode and newUserAddress required' }, 
        { status: 400 }
      );
    }

    // Look up the referral code
    const referral = await getReferralByCode(referralCode);
    
    if (!referral) {
      return NextResponse.json(
        { error: 'Invalid referral code' }, 
        { status: 404 }
      );
    }

    // Check if user was already referred
    const existingReferrer = await getReferredBy(newUserAddress);
    if (existingReferrer) {
      return NextResponse.json({
        success: false,
        message: 'User already referred by someone else',
        alreadyReferred: true,
      });
    }

    // Track the referral
    const result = await trackReferral(referral.ownerAddress, newUserAddress);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.error || 'Failed to track referral',
        isNew: result.isNew,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Referral tracked successfully',
      isNew: result.isNew,
      referrerAddress: referral.ownerAddress,
    });
  } catch (error) {
    console.error('Error tracking referral:', error);
    return NextResponse.json(
      { error: 'Failed to track referral' }, 
      { status: 500 }
    );
  }
}

/**
 * GET /api/referral/track?address=0x...
 * Check if an address was referred and by whom
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 });
  }

  const referredBy = await getReferredBy(address);

  return NextResponse.json({
    wasReferred: !!referredBy,
    referredBy: referredBy ? {
      address: referredBy,
      shortAddress: `${referredBy.slice(0, 6)}...${referredBy.slice(-4)}`,
    } : null,
  });
}









