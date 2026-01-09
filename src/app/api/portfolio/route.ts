import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { getCurrentWeek, isLocked, getWeekKey } from '@/lib/weeks';
import { calculateScore, type StoredPortfolio as ScoringStoredPortfolio, type PriceData as ScoringPriceData } from '@/lib/scoring';

type AllocationItem = {
  symbol: string;
  percentage: number;
};

type PriceData = {
  price: number;
  change24h: number;
};

type PricesResponse = {
  prices: Record<string, PriceData>;
  lastUpdated: number;
  cached: boolean;
};

type PriceDataWithChange = {
  price: number;
  change24h: number;
};

type SavePayload = {
  address: string;
  portfolio?: AllocationItem[];
  basket?: string[]; // Legacy format
  entryPrices?: Record<string, number>; // Client-validated entry prices
  priceTimestamp?: number; // Timestamp of validated prices
};

type StoredPortfolio = {
  allocations: AllocationItem[];
  entryPrices: Record<string, number>;
  timestamp: number;
};

/**
 * Fetch current prices from our prices API
 */
async function fetchCurrentPrices(): Promise<Record<string, number>> {
  // Use internal API call
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/prices`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch prices');
    }
    
    const data: PricesResponse = await response.json();
    
    // Transform to simple price map
    const prices: Record<string, number> = {};
    for (const [symbol, priceData] of Object.entries(data.prices)) {
      prices[symbol] = priceData.price;
    }
    
    return prices;
  } catch (error) {
    console.error('Error fetching prices:', error);
    // Fallback prices if API fails (should not happen in production)
    return {
      BTC: 97000,
      ETH: 3600,
      SOL: 230,
      USDC: 1,
    };
  }
}

/**
 * Fetch current prices with full PriceData format for scoring
 */
async function fetchCurrentPricesWithData(): Promise<Record<string, ScoringPriceData>> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/prices`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch prices');
    }
    
    const data: PricesResponse = await response.json();
    // Convert to ScoringPriceData format (only needs price, change24h is optional)
    const scoringPrices: Record<string, ScoringPriceData> = {};
    for (const [symbol, priceData] of Object.entries(data.prices)) {
      scoringPrices[symbol] = {
        price: priceData.price,
        change24h: priceData.change24h,
      };
    }
    return scoringPrices;
  } catch (error) {
    console.error('Error fetching prices:', error);
    // Fallback prices
    return {
      BTC: { price: 97000, change24h: 0 },
      ETH: { price: 3600, change24h: 0 },
      SOL: { price: 230, change24h: 0 },
      USDC: { price: 1, change24h: 0 },
    };
  }
}

export async function POST(req: Request) {
  const body = (await req.json()) as SavePayload;

  if (!body?.address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  // Check if picks are locked
  if (isLocked()) {
    return NextResponse.json(
      { error: 'Picks are locked for this week. Come back next Monday!' },
      { status: 403 }
    );
  }

  let allocations: AllocationItem[] = [];

  // Handle new format with percentages
  if (body.portfolio && Array.isArray(body.portfolio)) {
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

  // Check if client provided validated prices (from price validation)
  const MAX_PRICE_AGE_MS = 30 * 1000; // 30 seconds
  const now = Date.now();
  let entryPrices: Record<string, number> = {};

  if (body.entryPrices && body.priceTimestamp) {
    const priceAge = now - body.priceTimestamp;

    // Validate that client-provided prices are fresh enough
    if (priceAge < MAX_PRICE_AGE_MS) {
      // Use client-validated prices
      entryPrices = body.entryPrices;
    } else {
      // Client prices are too old, fetch fresh ones
      console.warn(`Client prices are ${Math.floor(priceAge / 1000)}s old, fetching fresh prices`);
      const currentPrices = await fetchCurrentPrices();
      for (const allocation of allocations) {
        const price = currentPrices[allocation.symbol];
        if (price) {
          entryPrices[allocation.symbol] = price;
        }
      }
    }
  } else {
    // No client prices provided, fetch from API (fallback for older clients)
    const currentPrices = await fetchCurrentPrices();
    for (const allocation of allocations) {
      const price = currentPrices[allocation.symbol];
      if (price) {
        entryPrices[allocation.symbol] = price;
      }
    }
  }

  // Get current week info
  const { season, week } = getCurrentWeek();
  const weekKey = getWeekKey(season, week);

  const portfolioData: StoredPortfolio = {
    allocations,
    entryPrices,
    timestamp: Date.now(),
  };

  await redis.hset(weekKey, {
    [body.address]: JSON.stringify(portfolioData),
  });

  return NextResponse.json({ 
    ok: true, 
    portfolio: portfolioData,
    week: { season, week },
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  const seasonParam = searchParams.get('season');
  const weekParam = searchParams.get('week');

  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 });
  }

  // Use current week if not specified
  const currentWeek = getCurrentWeek();
  const season = seasonParam ?? currentWeek.season;
  const week = weekParam ? Number(weekParam) : currentWeek.week;

  const weekKey = getWeekKey(season, week);
  const value = await redis.hget<string>(weekKey, address);

  let portfolio: StoredPortfolio | null = null;
  let basket: string[] | null = null;

  if (value) {
    try {
      const parsed = JSON.parse(value);
      
      // Handle new format with entryPrices
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
          entryPrices: {}, // No entry prices for legacy data
          timestamp: 0,
        };
      }
    } catch {
      // Invalid JSON, ignore
    }
  }

  // Calculate current score if portfolio has entry prices
  let currentScore: number | undefined = undefined;
  let scoreBreakdown: Array<{
    symbol: string;
    percentage: number;
    assetReturn: number;
    weightedReturn: number;
  }> = [];
  let currentPrices: Record<string, ScoringPriceData> | undefined = undefined;

  if (portfolio && portfolio.entryPrices && Object.keys(portfolio.entryPrices).length > 0) {
    try {
      currentPrices = await fetchCurrentPricesWithData();
      
      // Convert to ScoringStoredPortfolio format
      const scoringPortfolio: ScoringStoredPortfolio = {
        allocations: portfolio.allocations,
        entryPrices: portfolio.entryPrices,
        timestamp: portfolio.timestamp,
      };
      
      const result = calculateScore(scoringPortfolio, currentPrices);
      currentScore = result.totalScore;
      scoreBreakdown = result.breakdown;
    } catch (error) {
      console.error('Error calculating current score:', error);
      // Continue without score
    }
  }

  return NextResponse.json({ 
    address, 
    portfolio,
    basket,
    season, 
    week,
    isLocked: isLocked(),
    weekInfo: currentWeek,
    currentScore,
    scoreBreakdown,
    currentPrices: currentPrices ? Object.fromEntries(
      Object.entries(currentPrices).map(([k, v]) => [k, v.price])
    ) : undefined,
  });
}
