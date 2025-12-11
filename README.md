# Imitatio

**Master the Art of Portfolio Strategy**

Imitatio is a gamified on-chain portfolio competition platform built on Base. Inspired by the classical principle of *imitatio* — learning through emulation of the masters — Imitatio transforms passive portfolio observation into active competitive strategy.

## Concept

Select 3 crypto assets each week. Compete against other traders. Top 10% share the prize pool.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Blockchain**: Base (Coinbase L2)
- **Wallet**: Coinbase Wallet, MetaMask, and other Web3 wallets
- **Styling**: Tailwind CSS
- **Database**: Upstash Redis
- **Smart Contracts**: Solidity (NFT Trophies)

## Features

- 🎯 Weekly portfolio competitions
- 💰 Prize pool distribution to top performers
- 🏆 Soulbound NFT trophies for achievements
- 📊 Real-time leaderboards
- 🔔 Notifications and weekly digests
- 👥 Referral system with bonus points
- 🎨 Beautiful, responsive UI

## Project Structure

```
src/
├── app/           # Next.js App Router pages
├── components/    # React components
├── lib/           # Utilities and business logic
└── hooks/         # Custom React hooks

contracts/
└── ImitatiaTrophies.sol  # NFT trophy smart contract

public/
├── coins/         # Token icons
└── ...           # Other static assets
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Base Documentation](https://docs.base.org)
- [Tailwind CSS](https://tailwindcss.com)

## Deploy on Vercel

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new).

## License

All rights reserved © 2025 Imitatio
