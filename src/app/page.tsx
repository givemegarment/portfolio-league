'use client'
import { useMiniKit } from '@coinbase/onchainkit/minikit'
import { Wallet } from '@coinbase/onchainkit/wallet'
import PortfolioBuilder from '../components/portfolio/PortfolioBuilder'
import LeaderboardPreview from '../components/league/LeaderboardPreview'
import { useAccount } from 'wagmi'

export default function Home() {
  const mini = useMiniKit()
  const { address } = useAccount()
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1 className="text-2xl font-bold mb-2">Portfolio League</h1>
      <p className="mb-4">MiniKit loaded: {mini ? 'yes' : 'no'}</p>
      <Wallet />
      <PortfolioBuilder address={address} />
      <LeaderboardPreview />
    </main>
  )
}
