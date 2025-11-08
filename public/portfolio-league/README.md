# Portfolio League 🏆

A social crypto portfolio game built as a Base mini-app with Farcaster integration. Players pick 3-asset baskets weekly, compete for prizes, and mint season badges.

![Portfolio League](./public/hero.png)

## Overview

Portfolio League is a gamified social trading competition where:
- 🎯 Players select 3 assets from BTC/ETH/SOL/USDC each week
- 📊 Performance tracked on-chain via Chainlink oracles
- 🏅 Top 10% split weekly prize pools (1000 USDC)
- 🎖️ Everyone mints a season badge NFT
- 🔄 v1: Paper portfolio • v2: Real pooled vault

## Features

### Core Gameplay
- **Weekly Leagues**: New competition every Monday
- **3-Asset Portfolios**: Pick from BTC, ETH, SOL, or USDC yield
- **On-Chain Tracking**: Chainlink price feeds for transparent scoring
- **Prize Distribution**: Top decile shares prize pool
- **Season Badges**: Dynamic NFTs with performance stats

### Social Features
- **Farcaster Integration**: Auto-generate shareable cast cards
- **Leaderboard**: Real-time rankings and performance
- **Season System**: 12-week seasons with cumulative rewards

### Technical Features
- Built with Next.js 15 and TypeScript
- OnchainKit + MiniKit for Base integration
- Wagmi + Viem for wallet connections
- Upstash Redis for data persistence
- Smart contracts on Base

## Tech Stack

### Frontend
- **Framework**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Wallet**: OnchainKit, Wagmi, Viem
- **MiniApp**: @farcaster/frame-sdk, @coinbase/onchainkit/minikit

### Backend
- **Database**: Upstash Redis
- **Blockchain**: Base (Ethereum L2)
- **Oracles**: Chainlink Price Feeds
- **APIs**: Neynar (Farcaster)

### Smart Contracts
- **PortfolioLeague.sol**: Main game logic
- **SeasonBadge.sol**: Dynamic NFT badges
- **Language**: Solidity 0.8.20
- **Framework**: Foundry

## Project Structure

```
portfolio-league/
├── app/
│   ├── api/
│   │   ├── webhook/          # Farcaster webhook handler
│   │   ├── portfolio/        # Portfolio submission
│   │   ├── leaderboard/      # Rankings & prizes
│   │   └── oracle/           # Price feeds
│   ├── .well-known/
│   │   └── farcaster.json/   # Mini-app manifest
│   ├── layout.tsx
│   ├── page.tsx              # Main UI
│   └── globals.css
├── components/
│   ├── ui/                   # Reusable UI components
│   ├── portfolio/            # Portfolio builder
│   └── league/               # Leaderboard & season info
├── contracts/
│   ├── PortfolioLeague.sol   # Main game contract
│   └── SeasonBadge.sol       # NFT badge contract
├── lib/
│   ├── utils/                # Helper functions
│   └── contracts/            # Contract ABIs & interactions
├── public/
│   ├── screenshots/          # Mini-app screenshots
│   └── assets/               # Images & icons
├── minikit.config.ts         # MiniKit configuration
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Quick Start

### For Complete Beginners (macOS)
**Never coded before? We've got you covered!**

1. **[macOS Beginner Guide](./MACOS_BEGINNER_GUIDE.md)** - Step-by-step guide (1-2 hours)
2. **[Visual Walkthrough](./VISUAL_WALKTHROUGH.md)** - See what your screen should show
3. **[Quick Reference Card](./QUICK_REFERENCE.md)** - Print this cheat sheet!

### For Developers

### Prerequisites
- Node.js 18+
- npm or yarn
- Vercel account
- Farcaster account

### Installation

1. **Clone the repository**
```bash
git clone <your-repo>
cd portfolio-league
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Fill in your API keys and configuration
```

4. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

## Game Mechanics

### How to Play

1. **Connect Wallet**: Use Coinbase Wallet or compatible wallet
2. **Pick 3 Assets**: Select from BTC, ETH, SOL, or USDC yield
3. **Submit Portfolio**: Lock in your selection before week ends
4. **Track Performance**: Watch your ranking in real-time
5. **Claim Prizes**: Top 10% split the prize pool
6. **Mint Badge**: Get your season NFT at end of season

### Scoring System

- **Equal Weight**: Each asset gets 33.33% allocation
- **Performance**: Calculated from week start prices
- **Updates**: Real-time via Chainlink oracles
- **Settlement**: Automatic at week end (Sunday 11:59 PM UTC)

### Prize Distribution

- **Prize Pool**: 1000 USDC per week (v1)
- **Top 10%**: Share prize pool (weighted by rank)
- **Example**: 
  - Rank 1: 250 USDC
  - Rank 2: 150 USDC
  - Rank 3: 100 USDC
  - Rank 4-10: Decreasing amounts

## Smart Contracts

### PortfolioLeague.sol

Main game contract handling:
- Portfolio submissions
- Week management
- Prize distribution
- Oracle integration

**Key Functions:**
```solidity
submitPortfolio(Asset[3] assets)  // Submit weekly portfolio
getPortfolio(week, player)         // Get player's portfolio
finalizeWeek(week, winners, prizes) // Admin: settle week
claimPrize(week)                   // Claim winnings
```

### SeasonBadge.sol

Dynamic NFT badges with:
- Season tracking
- Performance stats
- Rank tiers (Legendary, Elite, Gold, Silver, Bronze)
- On-chain SVG generation

**Key Functions:**
```solidity
mint(to, rank, total, return, weeks)  // Mint season badge
tokenURI(tokenId)                      // Dynamic metadata
```

## API Routes

### POST /api/portfolio/submit
Submit portfolio for current week
```json
{
  "address": "0x...",
  "assets": ["BTC", "ETH", "SOL"],
  "week": 1
}
```

### GET /api/leaderboard?week=1
Get current leaderboard
```json
{
  "leaderboard": [...],
  "totalParticipants": 247,
  "week": 1
}
```

### GET /api/oracle/prices
Get current asset prices
```json
{
  "BTC": 45000.00,
  "ETH": 2500.00,
  "SOL": 150.00,
  "USDC": 1.00
}
```

## Development

### Run Tests
```bash
# Smart contract tests
cd foundry
forge test

