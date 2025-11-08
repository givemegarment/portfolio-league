# Portfolio League - Deployment Guide

Complete guide to deploying your Portfolio League mini-app to Base and making it available on Farcaster/Coinbase Wallet.

## Prerequisites

Before deploying, ensure you have:

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Farcaster Account** - Create at [warpcast.com](https://warpcast.com)
3. **Base Account** - Get testnet ETH from [Base Sepolia Faucet](https://faucet.base.org)
4. **Coinbase Developer Platform Account** (Optional) - For CDP API access
5. **Upstash Account** - For Redis database

## Step 1: Environment Setup

### 1.1 Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd portfolio-league
npm install
```

### 1.2 Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the required values:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_CHAIN_ID=8453  # Base Mainnet (or 84532 for Sepolia)

# Coinbase Developer Platform
NEXT_PUBLIC_CDP_API_KEY=your_cdp_api_key
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key
NEXT_PUBLIC_PAYMASTER_URL=https://api.developer.coinbase.com/rpc/v1/base/your-key

# Database (Upstash Redis)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Farcaster
NEYNAR_API_KEY=your_neynar_api_key
```

### 1.3 Get API Keys

**OnchainKit API Key:**
- Visit [Coinbase Developer Platform](https://portal.cdp.coinbase.com)
- Create a new project
- Copy your API key

**Upstash Redis:**
- Go to [Upstash Console](https://console.upstash.com)
- Create a new Redis database
- Copy REST URL and Token

**Neynar API Key (for Farcaster):**
- Visit [Neynar](https://neynar.com)
- Sign up and create an API key

## Step 2: Deploy to Vercel

### 2.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

### 2.2 Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next
   
4. Add Environment Variables:
   - Click on "Environment Variables"
   - Add all variables from your `.env.local`
   - Important: Add variables for all environments (Production, Preview, Development)

5. Click **Deploy**

Wait for deployment to complete (usually 2-3 minutes).

### 2.3 Disable Vercel Authentication

IMPORTANT: For the mini-app to work, you must disable Vercel's deployment protection:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Deployment Protection**
3. Toggle **"Vercel Authentication"** to **OFF**
4. Click **Save**

## Step 3: Deploy Smart Contracts

### 3.1 Install Foundry (if not already installed)

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 3.2 Create Foundry Project Structure

```bash
mkdir foundry
cd foundry
forge init --no-commit
```

### 3.3 Copy Contracts

Copy the contracts from `contracts/` to `foundry/src/`:

```bash
cp ../contracts/*.sol src/
```

### 3.4 Install Dependencies

```bash
forge install OpenZeppelin/openzeppelin-contracts
forge install smartcontractkit/chainlink
```

### 3.5 Create Deploy Script

Create `script/Deploy.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/PortfolioLeague.sol";
import "../src/SeasonBadge.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address usdcAddress = vm.envAddress("USDC_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy contracts
        SeasonBadge badge = new SeasonBadge();
        PortfolioLeague league = new PortfolioLeague(usdcAddress);
        
        // Link contracts
        badge.setLeagueContract(address(league));
        
        // Set price feeds (Base Mainnet)
        league.setPriceFeed(PortfolioLeague.Asset.BTC, 0x64c911996D3c6aC71f9b455B1E8E7266BcbD848F);
        league.setPriceFeed(PortfolioLeague.Asset.ETH, 0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70);
        
        vm.stopBroadcast();
        
        console.log("PortfolioLeague deployed at:", address(league));
        console.log("SeasonBadge deployed at:", address(badge));
    }
}
```

### 3.6 Deploy to Base

**For Base Sepolia (Testnet):**

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://sepolia.base.org \
  --broadcast \
  --verify
```

**For Base Mainnet:**

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://mainnet.base.org \
  --broadcast \
  --verify
```

### 3.7 Update Environment Variables

Add deployed contract addresses to your `.env.local` and Vercel:

```env
NEXT_PUBLIC_LEAGUE_CONTRACT=0x...
NEXT_PUBLIC_BADGE_NFT_CONTRACT=0x...
```

Update in Vercel:
1. Go to Vercel project → Settings → Environment Variables
2. Add/update the contract addresses
3. Redeploy the app

## Step 4: Configure Farcaster Integration

### 4.1 Generate Account Association

1. Visit [Base Build Account Association Tool](https://build.base.org/account-association)
2. Enter your Vercel URL (e.g., `your-app.vercel.app`)
3. Click **Submit**
4. Click **Verify** and follow instructions
5. Copy the generated `accountAssociation` object

### 4.2 Update minikit.config.ts

Replace the empty `accountAssociation` in `minikit.config.ts`:

```typescript
export const minikitConfig = {
  accountAssociation: {
    header: "eyJ...",  // Paste your header
    payload: "eyJ...", // Paste your payload
    signature: "MH..." // Paste your signature
  },
  // ... rest of config
};
```

### 4.3 Deploy Updated Config

```bash
git add minikit.config.ts
git commit -m "Add account association"
git push
```

Vercel will automatically redeploy.

## Step 5: Test and Publish

### 5.1 Preview Your Mini-App

1. Go to [base.dev/preview](https://base.dev/preview)
2. Enter your app URL
3. Test the following:
   - ✅ Manifest loads correctly
   - ✅ Account association verified
   - ✅ App launches in preview
   - ✅ Wallet connection works
   - ✅ Portfolio submission works

### 5.2 Test in Coinbase Wallet

1. Open Coinbase Wallet mobile app
2. Go to "Apps" or "Discover"
3. Search for your mini-app or use direct link
4. Test all features

### 5.3 Publish on Farcaster

To make your mini-app discoverable:

1. Create a cast on Farcaster with your mini-app link
2. Use format: `Try Portfolio League! <your-app-url>`
3. Tag relevant communities

## Step 6: Post-Deployment

### 6.1 Monitor Logs

```bash
# Vercel logs
vercel logs

# Or in Vercel dashboard
# Project → Logs
```

### 6.2 Set Up Monitoring

Consider adding:
- Error tracking (Sentry)
- Analytics (PostHog, Mixpanel)
- Uptime monitoring (BetterUptime)

### 6.3 Regular Maintenance

- **Weekly**: Finalize week, distribute prizes
- **Monthly**: Review performance, update content
- **Season End**: Mint badges for all participants

## Troubleshooting

### Common Issues

**1. "Module not found" errors**
```bash
npm install
# or
rm -rf node_modules package-lock.json
npm install
```

**2. Manifest not loading**
- Check CORS headers in `next.config.js`
- Verify `.well-known/farcaster.json` route works
- Test: `curl https://your-app.vercel.app/.well-known/farcaster.json`

**3. Wallet connection fails**
- Verify OnchainKit API key is correct
- Check network configuration (Base Mainnet vs Sepolia)
- Ensure paymaster URL is valid

**4. Oracle prices not updating**
- Verify Chainlink feed addresses for Base
- Check RPC endpoint is responding
- Test oracle route: `curl https://your-app.vercel.app/api/oracle/prices`

**5. Redis connection errors**
- Verify Upstash credentials
- Check Redis URL format
- Ensure REST API is enabled

### Getting Help

- **Base Discord**: [discord.gg/buildonbase](https://discord.gg/buildonbase)
- **OnchainKit Docs**: [docs.base.org/builderkits/minikit](https://docs.base.org/builderkits/minikit)
- **MiniKit Debugging**: [docs.base.org/builderkits/minikit/debugging](https://docs.base.org/builderkits/minikit/debugging)

## Next Steps

### v2 Features (Real Money Vault)

1. **Deploy Vault Contract**
   - Create pooled vault with position limits
   - Implement risk controls (max loss caps)
   - Add withdrawal mechanisms

2. **KYC/Compliance**
   - Add identity verification
   - Implement geographic restrictions
   - Add terms acceptance flow

3. **Advanced Features**
   - Multiple leagues (pro, beginner, etc.)
   - Custom portfolios (4-5 assets)
   - Historical performance tracking
   - Social features (follow, copy trades)

---

**Congratulations!** 🎉 Your Portfolio League mini-app is now live!

Share with the community and start your first season!
