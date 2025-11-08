import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

type SavePayload = {
  address: string;
  basket: string[];
  week?: number;
  season?: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as SavePayload;

  if (!body?.address || !Array.isArray(body.basket) || body.basket.length !== 3) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const season = body.season ?? 's1';
  const week = body.week ?? 1;

  await redis.hset(`portfolio:${season}:${week}`, {
    [body.address]: JSON.stringify(body.basket),
  });

  return NextResponse.json({ ok: true });
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
  const basket: string[] | null = value ? JSON.parse(value) : null;

  return NextResponse.json({ address, basket, season, week });
}