# Frontend tests
npm run test
```

### Lint & Format
```bash
npm run lint
npm run format
```

### Build for Production
```bash
npm run build
```

## Roadmap

### v1.0 (Current) - Paper Portfolio
- ✅ Basic portfolio selection
- ✅ Weekly competitions
- ✅ USDC prize pool
- ✅ Season badges
- ✅ Farcaster integration

### v2.0 - Real Money Vault
- 🔄 Pooled vault with real assets
- 🔄 Risk management (max loss caps)
- 🔄 KYC/compliance layer
- 🔄 Withdraw mechanisms
- 🔄 Advanced analytics

### v3.0 - Social Features
- 📋 Follow top players
- 📋 Copy portfolios
- 📋 Private leagues
- 📋 Custom tournaments
- 📋 Referral rewards

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

### Development Guidelines
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## Security

- Smart contracts audited by [Auditor]
- Bug bounty program: Contact security@portfolioleague.xyz
- Security policy: [SECURITY.md](./SECURITY.md)

## License

MIT License - see [LICENSE](./LICENSE)

## Resources

### Documentation
- [Deployment Guide](./DEPLOYMENT.md)
- [Smart Contracts](./contracts/)
- [API Documentation](./docs/API.md)

### Community
- [Discord](https://discord.gg/portfolio-league)
- [Twitter](https://twitter.com/portfolioleague)
- [Farcaster](https://warpcast.com/portfolioleague)

### Base Resources
- [Base Docs](https://docs.base.org)
- [OnchainKit](https://onchainkit.xyz)
- [MiniKit Guide](https://docs.base.org/builderkits/minikit)

## Support

Need help? Reach out:
- 📧 Email: support@portfolioleague.xyz
- 💬 Discord: [Join our server](https://discord.gg/portfolio-league)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)

## Acknowledgments

Built with:
- [Base](https://base.org) - Ethereum L2
- [OnchainKit](https://onchainkit.xyz) - Base Builder Kit
- [Farcaster](https://farcaster.xyz) - Decentralized social protocol
- [Chainlink](https://chain.link) - Oracle infrastructure

---

**Built on Base** 🔵 | **Season 1** 🎮 | **Compete. Win. Earn.** 🏆
