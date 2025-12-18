import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { getCurrentWeek, isLocked, getWeekKey } from '@/lib/weeks';
import { createPortfolioSubmitTransaction, createAllocationChangeTransaction } from '@/lib/transactions';

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

type SavePayload = {
  address: string;
  portfolio?: AllocationItem[];
  basket?: string[]; // Legacy format
};

type StoredPortfolio = {
  allocations: AllocationItem[];
  entryPrices: Record<string, number>;
  timestamp: number;
};

/**
 * Get the base URL for internal API calls
 */
function getBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  return 'http://localhost:3000';
}

/**
 * Fetch current prices from our prices API
 */
async function fetchCurrentPrices(): Promise<Record<string, number>> {
  const baseUrl = getBaseUrl();
  
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

  // Fetch current prices for entry snapshot
  const currentPrices = await fetchCurrentPrices();
  
  // Build entry prices map for the selected assets
  const entryPrices: Record<string, number> = {};
  for (const allocation of allocations) {
    const price = currentPrices[allocation.symbol];
    if (price) {
      entryPrices[allocation.symbol] = price;
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

  console.log(`[Portfolio Save] Attempting to save portfolio for ${body.address} to ${weekKey}`);
  console.log(`[Portfolio Save] Allocations:`, allocations);
  console.log(`[Portfolio Save] Entry prices:`, entryPrices);

  try {
    // Get existing portfolio to track changes
    const existingPortfolio = await redis.hget<StoredPortfolio>(weekKey, body.address);
    
    // Save to Redis - @upstash/redis auto-serializes objects, so don't use JSON.stringify
    await redis.hset(weekKey, {
      [body.address]: portfolioData,
    });
    
    // Track transaction
    try {
      if (existingPortfolio && existingPortfolio.allocations) {
        // This is an allocation change
        await createAllocationChangeTransaction(
          body.address,
          existingPortfolio.allocations,
          allocations,
          entryPrices
        );
      } else {
        // This is a new portfolio submission
        await createPortfolioSubmitTransaction(
          body.address,
          allocations,
          entryPrices
        );
      }
    } catch (txError) {
      // Don't fail the save if transaction tracking fails
      console.error('[Portfolio Save] Failed to track transaction:', txError);
    }
    
    console.log(`[Portfolio Save] Write completed, now verifying...`);
    
    // CRITICAL: Verify the write was successful by reading it back
    // @upstash/redis auto-deserializes, so we get an object back
    const verifiedData = await redis.hget<StoredPortfolio>(weekKey, body.address);
    
    if (!verifiedData) {
      console.error(`[Portfolio Save] VERIFICATION FAILED: Data not found after write for ${body.address}`);
      return NextResponse.json(
        { error: 'Portfolio save failed verification. Data was not persisted. Please try again.' },
        { status: 500 }
      );
    }
    
    // Verify the data matches what we saved
    if (!verifiedData.allocations || verifiedData.allocations.length !== allocations.length) {
      console.error(`[Portfolio Save] VERIFICATION FAILED: Data mismatch for ${body.address}`);
      console.error(`[Portfolio Save] Expected:`, portfolioData);
      console.error(`[Portfolio Save] Got:`, verifiedData);
      return NextResponse.json(
        { error: 'Portfolio save failed verification. Data mismatch. Please try again.' },
        { status: 500 }
      );
    }
    
    console.log(`[Portfolio Save] SUCCESS: Portfolio verified and saved for ${body.address}`);
    console.log(`[Portfolio Save] Verified data:`, verifiedData);
    
  } catch (error) {
    console.error('[Portfolio Save] Redis error:', error);
    return NextResponse.json(
      { error: 'Failed to save portfolio. Please try again later.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ 
    ok: true, 
    verified: true,
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
  
  console.log(`[Portfolio GET] Fetching portfolio for ${address} from ${weekKey}`);
  
  let portfolio: StoredPortfolio | null = null;
  let basket: string[] | null = null;
  let redisError = false;

  try {
    // @upstash/redis auto-deserializes JSON, so we get objects back directly
    // First try exact match, then try case-insensitive lookup
    let value = await redis.hget<StoredPortfolio | string[]>(weekKey, address);
    
    // If not found, try case-insensitive lookup
    if (!value) {
      console.log(`[Portfolio GET] Exact match not found, trying case-insensitive lookup...`);
      const allPortfolios = await redis.hgetall<Record<string, StoredPortfolio | string[]>>(weekKey);
      if (allPortfolios) {
        const matchingKey = Object.keys(allPortfolios).find(
          key => key.toLowerCase() === address.toLowerCase()
        );
        if (matchingKey) {
          value = allPortfolios[matchingKey];
          console.log(`[Portfolio GET] Found with case-insensitive match: ${matchingKey}`);
        }
      }
    }

    if (value) {
      console.log(`[Portfolio GET] Found portfolio data for ${address}`);
      
      // Handle new format with entryPrices (already deserialized by @upstash/redis)
      if (typeof value === 'object' && !Array.isArray(value) && value.allocations && Array.isArray(value.allocations)) {
        portfolio = value as StoredPortfolio;
        basket = portfolio.allocations.map((a: AllocationItem) => a.symbol);
        console.log(`[Portfolio GET] Loaded portfolio with ${portfolio.allocations.length} allocations`);
      }
      // Handle legacy format (just array of symbols)
      else if (Array.isArray(value)) {
        basket = value as string[];
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
        console.log(`[Portfolio GET] Loaded legacy format with ${basket.length} symbols`);
      }
      // Handle string data (corrupted/legacy) - try to parse it
      else if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (parsed.allocations && Array.isArray(parsed.allocations)) {
            portfolio = parsed as StoredPortfolio;
            basket = parsed.allocations.map((a: AllocationItem) => a.symbol);
            console.log(`[Portfolio GET] Parsed string portfolio with ${portfolio.allocations.length} allocations`);
          }
        } catch (parseError) {
          console.error(`[Portfolio GET] Failed to parse string portfolio data:`, parseError);
        }
      }
    } else {
      console.log(`[Portfolio GET] No portfolio found for ${address} in ${weekKey}`);
      
      // Debug: List all addresses in this week's portfolios
      try {
        const allPortfolios = await redis.hgetall<Record<string, unknown>>(weekKey);
        if (allPortfolios) {
          const addresses = Object.keys(allPortfolios);
          console.log(`[Portfolio GET] Total portfolios in ${weekKey}: ${addresses.length}`);
          console.log(`[Portfolio GET] Sample addresses:`, addresses.slice(0, 5));
        } else {
          console.log(`[Portfolio GET] No portfolios exist for ${weekKey}`);
        }
      } catch (debugError) {
        console.error(`[Portfolio GET] Debug query failed:`, debugError);
      }
    }
  } catch (error) {
    console.error('[Portfolio GET] Redis error:', error);
    redisError = true;
  }

  console.log(`[Portfolio GET] Returning portfolio=${!!portfolio}, basket=${!!basket}, redisError=${redisError}`);

  return NextResponse.json({ 
    address, 
    portfolio,
    basket,
    season, 
    week,
    isLocked: isLocked(),
    weekInfo: currentWeek,
    redisError,
  });
}
