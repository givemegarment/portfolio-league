import { NextRequest, NextResponse } from 'next/server';
import { Master } from '@/app/types';

// Mock curated master wallets - in production, integrate with Nansen/Arkham/custom indexer
const CURATED_MASTERS: Master[] = [
  {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    alias: 'DeFi Whale Alpha',
    category: 'defi',
    performance30d: 34.5,
    performance7d: 8.2,
    followers: 247,
    currentHoldings: [
      { asset: 'ETH', percentage: 45 },
      { asset: 'BTC', percentage: 35 },
      { asset: 'SOL', percentage: 20 },
    ],
    riskProfile: 'aggressive',
    verified: true,
  },
  {
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    alias: 'Yield Optimizer',
    category: 'yield',
    performance30d: 18.3,
    performance7d: 4.1,
    followers: 189,
    currentHoldings: [
      { asset: 'USDC_YIELD', percentage: 50 },
      { asset: 'ETH', percentage: 30 },
      { asset: 'BTC', percentage: 20 },
    ],
    riskProfile: 'conservative',
    verified: true,
  },
  {
    address: '0x9876543210fedcba9876543210fedcba98765432',
    alias: 'Momentum Trader',
    category: 'momentum',
    performance30d: 52.1,
    performance7d: -3.4,
    followers: 312,
    currentHoldings: [
      { asset: 'SOL', percentage: 60 },
      { asset: 'ETH', percentage: 25 },
      { asset: 'BTC', percentage: 15 },
    ],
    riskProfile: 'aggressive',
    verified: true,
  },
  {
    address: '0xfedcba9876543210fedcba9876543210fedcba98',
    alias: 'Blue Chip Holder',
    category: 'general',
    performance30d: 12.7,
    performance7d: 2.8,
    followers: 156,
    currentHoldings: [
      { asset: 'BTC', percentage: 50 },
      { asset: 'ETH', percentage: 40 },
      { asset: 'USDC_YIELD', percentage: 10 },
    ],
    riskProfile: 'moderate',
    verified: true,
  },
  {
    address: '0x5555666677778888999900001111222233334444',
    alias: 'Emerging Alpha',
    category: 'defi',
    performance30d: 67.3,
    performance7d: 15.2,
    followers: 89,
    currentHoldings: [
      { asset: 'SOL', percentage: 45 },
      { asset: 'ETH', percentage: 35 },
      { asset: 'BTC', percentage: 20 },
    ],
    riskProfile: 'aggressive',
    verified: false,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const riskProfile = searchParams.get('risk');
    const verified = searchParams.get('verified');
    const sortBy = searchParams.get('sortBy') || 'performance30d';
    const limit = parseInt(searchParams.get('limit') || '10');

    let masters = [...CURATED_MASTERS];

    // Filter by category
    if (category && category !== 'all') {
      masters = masters.filter(m => m.category === category);
    }

    // Filter by risk profile
    if (riskProfile && riskProfile !== 'all') {
      masters = masters.filter(m => m.riskProfile === riskProfile);
    }

    // Filter by verified status
    if (verified === 'true') {
      masters = masters.filter(m => m.verified);
    }

    // Sort
    masters.sort((a, b) => {
      switch (sortBy) {
        case 'performance30d':
          return b.performance30d - a.performance30d;
        case 'performance7d':
          return b.performance7d - a.performance7d;
        case 'followers':
          return b.followers - a.followers;
        default:
          return b.performance30d - a.performance30d;
      }
    });

    // Limit results
    masters = masters.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        masters,
        total: masters.length,
        categories: ['defi', 'nft', 'yield', 'momentum', 'general'],
        riskProfiles: ['conservative', 'moderate', 'aggressive'],
      },
    });
  } catch (error) {
    console.error('Error discovering masters:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to discover masters' },
      { status: 500 }
    );
  }
}
