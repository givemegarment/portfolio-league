import { NextResponse } from 'next/server';
import { copyPortfolio } from '@/lib/social';
import { getCurrentWeek, getWeekKey } from '@/lib/weeks';

/**
 * POST /api/portfolio/copy?from=0x...&to=0x...
 * 
 * Copy portfolio from one user to another
 */
export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fromAddress = searchParams.get('from');
    const toAddress = searchParams.get('to');
    const seasonParam = searchParams.get('season');
    const weekParam = searchParams.get('week');

    if (!fromAddress || !toAddress) {
      return NextResponse.json(
        { error: 'Both from and to addresses required' },
        { status: 400 }
      );
    }

    if (fromAddress.toLowerCase() === toAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Cannot copy portfolio to yourself' },
        { status: 400 }
      );
    }

    // Get week key
    const currentWeek = getCurrentWeek();
    const season = seasonParam || currentWeek.season;
    const week = weekParam ? parseInt(weekParam) : currentWeek.week;
    const weekKey = getWeekKey(season, week);

    const success = await copyPortfolio(fromAddress, toAddress, weekKey);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to copy portfolio. Source portfolio may not exist.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Portfolio copied successfully',
      from: fromAddress,
      to: toAddress,
      week: { season, week },
    });
  } catch (error) {
    console.error('Error copying portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to copy portfolio' },
      { status: 500 }
    );
  }
}
