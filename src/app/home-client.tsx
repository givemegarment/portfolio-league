'use client';

import PortfolioBuilder from '@/components/portfolio/PortfolioBuilder'
import LeaderboardPreview from '@/components/leaderboard/LeaderboardPreview'
import Nav from '@/components/chrome/Nav'

export default function HomeClient() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold">Portfolio League</h1>
        <p className="text-sm text-neutral-400">MiniKit loaded: yes</p>

        <section className="rounded-xl border border-neutral-800 p-4">
          <PortfolioBuilder />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Leaderboard</h2>
          <LeaderboardPreview />
        </section>
      </main>
    </>
  )
}
