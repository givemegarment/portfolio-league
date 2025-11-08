/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function GET() {
  // топ-50 по убыванию
  const top = await redis.zrange('leaderboard', 0, 49, { rev: true, withScores: true }) as any[]
  const rows: { rank:number; user:string; score:number; basket:string }[] = []

  for (const item of top) {
    const user = typeof item === 'object' ? item.member as string : String(item)
    const score = typeof item === 'object' ? Number(item.score) : 0
    const p = await redis.get<{ user:string; basket:string[] }>(`portfolio:${user}`)
    rows.push({
      rank: rows.length + 1,
      user,
      score,
      basket: p?.basket?.join(' / ') ?? ''
    })
  }

  return NextResponse.json({ rows })
}
