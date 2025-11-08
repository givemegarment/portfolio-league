import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

type ZMember = { member: string; score: number };
type LeaderRow = { rank: number; user: string; score: number; basket: string };

export async function GET() {
  const top = await redis.zrange<ZMember>('leaderboard', 0, 49, {
    rev: true,
    withScores: true,
  });

  const rows: LeaderRow[] = [];
  let rank = 1;

  for (const { member, score } of top) {
    const [user, basket] = member.split('|', 2);
    rows.push({ rank: rank++, user, score, basket });
  }

  return NextResponse.json(rows);
}
