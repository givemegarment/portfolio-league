import { NextResponse } from 'next/server';
import { getTransactions, getTransactionStats } from '@/lib/transactions';

/**
 * GET /api/portfolio/transactions?address=0x...&startTime=...&endTime=...&limit=50&type=...
 * 
 * Returns transaction history for an address
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  const startTimeParam = searchParams.get('startTime');
  const endTimeParam = searchParams.get('endTime');
  const limitParam = searchParams.get('limit');
  const typeParam = searchParams.get('type');

  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 });
  }

  const startTime = startTimeParam ? parseInt(startTimeParam) : undefined;
  const endTime = endTimeParam ? parseInt(endTimeParam) : undefined;
  const limit = limitParam ? parseInt(limitParam) : 50;
  const type = typeParam as 'allocation_change' | 'portfolio_submit' | undefined;

  try {
    const transactions = await getTransactions(address, {
      startTime,
      endTime,
      limit,
      type,
    });

    // Get transaction statistics
    const stats = await getTransactionStats(address);

    return NextResponse.json({
      address,
      transactions,
      stats,
      count: transactions.length,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
