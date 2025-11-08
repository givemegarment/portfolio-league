import { NextResponse } from 'next/server';
import { SeasonBadge } from '@/app/types';

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    // Mock badge data - in production, query NFT contract and metadata
    const badges: SeasonBadge[] = Array.from({ length: 3 }, (_, i) => ({
      tokenId: 1000 + i,
      season: 39 + i,
      userId: address,
      rank: Math.floor(Math.random() * 50) + 1,
      returns: Math.random() * 30 - 5,
      mintedAt: Date.now() - (3 - i) * 7 * 24 * 60 * 60 * 1000,
      metadata: {
        image: `https://portfolio-league.base.org/badges/${1000 + i}.png`,
        attributes: [
          {
            trait_type: 'Season',
            value: (39 + i).toString(),
          },
          {
            trait_type: 'Rank',
            value: Math.floor(Math.random() * 50) + 1,
          },
          {
            trait_type: 'Returns',
            value: `${(Math.random() * 30 - 5).toFixed(2)}%`,
          },
          {
            trait_type: 'Tier',
            value: Math.random() > 0.9 ? 'Gold' : Math.random() > 0.7 ? 'Silver' : 'Bronze',
          },
        ],
      },
    }));

    return NextResponse.json({ badges });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}
