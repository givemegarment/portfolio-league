import Nav from '@/components/chrome/Nav';

function Step({
  number,
  title,
  description,
  icon,
  tips,
}: {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  tips?: string[];
}) {
  return (
    <div className="relative">
      {/* Connector line */}
      {number < 6 && (
        <div className="absolute left-8 top-20 h-full w-px bg-gradient-to-b from-white/10 to-transparent hidden lg:block" />
      )}

      <div className="flex gap-6">
        {/* Step number */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-base-blue to-purple-600 text-2xl font-bold text-white shadow-lg shadow-base-blue/20">
          {number}
        </div>

        {/* Content */}
        <div className="flex-1 pb-12">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <p className="mt-2 text-white/60">{description}</p>

              {tips && tips.length > 0 && (
                <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-accent-amber">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pro Tips
                  </div>
                  <ul className="space-y-1">
                    {tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/50">
                        <span className="text-accent-emerald">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white/40">
              {icon}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrizeTier({
  position,
  percentage,
  color,
}: {
  position: string;
  percentage: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {position}
      </div>
      <div>
        <div className="font-mono font-bold text-white">{percentage}</div>
        <div className="text-xs text-white/40">of prize pool</div>
      </div>
    </div>
  );
}

export default function HowToPlayPage() {
  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent-emerald/10 px-4 py-2">
            <svg className="h-5 w-5 text-accent-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-accent-emerald">Getting Started</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            How to Play
          </h1>
          <p className="mt-4 text-lg text-white/60">
            Master Imitatio in 6 simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="mb-16">
          <Step
            number={1}
            title="Connect Your Wallet"
            description="Click the 'Connect Wallet' button in the top right corner. We support Coinbase Wallet, MetaMask, and all major Web3 wallets. Your wallet address is your unique player ID."
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
            tips={[
              'Make sure you\'re on the Base network',
              'No funds are transferred—connection is just for identity',
            ]}
          />

          <Step
            number={2}
            title="Select Your Assets"
            description="Choose up to 3 crypto assets from our selection of 29 tokens. Browse by category (Majors, DeFi, Meme, etc.) or search for specific tokens. Consider diversity and risk when building your portfolio."
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            tips={[
              'Diversify across categories to manage risk',
              'Check 24h price changes before selecting',
              'Base ecosystem tokens can be volatile but rewarding',
            ]}
          />

          <Step
            number={3}
            title="Allocate Percentages"
            description="Use the sliders to set how much of your portfolio each asset represents. Your allocations must total exactly 100%. Use the 'Auto-balance' button to split evenly."
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            tips={[
              'Higher allocation = higher impact on your score',
              'Going 100% on one asset is risky but can pay off',
              'Stablecoins can be used as a hedge',
            ]}
          />

          <Step
            number={4}
            title="Lock In Your Picks"
            description="Click 'Lock In My Portfolio' to submit your picks. You can update your portfolio anytime before Sunday 23:59 UTC. Once the deadline passes, your picks are locked for scoring."
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            tips={[
              'You can change your picks unlimited times before deadline',
              'Entry prices are recorded at submission time',
              'Watch the countdown timer on the home page',
            ]}
          />

          <Step
            number={5}
            title="Track Your Performance"
            description="Watch your portfolio performance on the live leaderboard. Scores update in real-time based on actual crypto prices. Your rank shows how you compare to other players."
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
            tips={[
              'Leaderboard updates every minute',
              'Click on other players to see their picks',
              'Use the AI Coach for portfolio suggestions',
            ]}
          />

          <Step
            number={6}
            title="Win Prizes & Earn Trophies"
            description="At week's end, the top 10% of players share the prize pool. First place takes the biggest share. Achieve milestones to unlock NFT trophies you can mint on Base."
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            }
            tips={[
              'Consistent top 10% finishes earn Hot Streak badges',
              'Refer friends for bonus rewards',
              'Trophy NFTs are free to mint (just gas fees)',
            ]}
          />
        </div>

        {/* Score Calculation */}
        <div className="mb-16 rounded-2xl border border-white/5 bg-surface-2 p-8">
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-base-blue/20">
              <svg className="h-5 w-5 text-base-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            How Scoring Works
          </h2>

          <div className="space-y-4 text-white/60">
            <p>
              Your score is the <strong className="text-white">weighted average return</strong> of your portfolio:
            </p>

            <div className="rounded-xl bg-white/5 p-4 font-mono text-sm">
              Score = Σ (Asset Return × Allocation %)
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">Example</div>
              <div className="space-y-2 text-sm">
                <p>Portfolio: BTC (50%), ETH (30%), SOL (20%)</p>
                <p>Weekly returns: BTC +8%, ETH +5%, SOL -3%</p>
                <p className="pt-2 border-t border-white/10">
                  <strong className="text-accent-emerald">Score = (8% × 0.50) + (5% × 0.30) + (-3% × 0.20) = +4.9%</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Prize Tiers */}
        <div className="mb-16 rounded-2xl border border-white/5 bg-surface-2 p-8">
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-amber/20">
              <svg className="h-5 w-5 text-accent-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Prize Distribution
          </h2>

          <p className="mb-6 text-white/60">
            The top 10% of players share the weekly prize pool. Distributions are weighted toward top performers:
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <PrizeTier position="1st" percentage="25%" color="#F7931A" />
            <PrizeTier position="2nd" percentage="15%" color="#A0AEC0" />
            <PrizeTier position="3rd" percentage="10%" color="#CD7F32" />
            <PrizeTier position="4-10%" percentage="50%" color="#0052FF" />
          </div>

          <p className="mt-4 text-sm text-white/40">
            * Exact percentages may vary based on player count and pool size
          </p>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-base-blue/20 bg-gradient-to-br from-base-blue/10 to-purple-600/10 p-8 text-center">
          <h2 className="text-2xl font-bold text-white">Ready to Compete?</h2>
          <p className="mt-2 text-white/60">
            Connect your wallet and build your first portfolio
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a href="/" className="btn-primary">
              Start Playing
            </a>
            <a href="/faq" className="btn-secondary">
              Read FAQ
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}



