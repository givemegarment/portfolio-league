'use client';

import { useState } from 'react';
import Nav from '@/components/chrome/Nav';

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: 'How do I play Portfolio League?',
    answer: 'Portfolio League is simple: connect your wallet, select up to 3 crypto assets, allocate percentages that total 100%, and submit before the weekly deadline (Sunday 23:59 UTC). Your portfolio performance is tracked against other players, and the top 10% share the prize pool.',
  },
  {
    question: 'How do I connect my wallet?',
    answer: 'Click the "Connect Wallet" button in the navigation bar. We support Coinbase Wallet, MetaMask, and other popular Web3 wallets. Your wallet address is used to track your portfolio and leaderboard position—no funds are ever transferred or at risk.',
  },
  {
    question: 'How are prizes distributed?',
    answer: 'At the end of each week, the prize pool is distributed among the top 10% of performers. First place receives the largest share, with decreasing amounts for lower ranks within the top 10%. Prize distribution happens automatically after the week ends and scores are finalized.',
  },
  {
    question: 'How many assets can I select?',
    answer: 'You can select up to 3 different crypto assets for your portfolio. You must allocate percentages to each asset, and the total must equal exactly 100%. You can choose from 29 supported assets including majors (BTC, ETH, SOL), Base ecosystem tokens, DeFi protocols, meme coins, and more.',
  },
  {
    question: 'When do picks lock and when does the week end?',
    answer: 'Each competition week runs from Monday 00:00 UTC to Sunday 23:59 UTC. You can submit or update your portfolio anytime during the week, but once Sunday ends, your picks are locked for scoring. New weeks begin automatically every Monday.',
  },
  {
    question: 'How is my score calculated?',
    answer: 'Your score is the weighted average return of your portfolio. Each asset\'s price change from your entry time to the week\'s end is multiplied by its allocation percentage. For example, if BTC is 50% of your portfolio and gains 10%, that contributes +5% to your total score.',
  },
  {
    question: 'What is the referral system?',
    answer: 'Share your unique referral link with friends. When they connect their wallet and submit their first portfolio, you earn bonus points. The more active referrals you have, the more bonuses you accumulate. Find your referral link on the Referrals page.',
  },
  {
    question: 'What are NFT trophies?',
    answer: 'NFT trophies are on-chain achievements you can mint to commemorate your accomplishments. Win a weekly competition, achieve a hot streak, or reach other milestones to unlock trophy NFTs. These are minted on Base and serve as permanent proof of your trading prowess.',
  },
  {
    question: 'What assets are available to choose from?',
    answer: 'We support 29 assets across multiple categories: Majors (BTC, ETH, SOL), Stablecoins (USDC, USDT, DAI), Base Ecosystem (AERO, DEGEN, BRETT, TOSHI, HIGHER), L2 Tokens (OP, ARB, POL), DeFi (LINK, UNI, AAVE, MKR, CRV), AI & Meme (PEPE, WIF, BONK, RENDER, FET), and Alt L1s (AVAX, NEAR, INJ, SUI, APT).',
  },
  {
    question: 'Is this financial advice?',
    answer: 'No. Portfolio League is a game for entertainment purposes only. Performance in the game does not reflect real trading outcomes. Always do your own research before making any real investment decisions. See our Terms of Service for full disclaimers.',
  },
];

function AccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-white/80"
      >
        <span className="pr-4 text-base font-medium text-white">{item.question}</span>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="h-4 w-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-sm leading-relaxed text-white/60">{item.answer}</p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto max-w-3xl px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-base-blue/10 px-4 py-2">
            <svg className="h-5 w-5 text-base-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-base-blue">Help Center</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-white/60">
            Everything you need to know about Portfolio League
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="rounded-2xl border border-white/5 bg-surface-2 px-6">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              item={faq}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* Still have questions? */}
        <div className="mt-12 rounded-2xl border border-white/5 bg-surface-2 p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-base-blue to-purple-600">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">Still have questions?</h3>
          <p className="mt-2 text-sm text-white/60">
            Join our community on Farcaster or reach out directly
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a
              href="https://warpcast.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm"
            >
              Join Farcaster
            </a>
            <a href="/" className="btn-primary text-sm">
              Back to Home
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}


