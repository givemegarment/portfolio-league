import Nav from '@/components/chrome/Nav';

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto max-w-3xl px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
            <svg className="h-5 w-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-white/60">Legal</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-white/60">
            Last updated: December 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section className="rounded-2xl border border-white/5 bg-surface-2 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">1. Introduction</h2>
            <p className="text-sm leading-relaxed text-white/60">
              Welcome to Portfolio League. By accessing or using our platform, you agree to be bound by these Terms of Service. Portfolio League is a gamified portfolio competition platform built on Base. Please read these terms carefully before participating.
            </p>
          </section>

          {/* Eligibility */}
          <section className="rounded-2xl border border-white/5 bg-surface-2 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">2. Eligibility</h2>
            <div className="space-y-3 text-sm leading-relaxed text-white/60">
              <p>To use Portfolio League, you must:</p>
              <ul className="list-inside list-disc space-y-2 pl-4">
                <li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
                <li>Have the legal capacity to enter into binding agreements</li>
                <li>Not be located in a jurisdiction where participation is prohibited</li>
                <li>Have a compatible Web3 wallet (Coinbase Wallet, MetaMask, etc.)</li>
              </ul>
              <p>
                By using the platform, you represent and warrant that you meet all eligibility requirements.
              </p>
            </div>
          </section>

          {/* No Financial Advice */}
          <section className="rounded-2xl border border-accent-amber/20 bg-accent-amber/5 p-6">
            <h2 className="mb-4 text-xl font-bold text-accent-amber">3. No Financial Advice</h2>
            <div className="space-y-3 text-sm leading-relaxed text-white/60">
              <p className="font-medium text-white">
                Portfolio League is for entertainment purposes only.
              </p>
              <p>
                Nothing on this platform constitutes financial, investment, legal, or tax advice. The simulated portfolio selections and their performance do not reflect real trading outcomes and should not be used as the basis for any investment decisions.
              </p>
              <p>
                Cryptocurrency markets are highly volatile and speculative. Past performance, whether real or simulated, is not indicative of future results. Always conduct your own research and consult with qualified professionals before making investment decisions.
              </p>
            </div>
          </section>

          {/* Game Rules */}
          <section className="rounded-2xl border border-white/5 bg-surface-2 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">4. Competition Rules & Prizes</h2>
            <div className="space-y-3 text-sm leading-relaxed text-white/60">
              <p>By participating in Portfolio League competitions:</p>
              <ul className="list-inside list-disc space-y-2 pl-4">
                <li>You agree to abide by all game rules and deadlines</li>
                <li>Prize distribution is at the sole discretion of Portfolio League</li>
                <li>We reserve the right to modify prize pools, rules, or competition structures</li>
                <li>Manipulation, cheating, or exploiting bugs will result in disqualification</li>
                <li>Prizes may be subject to taxes in your jurisdiction—you are solely responsible for tax obligations</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate any account suspected of fraudulent activity.
              </p>
            </div>
          </section>

          {/* User Conduct */}
          <section className="rounded-2xl border border-white/5 bg-surface-2 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">5. User Conduct</h2>
            <div className="space-y-3 text-sm leading-relaxed text-white/60">
              <p>You agree not to:</p>
              <ul className="list-inside list-disc space-y-2 pl-4">
                <li>Use multiple wallets to gain unfair advantages</li>
                <li>Attempt to manipulate leaderboards or scores</li>
                <li>Exploit bugs, vulnerabilities, or system errors</li>
                <li>Engage in any form of automated or bot-driven participation</li>
                <li>Harass, threaten, or abuse other users</li>
                <li>Use the platform for money laundering or other illegal activities</li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="rounded-2xl border border-white/5 bg-surface-2 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">6. Intellectual Property</h2>
            <div className="space-y-3 text-sm leading-relaxed text-white/60">
              <p>
                All content, trademarks, logos, and intellectual property on Portfolio League are owned by or licensed to us. You may not copy, modify, distribute, or create derivative works without express written permission.
              </p>
              <p>
                NFT trophies minted through the platform grant you ownership of the token itself, but not the underlying intellectual property or artwork, which remains with Portfolio League.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="rounded-2xl border border-white/5 bg-surface-2 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">7. Limitation of Liability</h2>
            <div className="space-y-3 text-sm leading-relaxed text-white/60">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, PORTFOLIO LEAGUE AND ITS AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR GOODWILL.
              </p>
              <p>
                The platform is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind. We do not guarantee uninterrupted access, accuracy of price data, or error-free operation.
              </p>
            </div>
          </section>

          {/* Privacy */}
          <section className="rounded-2xl border border-white/5 bg-surface-2 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">8. Privacy & Data</h2>
            <div className="space-y-3 text-sm leading-relaxed text-white/60">
              <p>
                We collect and store your wallet address and portfolio selections. This data is used to operate the game, display leaderboards, and distribute prizes. We do not collect personal identifying information beyond what is publicly available on-chain.
              </p>
              <p>
                Leaderboard rankings and portfolio selections are publicly visible to all users.
              </p>
            </div>
          </section>

          {/* Modifications */}
          <section className="rounded-2xl border border-white/5 bg-surface-2 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">9. Modifications</h2>
            <p className="text-sm leading-relaxed text-white/60">
              We reserve the right to modify these Terms of Service at any time. Changes will be effective upon posting to the platform. Your continued use of Portfolio League after changes are posted constitutes acceptance of the revised terms.
            </p>
          </section>

          {/* Contact */}
          <section className="rounded-2xl border border-base-blue/20 bg-base-blue/5 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">10. Contact Us</h2>
            <p className="text-sm leading-relaxed text-white/60">
              If you have questions about these Terms of Service, please reach out through our Farcaster community or submit feedback through the platform.
            </p>
            <div className="mt-4">
              <a
                href="https://warpcast.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-base-blue hover:text-base-blue-light transition-colors"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Contact on Farcaster
              </a>
            </div>
          </section>
        </div>

        {/* Back Link */}
        <div className="mt-12 text-center">
          <a href="/" className="btn-secondary text-sm">
            ← Back to Home
          </a>
        </div>
      </main>
    </div>
  );
}
