import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

type AllocationItem = {
  symbol: string;
  percentage: number;
};

type Item = { member: string; score: number };
type LeaderRow = { 
  rank: number; 
  user: string; 
  score: number; 
  basket: string;
  allocations?: AllocationItem[];
};

function hasMemberScore(x: unknown): x is Item {
  if (typeof x !== 'object' || x === null) return false;
  const r = x as Record<string, unknown>;
  return typeof r.member === 'string' && typeof r.score === 'number';
}

function normalize(raw: unknown): Item[] {
  if (!Array.isArray(raw)) return [];
  if (raw.length && hasMemberScore(raw[0])) return raw as Item[];
  const out: Item[] = [];
  for (let i = 0; i < raw.length; i += 2) {
    const m = raw[i];
    const s = raw[i + 1];
    if (typeof m === 'string' && typeof s === 'number') out.push({ member: m, score: s });
  }
  return out;
}

function parseAllocations(basketStr: string): AllocationItem[] | undefined {
  try {
    const parsed = JSON.parse(basketStr);
    
    // New format: array of {symbol, percentage}
    if (Array.isArray(parsed) && parsed[0]?.percentage !== undefined) {
      return parsed as AllocationItem[];
    }
    
    // Legacy format: array of symbols - convert to equal weights
    if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
      const equalWeight = Math.floor(100 / parsed.length);
      const remainder = 100 - (equalWeight * parsed.length);
      return parsed.map((symbol: string, idx: number) => ({
        symbol,
        percentage: equalWeight + (idx === 0 ? remainder : 0),
      }));
    }
  } catch {
    // Invalid JSON
  }
  return undefined;
}

export async function GET() {
  const raw = await redis.zrange('leaderboard', 0, 49, { rev: true, withScores: true });
  const items = normalize(raw);

  const rows: LeaderRow[] = [];
  let rank = 1;
  for (const { member, score } of items) {
    const [user = 'unknown', basket = '[]'] = member.split('|', 2);
    const allocations = parseAllocations(basket);
    rows.push({ rank: rank++, user, score, basket, allocations });
  }

  return NextResponse.json(rows);
}

type SeedBody = { 
  user: string; 
  basket?: string[]; 
  allocations?: AllocationItem[];
  score: number;
};

export async function POST(req: Request) {
  const body = (await req.json()) as SeedBody;
  
  if (!body?.user || typeof body.score !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  let basketData: AllocationItem[] | string[];
  
  if (body.allocations && Array.isArray(body.allocations)) {
    basketData = body.allocations;
  } else if (body.basket && Array.isArray(body.basket)) {
    basketData = body.basket;
  } else {
    return NextResponse.json({ error: 'basket or allocations required' }, { status: 400 });
  }

  const member = `${body.user}|${JSON.stringify(basketData)}`;
  await redis.zadd('leaderboard', { score: body.score, member });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await redis.del('leaderboard');
  return NextResponse.json({ ok: true });
}
