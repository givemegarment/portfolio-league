import { NextRequest, NextResponse } from 'next/server';
import { getMaster } from '@/lib/masters';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address.toLowerCase();

    const master = await getMaster(address);

    if (!master) {
      return NextResponse.json(
        { error: 'Master not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(master);
  } catch (error) {
    console.error('Error fetching master:', error);
    return NextResponse.json(
      { error: 'Failed to fetch master' },
      { status: 500 }
    );
  }
}




