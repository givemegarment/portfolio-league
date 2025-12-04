import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { getCurrentWeek, getWeekKey } from '@/lib/weeks';
import { calculateScore, type StoredPortfolio, type PriceData } from '@/lib/scoring';

// Simple ID generator
function generateId(length = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

type Challenge = {
  id: string;
  challengerAddress: string;
  challengedAddress: string | null;
  season: string;
  week: number;
  status: 'open' | 'accepted' | 'completed' | 'expired';
  createdAt: number;
  acceptedAt: number | null;
  winnerId: string | null;
  challengerScore: number | null;
  challengedScore: number | null;
};

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio-league.vercel.app';

/**
 * GET - Fetch challenges
 * /api/challenge?address=0x... - Get all challenges for an address
 * /api/challenge?id=xxx - Get specific challenge
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const address = searchParams.get('address');
  const { season, week } = getCurrentWeek();

  // Get specific challenge by ID
  if (id) {
    const challenge = await redis.hget<string>(`challenges:${season}:${week}`, id);
    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }
    
    const parsed: Challenge = JSON.parse(challenge);
    
    // Fetch portfolio data for both parties
    const weekKey = getWeekKey(season, week);
    const challengerPortfolioJson = await redis.hget<string>(weekKey, parsed.challengerAddress);
    let challengedPortfolioJson = null;
    if (parsed.challengedAddress) {
      challengedPortfolioJson = await redis.hget<string>(weekKey, parsed.challengedAddress);
    }

    // Calculate current scores if portfolios exist
    let challengerScore = parsed.challengerScore;
    let challengedScore = parsed.challengedScore;

    try {
      const pricesRes = await fetch(`${BASE_URL}/api/prices`);
      if (pricesRes.ok) {
        const pricesData = await pricesRes.json();
        
        if (challengerPortfolioJson) {
          const portfolio: StoredPortfolio = JSON.parse(challengerPortfolioJson);
          if (portfolio.entryPrices && Object.keys(portfolio.entryPrices).length > 0) {
            const result = calculateScore(portfolio, pricesData.prices);
            challengerScore = result.totalScore;
          }
        }
        
        if (challengedPortfolioJson) {
          const portfolio: StoredPortfolio = JSON.parse(challengedPortfolioJson);
          if (portfolio.entryPrices && Object.keys(portfolio.entryPrices).length > 0) {
            const result = calculateScore(portfolio, pricesData.prices);
            challengedScore = result.totalScore;
          }
        }
      }
    } catch (e) {
      console.error('Error calculating challenge scores:', e);
    }

    // Parse portfolios for response
    let challengerPortfolio = null;
    let challengedPortfolio = null;
    
    if (challengerPortfolioJson) {
      challengerPortfolio = JSON.parse(challengerPortfolioJson);
    }
    if (challengedPortfolioJson) {
      challengedPortfolio = JSON.parse(challengedPortfolioJson);
    }

    return NextResponse.json({
      ...parsed,
      challengerScore,
      challengedScore,
      challengerPortfolio,
      challengedPortfolio,
    });
  }

  // Get challenges for an address
  if (address) {
    const allChallenges = await redis.hgetall<Record<string, string>>(`challenges:${season}:${week}`);
    
    if (!allChallenges) {
      return NextResponse.json({ sent: [], received: [] });
    }

    const sent: Challenge[] = [];
    const received: Challenge[] = [];

    for (const [, challengeJson] of Object.entries(allChallenges)) {
      const challenge: Challenge = JSON.parse(challengeJson);
      
      if (challenge.challengerAddress.toLowerCase() === address.toLowerCase()) {
        sent.push(challenge);
      }
      if (challenge.challengedAddress?.toLowerCase() === address.toLowerCase()) {
        received.push(challenge);
      }
    }

    return NextResponse.json({ sent, received });
  }

  return NextResponse.json({ error: 'Address or ID required' }, { status: 400 });
}

/**
 * POST - Create or accept a challenge
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, challengerAddress, challengedAddress, challengeId } = body;
  const { season, week, isLocked } = getCurrentWeek();

  // Create a new challenge
  if (action === 'create') {
    if (!challengerAddress) {
      return NextResponse.json({ error: 'Challenger address required' }, { status: 400 });
    }

    // Verify challenger has a portfolio
    const weekKey = getWeekKey(season, week);
    const portfolioJson = await redis.hget<string>(weekKey, challengerAddress);
    
    if (!portfolioJson) {
      return NextResponse.json({ error: 'You must have a portfolio to create a challenge' }, { status: 400 });
    }

    const id = generateId(10);
    const challenge: Challenge = {
      id,
      challengerAddress,
      challengedAddress: challengedAddress || null,
      season,
      week,
      status: 'open',
      createdAt: Date.now(),
      acceptedAt: null,
      winnerId: null,
      challengerScore: null,
      challengedScore: null,
    };

    await redis.hset(`challenges:${season}:${week}`, {
      [id]: JSON.stringify(challenge),
    });

    return NextResponse.json({
      ok: true,
      challenge,
      shareUrl: `${BASE_URL}/api/frame/challenge/${id}`,
    });
  }

  // Accept a challenge
  if (action === 'accept') {
    if (!challengeId || !challengedAddress) {
      return NextResponse.json({ error: 'Challenge ID and address required' }, { status: 400 });
    }

    // Verify challenged party has a portfolio
    const weekKey = getWeekKey(season, week);
    const portfolioJson = await redis.hget<string>(weekKey, challengedAddress);
    
    if (!portfolioJson) {
      return NextResponse.json({ error: 'You must have a portfolio to accept a challenge' }, { status: 400 });
    }

    // Get and update challenge
    const challengeJson = await redis.hget<string>(`challenges:${season}:${week}`, challengeId);
    if (!challengeJson) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    const challenge: Challenge = JSON.parse(challengeJson);
    
    if (challenge.status !== 'open') {
      return NextResponse.json({ error: 'Challenge is no longer open' }, { status: 400 });
    }
    
    if (challenge.challengerAddress.toLowerCase() === challengedAddress.toLowerCase()) {
      return NextResponse.json({ error: 'You cannot accept your own challenge' }, { status: 400 });
    }

    // If challenge was targeted at specific address, verify it matches
    if (challenge.challengedAddress && 
        challenge.challengedAddress.toLowerCase() !== challengedAddress.toLowerCase()) {
      return NextResponse.json({ error: 'This challenge is for a different user' }, { status: 403 });
    }

    challenge.challengedAddress = challengedAddress;
    challenge.status = 'accepted';
    challenge.acceptedAt = Date.now();

    await redis.hset(`challenges:${season}:${week}`, {
      [challengeId]: JSON.stringify(challenge),
    });

    return NextResponse.json({ ok: true, challenge });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

/**
 * PUT - Resolve challenges (called at week end or manually)
 */
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const season = searchParams.get('season');
  const week = searchParams.get('week');

  if (!season || !week) {
    return NextResponse.json({ error: 'Season and week required' }, { status: 400 });
  }

  const allChallenges = await redis.hgetall<Record<string, string>>(`challenges:${season}:${week}`);
  
  if (!allChallenges) {
    return NextResponse.json({ resolved: 0 });
  }

  // Fetch current prices
  let prices: Record<string, PriceData> = {};
  try {
    const pricesRes = await fetch(`${BASE_URL}/api/prices`);
    if (pricesRes.ok) {
      const pricesData = await pricesRes.json();
      prices = pricesData.prices;
    }
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 });
  }

  const weekKey = getWeekKey(season, parseInt(week));
  let resolved = 0;

  for (const [id, challengeJson] of Object.entries(allChallenges)) {
    const challenge: Challenge = JSON.parse(challengeJson);
    
    // Only resolve accepted challenges
    if (challenge.status !== 'accepted') continue;
    if (!challenge.challengedAddress) continue;

    // Get portfolios
    const challengerPortfolioJson = await redis.hget<string>(weekKey, challenge.challengerAddress);
    const challengedPortfolioJson = await redis.hget<string>(weekKey, challenge.challengedAddress);

    if (!challengerPortfolioJson || !challengedPortfolioJson) continue;

    // Calculate scores
    const challengerPortfolio: StoredPortfolio = JSON.parse(challengerPortfolioJson);
    const challengedPortfolio: StoredPortfolio = JSON.parse(challengedPortfolioJson);

    const challengerResult = calculateScore(challengerPortfolio, prices);
    const challengedResult = calculateScore(challengedPortfolio, prices);

    challenge.challengerScore = challengerResult.totalScore;
    challenge.challengedScore = challengedResult.totalScore;
    challenge.status = 'completed';

    // Determine winner
    if (challengerResult.totalScore > challengedResult.totalScore) {
      challenge.winnerId = challenge.challengerAddress;
    } else if (challengedResult.totalScore > challengerResult.totalScore) {
      challenge.winnerId = challenge.challengedAddress;
    } else {
      challenge.winnerId = null; // Tie
    }

    await redis.hset(`challenges:${season}:${week}`, {
      [id]: JSON.stringify(challenge),
    });

    resolved++;
  }

  return NextResponse.json({ resolved });
}

