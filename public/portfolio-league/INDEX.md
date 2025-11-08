# Portfolio League - File Navigation Guide

Welcome to Portfolio League! This guide helps you navigate the codebase and find what you need.

## 📖 Start Here

### For Complete Beginners (macOS)
**Never coded before? Start with these:**

1. **[MACOS_BEGINNER_GUIDE.md](./MACOS_BEGINNER_GUIDE.md)** - Complete beginner guide (1-2 hours)
2. **[VISUAL_WALKTHROUGH.md](./VISUAL_WALKTHROUGH.md)** - What your screen should show
3. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Print this! One-page cheat sheet

### For Developers
**Have coding experience? Use these:**

1. **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - High-level overview
2. **[QUICKSTART.md](./QUICKSTART.md)** - 30-minute setup guide
3. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment instructions
4. **[CHECKLIST.md](./CHECKLIST.md)** - Step-by-step deployment checklist

## 🏗️ Core Application Files

### Configuration
- `package.json` - Dependencies and scripts
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS setup
- `tsconfig.json` - TypeScript configuration
- `minikit.config.ts` - MiniKit/Farcaster config
- `.env.example` - Environment variables template

### Main Application
- `app/layout.tsx` - Root layout with providers
- `app/page.tsx` - Main portfolio selection page
- `app/globals.css` - Global styles
- `components/Providers.tsx` - Wagmi & MiniKit providers

### Components
- `components/ui/Badge.tsx` - Reusable badge component
- `components/portfolio/PortfolioBuilder.tsx` - Asset selection UI
- `components/league/SeasonInfo.tsx` - Week timer & info
- `components/league/LeaderboardPreview.tsx` - Rankings display

### API Routes
- `app/api/portfolio/submit/route.ts` - Portfolio submission
- `app/api/leaderboard/route.ts` - Rankings & prizes
- `app/api/league/current/route.ts` - Season info
- `app/api/oracle/prices/route.ts` - Price feeds
- `app/api/webhook/route.ts` - Farcaster events

### Utilities
- `lib/utils/index.ts` - Helper functions
- `.well-known/farcaster.json/route.ts` - Manifest endpoint

## 🔗 Smart Contracts

### Solidity Files
- `contracts/PortfolioLeague.sol` - Main game contract
  - Portfolio submissions
  - Week management
  - Prize distribution
  - Oracle integration

- `contracts/SeasonBadge.sol` - NFT badge contract
  - Dynamic metadata
  - Performance tracking
  - On-chain SVG generation

