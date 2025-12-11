import { NextRequest, NextResponse } from 'next/server';
import { Chamber } from '@/app/types';

// Mock chambers storage - in production, use database
const CHAMBERS: Chamber[] = [
  {
    id: 'public-chamber-1',
    epoch: 1,
    startTime: Date.now() - 3 * 24 * 60 * 60 * 1000,
    endTime: Date.now() + 4 * 24 * 60 * 60 * 1000,
    status: 'active',
    treasury: 1000,
    scholars: 247,
    topDecileThreshold: 25,
    isPrivate: false,
  },
];

// GET - List chambers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includePrivate = searchParams.get('includePrivate') === 'true';
    const inviteCode = searchParams.get('inviteCode');

    let chambers = [...CHAMBERS];

    // Filter private chambers unless invite code provided
    if (!includePrivate) {
      chambers = chambers.filter(c => !c.isPrivate);
    }

    // If invite code provided, find that specific chamber
    if (inviteCode) {
      chambers = chambers.filter(c => c.inviteCode === inviteCode);
    }

    return NextResponse.json({
      success: true,
      data: {
        chambers,
        total: chambers.length,
      },
    });
  } catch (error) {
    console.error('Error listing chambers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list chambers' },
      { status: 500 }
    );
  }
}

// POST - Create new chamber
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      isPrivate = false,
      treasury = 100,
      epochDuration = 7, // days
      masterAddress, // Optional: require all scholars to study same master
    } = body;

    // Generate invite code for private chambers
    const inviteCode = isPrivate
      ? Math.random().toString(36).substring(2, 8).toUpperCase()
      : undefined;

    const newChamber: Chamber = {
      id: `chamber-${Date.now()}`,
      epoch: 1,
      startTime: Date.now(),
      endTime: Date.now() + epochDuration * 24 * 60 * 60 * 1000,
      status: 'active',
      treasury,
      scholars: 0,
      topDecileThreshold: 10,
      isPrivate,
      inviteCode,
    };

    // In production, save to database
    CHAMBERS.push(newChamber);

    return NextResponse.json({
      success: true,
      data: {
        chamber: newChamber,
        inviteCode,
        shareUrl: inviteCode ? `/join?code=${inviteCode}` : undefined,
      },
    });
  } catch (error) {
    console.error('Error creating chamber:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create chamber' },
      { status: 500 }
    );
  }
}
