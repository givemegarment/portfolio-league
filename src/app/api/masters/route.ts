import { NextRequest, NextResponse } from 'next/server';
import { getAllMasters, getMastersByNarrative, Master } from '@/lib/masters';
import { NarrativeType } from '@/lib/narratives';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const narrative = searchParams.get('narrative') as NarrativeType | null;
    const tier = searchParams.get('tier');
    const sortBy = searchParams.get('sortBy') || 'return7D';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get masters from Redis (with fallback to samples)
    let masters: Master[];
    
    if (narrative) {
      masters = await getMastersByNarrative(narrative);
    } else {
      masters = await getAllMasters();
    }

    // Filter by tier
    if (tier && tier !== 'all') {
      masters = masters.filter(m => m.tier === tier);
    }

    // Sort
    switch (sortBy) {
      case 'return1D':
        masters.sort((a, b) => b.performance.return1D - a.performance.return1D);
        break;
      case 'return7D':
        masters.sort((a, b) => b.performance.return7D - a.performance.return7D);
        break;
      case 'return30D':
        masters.sort((a, b) => b.performance.return30D - a.performance.return30D);
        break;
      case 'followers':
        masters.sort((a, b) => b.followerCount - a.followerCount);
        break;
      case 'emulators':
        masters.sort((a, b) => b.emulatorCount - a.emulatorCount);
        break;
      case 'sharpe':
        masters.sort((a, b) => b.performance.sharpeRatio - a.performance.sharpeRatio);
        break;
    }

    // Apply limit
    masters = masters.slice(0, limit);

    return NextResponse.json({
      masters,
      total: masters.length,
      filters: {
        narrative,
        tier,
        sortBy,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching masters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch masters' },
      { status: 500 }
    );
  }
}




