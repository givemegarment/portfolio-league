import { NextResponse } from 'next/server';
import { 
  getOrCreateReferralCode, 
  getReferralStats, 
  getReferralByCode,
  getReferralCodeForAddress 
} from '@/lib/referrals';

/**
 * GET /api/referral?address=0x...
 * Get or create a referral code for an address
 * 
 * GET /api/referral?code=ABC123
 * Look up a referral code
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  const code = searchParams.get('code');

  // Lookup by code
  if (code) {
    const referral = await getReferralByCode(code);
    
    if (!referral) {
      return NextResponse.json({ error: 'Referral code not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      code: referral.code,
      ownerAddress: referral.ownerAddress,
      createdAt: referral.createdAt,
    });
  }

  // Get/create for address
  if (address) {
    try {
      const referralCode = await getOrCreateReferralCode(address);
      const stats = await getReferralStats(address);
      
      return NextResponse.json({
        code: referralCode.code,
        stats: stats ? {
          totalReferrals: stats.totalReferrals,
          totalBonusPoints: stats.totalBonusPoints,
          referredAddresses: stats.referredAddresses.map(addr => 
            `${addr.slice(0, 6)}...${addr.slice(-4)}`
          ),
        } : null,
        shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio-league.vercel.app'}?ref=${referralCode.code}`,
      });
    } catch (error) {
      console.error('Error creating referral code:', error);
      return NextResponse.json(
        { error: 'Failed to create referral code' }, 
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'address or code required' }, { status: 400 });
}

/**
 * POST /api/referral
 * Create a new referral code for an address
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json({ error: 'address required' }, { status: 400 });
    }

    const referralCode = await getOrCreateReferralCode(address);
    
    return NextResponse.json({
      code: referralCode.code,
      shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio-league.vercel.app'}?ref=${referralCode.code}`,
      createdAt: referralCode.createdAt,
    });
  } catch (error) {
    console.error('Error creating referral code:', error);
    return NextResponse.json(
      { error: 'Failed to create referral code' }, 
      { status: 500 }
    );
  }
}

