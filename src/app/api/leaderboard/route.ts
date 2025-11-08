import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

type Item = { member: string; score: number };
type LeaderRow = { rank: number; user: string; score: number; basket: string };

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

export async function GET() {
  const raw = await redis.zrange('leaderboard', 0, 49, { rev: true, withScores: true });
  const items = normalize(raw);

  const rows: LeaderRow[] = [];
  let rank = 1;
  for (const { member, score } of items) {
    const [user = 'unknown', basket = '[]'] = member.split('|', 2);
    rows.push({ rank: rank++, user, score, basket });
  }

  return NextResponse.json(rows);
}

type SeedBody = { user: string; basket: string[]; score: number };

export async function POST(req: Request) {
  const body = (await req.json()) as SeedBody;
  if (!body?.user || !Array.isArray(body.basket) || typeof body.score !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const member = `${body.user}|${JSON.stringify(body.basket)}`;
  await redis.zadd('leaderboard', { score: body.score, member });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await redis.del('leaderboard');
  return NextResponse.json({ ok: true });
}
