import { NextResponse } from 'next/server';
import { getBonusData, getReferralStats } from '@/lib/referrals';

/**
 * GET /api/bonuses?address=0x...
 * Get bonus points and history for an address
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 });
  }

  try {
    const bonusData = await getBonusData(address);
    const referralStats = await getReferralStats(address);

    return NextResponse.json({
      address,
      totalPoints: bonusData?.totalPoints || 0,
      history: bonusData?.history || [],
      referrals: referralStats ? {
        code: referralStats.code,
        totalReferrals: referralStats.totalReferrals,
        referralPoints: referralStats.totalReferrals * 100, // 100 points per referral
      } : null,
    });
  } catch (error) {
    console.error('Error fetching bonus data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bonus data' },
      { status: 500 }
    );
  }
}









