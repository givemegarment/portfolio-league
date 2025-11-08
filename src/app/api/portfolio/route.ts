/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const WHITELIST = ['BTC','ETH','SOL','USDC'] as const
type AssetId = typeof WHITELIST[number]

export async function POST(req: Request) {
  try {
    const { address, basket } = await req.json() as { address?: string, basket: AssetId[] }
    if (!Array.isArray(basket) || basket.length !== 3) {
      return NextResponse.json({ error: 'Pick exactly 3 assets' }, { status: 400 })
    }
    for (const a of basket) {
      if (!WHITELIST.includes(a as any)) {
        return NextResponse.json({ error: `Invalid asset: ${a}` }, { status: 400 })
      }
    }
    const user = (address ?? 'guest').toLowerCase()
    // временный мок-скор (позже заменим на реальные цены)
    const score = Math.round((100 + Math.random() * 20) * 10) / 10

    await redis.set(`portfolio:${user}`, { user, basket, score, ts: Date.now() })
    await redis.zadd('leaderboard', { member: user, score })

    return NextResponse.json({ ok: true, user, score })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'server error' }, { status: 500 })
  }
}
