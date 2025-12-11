import { NextRequest, NextResponse } from 'next/server';
import { MasterActivity, Master } from '@/app/types';

// Mock activity data - in production, fetch from blockchain indexer
function generateMockActivity(address: string): MasterActivity[] {
  const now = Date.now();
  const activities: MasterActivity[] = [
    {
      address,
      timestamp: now - 2 * 60 * 60 * 1000, // 2 hours ago
      type: 'swap',
      fromAsset: 'USDC_YIELD',
      toAsset: 'ETH',
      amount: 25000,
      txHash: '0x' + Math.random().toString(16).slice(2, 66),
    },
    {
      address,
      timestamp: now - 8 * 60 * 60 * 1000, // 8 hours ago
      type: 'stake',
      toAsset: 'ETH',
      amount: 10,
      txHash: '0x' + Math.random().toString(16).slice(2, 66),
    },
    {
      address,
      timestamp: now - 24 * 60 * 60 * 1000, // 1 day ago
      type: 'swap',
      fromAsset: 'BTC',
      toAsset: 'SOL',
      amount: 15000,
      txHash: '0x' + Math.random().toString(16).slice(2, 66),
    },
    {
      address,
      timestamp: now - 48 * 60 * 60 * 1000, // 2 days ago
      type: 'lp_add',
      fromAsset: 'ETH',
      toAsset: 'USDC_YIELD',
      amount: 50000,
      txHash: '0x' + Math.random().toString(16).slice(2, 66),
    },
    {
      address,
      timestamp: now - 72 * 60 * 60 * 1000, // 3 days ago
      type: 'swap',
      fromAsset: 'SOL',
      toAsset: 'BTC',
      amount: 8000,
      txHash: '0x' + Math.random().toString(16).slice(2, 66),
    },
  ];

  return activities;
}

// Mock master profile data
function getMasterProfile(address: string): Master | null {
  // In production, fetch from database or blockchain
  const mockProfiles: Record<string, Master> = {
    '0x1234567890abcdef1234567890abcdef12345678': {
      address,
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
  };

  return mockProfiles[address] || {
    address,
    category: 'general',
    performance30d: Math.random() * 50,
    performance7d: Math.random() * 15 - 5,
    followers: Math.floor(Math.random() * 200),
    currentHoldings: [
      { asset: 'ETH', percentage: 40 },
      { asset: 'BTC', percentage: 40 },
      { asset: 'SOL', percentage: 20 },
    ],
    riskProfile: 'moderate',
    verified: false,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since'); // timestamp
    const limit = parseInt(searchParams.get('limit') || '20');
    const types = searchParams.get('types')?.split(','); // filter by activity type

    // Validate address format
    if (!address || !address.startsWith('0x') || address.length !== 42) {
      return NextResponse.json(
        { success: false, error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // Get master profile
    const master = getMasterProfile(address);

    // Get activity
    let activities = generateMockActivity(address);

    // Filter by timestamp
    if (since) {
      const sinceTimestamp = parseInt(since);
      activities = activities.filter(a => a.timestamp >= sinceTimestamp);
    }

    // Filter by activity type
    if (types && types.length > 0) {
      activities = activities.filter(a => types.includes(a.type));
    }

    // Limit results
    activities = activities.slice(0, limit);

    // Calculate activity metrics
    const metrics = {
      totalTransactions: activities.length,
      swapCount: activities.filter(a => a.type === 'swap').length,
      stakeCount: activities.filter(a => a.type === 'stake' || a.type === 'unstake').length,
      lpCount: activities.filter(a => a.type === 'lp_add' || a.type === 'lp_remove').length,
      avgTimeBetweenTrades: activities.length > 1 
        ? Math.round((activities[0].timestamp - activities[activities.length - 1].timestamp) / activities.length / 3600000)
        : 0, // in hours
    };

    return NextResponse.json({
      success: true,
      data: {
        master,
        activities,
        metrics,
        lastUpdated: Date.now(),
      },
    });
  } catch (error) {
    console.error('Error fetching master activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch master activity' },
      { status: 500 }
    );
  }
}