### Deployment
See [DEPLOYMENT.md#step-3-deploy-smart-contracts](./DEPLOYMENT.md#step-3-deploy-smart-contracts) for:
- Foundry setup
- Deploy scripts
- Verification
- Contract interaction

## 📋 Documentation Files

### Getting Started
- **[README.md](./README.md)** - Project overview, features, tech stack
- **[QUICKSTART.md](./QUICKSTART.md)** - Fast 30-minute setup
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete project summary

### Deployment
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Comprehensive deployment guide
  - Step-by-step instructions
  - API key setup
  - Smart contract deployment
  - Farcaster configuration
  - Troubleshooting

- **[CHECKLIST.md](./CHECKLIST.md)** - Interactive deployment checklist
  - Pre-deployment tasks
  - Deployment steps
  - Post-deployment verification
  - Monitoring setup

## 🎯 Common Tasks

### Setup Development Environment
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start dev server
npm run dev
```
See: [QUICKSTART.md#step-1-setup-code](./QUICKSTART.md#step-1-setup-code)

### Deploy to Vercel
```bash
# Push to GitHub
git push origin main

# Import on Vercel
# https://vercel.com/new
```
See: [DEPLOYMENT.md#step-2-deploy-to-vercel](./DEPLOYMENT.md#step-2-deploy-to-vercel)

### Deploy Smart Contracts
```bash
cd foundry
forge script script/Deploy.s.sol --broadcast
```
See: [DEPLOYMENT.md#step-3-deploy-smart-contracts](./DEPLOYMENT.md#step-3-deploy-smart-contracts)

### Add New API Route
1. Create `app/api/your-route/route.ts`
2. Export GET/POST functions
3. Test at `/api/your-route`

See existing routes in `app/api/` for examples

### Add New Component
1. Create file in `components/`
2. Export component
3. Import in page/layout
4. Follow existing patterns

### Modify Portfolio Options
Edit `app/page.tsx`:
```typescript
const ASSETS = [
  { id: 'NEW', name: 'New Asset', icon: '🆕', color: 'text-blue-500' },
  // ... existing assets
];
```

### Update Prize Pool
Edit `app/api/league/current/route.ts`:
```typescript
const prizePool = 2000; // Change amount
```

### Customize Styling
- Global styles: `app/globals.css`
- Tailwind config: `tailwind.config.js`
- Component styles: Inline Tailwind classes

## 🔍 Finding Specific Features

### Wallet Connection
- Provider: `components/Providers.tsx`
- Config: Uses OnchainKit's Wallet component
- UI: `app/page.tsx` (header)

### Portfolio Selection
- Component: `components/portfolio/PortfolioBuilder.tsx`
- Logic: `app/page.tsx` (handleAssetToggle)
- Submission: `app/api/portfolio/submit/route.ts`

### Leaderboard
- Component: `components/league/LeaderboardPreview.tsx`
- API: `app/api/leaderboard/route.ts`
- Calculation: Uses Redis data + oracle prices

### Oracle Prices
- API: `app/api/oracle/prices/route.ts`
- Chainlink feeds configured in `.env`
- Update frequency: On-demand

### Farcaster Integration
- Manifest: `.well-known/farcaster.json/route.ts`
- Config: `minikit.config.ts`
- Webhook: `app/api/webhook/route.ts`

### Season Badges (NFT)
- Contract: `contracts/SeasonBadge.sol`
- Dynamic SVG generation
- Metadata based on performance

## 🐛 Troubleshooting

### Build Errors
- Check: [CHECKLIST.md#common-issues--fixes](./CHECKLIST.md#common-issues--fixes)
- Logs: Run `npm run build` locally

### API Issues
- Test: `curl https://your-app.vercel.app/api/route`
- Logs: Vercel dashboard → Logs

### Contract Issues
- Test: Foundry `forge test`
- Verify: Block explorer
- Debug: Check gas, inputs

### Environment Variables
- Template: `.env.example`
- Vercel: Project → Settings → Environment Variables
- Local: `.env.local` (not committed)

## 📚 Additional Resources

### External Documentation
- Base: https://docs.base.org
- OnchainKit: https://onchainkit.xyz
- MiniKit: https://docs.base.org/builderkits/minikit
- Wagmi: https://wagmi.sh
- Tailwind: https://tailwindcss.com

### Community
- Base Discord: https://discord.gg/buildonbase
- Farcaster: https://warpcast.com
- GitHub: https://github.com/your-repo

## 🎨 Customization Guide

### Branding
1. Update `minikit.config.ts` with your name/description
2. Replace images in `public/`
3. Update colors in `tailwind.config.js`
4. Modify `app/globals.css` for themes

### Game Rules
1. Change asset whitelist in `app/page.tsx`
2. Modify selection limit (default: 3)
3. Update prize distribution in `app/api/leaderboard/route.ts`
4. Change week duration in smart contract

### Add Features
1. Create new component in `components/`
2. Add API route if needed
3. Update smart contracts if on-chain
4. Test thoroughly
5. Update documentation

## 📊 Project Statistics

- **Total Files**: 30+
- **Lines of Code**: 3,000+
- **Components**: 5+
- **API Routes**: 5+
- **Smart Contracts**: 2
- **Documentation**: 5 guides

## 🚀 Quick Links

- 🏠 [Main README](./README.md)
- ⚡ [Quick Start](./QUICKSTART.md)
- 🔧 [Deployment Guide](./DEPLOYMENT.md)
- ✅ [Checklist](./CHECKLIST.md)
- 📊 [Project Summary](./PROJECT_SUMMARY.md)
- 📁 [This Index](./INDEX.md)

---

**Need help?** Start with [QUICKSTART.md](./QUICKSTART.md) or check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Found a bug?** Check [CHECKLIST.md](./CHECKLIST.md) troubleshooting section.

**Ready to customize?** See customization guide above or ask for help!
