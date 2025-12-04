import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

type AllocationItem = {
  symbol: string;
  percentage: number;
};

type SavePayload = {
  address: string;
  portfolio?: AllocationItem[];  // New format with percentages
  basket?: string[];             // Legacy format (equal weights)
  week?: number;
  season?: string;
};

type StoredPortfolio = {
  allocations: AllocationItem[];
  timestamp: number;
};

export async function POST(req: Request) {
  const body = (await req.json()) as SavePayload;

  if (!body?.address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  let allocations: AllocationItem[] = [];

  // Handle new format with percentages
  if (body.portfolio && Array.isArray(body.portfolio)) {
    // Validate allocations
    const totalPercentage = body.portfolio.reduce((sum, item) => sum + item.percentage, 0);
    
    if (totalPercentage !== 100) {
      return NextResponse.json({ error: 'Allocations must total 100%' }, { status: 400 });
    }
    
    if (body.portfolio.some(item => item.percentage < 0 || item.percentage > 100)) {
      return NextResponse.json({ error: 'Invalid percentage values' }, { status: 400 });
    }
    
    allocations = body.portfolio.filter(item => item.percentage > 0);
  }
  // Handle legacy format (equal weights)
  else if (body.basket && Array.isArray(body.basket) && body.basket.length > 0) {
    const equalWeight = Math.floor(100 / body.basket.length);
    const remainder = 100 - (equalWeight * body.basket.length);
    
    allocations = body.basket.map((symbol, idx) => ({
      symbol,
      percentage: equalWeight + (idx === 0 ? remainder : 0),
    }));
  }
  else {
    return NextResponse.json({ error: 'Portfolio or basket required' }, { status: 400 });
  }

  if (allocations.length === 0) {
    return NextResponse.json({ error: 'At least one allocation required' }, { status: 400 });
  }

  const season = body.season ?? 's1';
  const week = body.week ?? 1;

  const portfolioData: StoredPortfolio = {
    allocations,
    timestamp: Date.now(),
  };

  await redis.hset(`portfolio:${season}:${week}`, {
    [body.address]: JSON.stringify(portfolioData),
  });

  return NextResponse.json({ ok: true, portfolio: portfolioData });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  const season = searchParams.get('season') ?? 's1';
  const week = Number(searchParams.get('week') ?? 1);

  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 });
  }

  const value = await redis.hget<string>(`portfolio:${season}:${week}`, address);

  let portfolio: StoredPortfolio | null = null;
  let basket: string[] | null = null;

  if (value) {
    try {
      const parsed = JSON.parse(value);
      
      // Handle new format
      if (parsed.allocations && Array.isArray(parsed.allocations)) {
        portfolio = parsed as StoredPortfolio;
        basket = parsed.allocations.map((a: AllocationItem) => a.symbol);
      }
      // Handle legacy format (just array of symbols)
      else if (Array.isArray(parsed)) {
        basket = parsed as string[];
        const equalWeight = Math.floor(100 / basket.length);
        const remainder = 100 - (equalWeight * basket.length);
        
        portfolio = {
          allocations: basket.map((symbol, idx) => ({
            symbol,
            percentage: equalWeight + (idx === 0 ? remainder : 0),
          })),
          timestamp: 0,
        };
      }
    } catch {
      // Invalid JSON, ignore
    }
  }

  return NextResponse.json({ 
    address, 
    portfolio,
    basket, // Keep for backwards compatibility
    season, 
    week 
  });
}
