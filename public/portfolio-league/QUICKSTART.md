# 🚀 Quick Start Guide

Get Portfolio League up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Base wallet (e.g., Coinbase Wallet, Rainbow, MetaMask)
- ~0.01 ETH on Base for gas fees

## Step 1: Clone & Install

```bash
# Navigate to the project directory
cd portfolio-league

# Install dependencies
npm install
```

## Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your values
# Minimum required:
# - NEXT_PUBLIC_COINBASE_API_KEY (get from https://portal.cdp.coinbase.com/)
# - NEXT_PUBLIC_WC_PROJECT_ID (get from https://cloud.walletconnect.com/)
```

## Step 3: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## Step 4: Test the App

1. Connect your wallet
2. Try building a portfolio
3. Check the leaderboard
4. View your (mock) badges

## What's Next?

### For Development
- Customize assets in `app/types/index.ts`
- Modify UI components in `app/components/`
- Adjust game rules in smart contract

### For Production Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment guide:

1. **Deploy Smart Contracts** (30 min)
   - Configure Hardhat
   - Deploy to Base testnet
   - Deploy to Base mainnet
   - Verify contracts

2. **Deploy Frontend** (10 min)
   - Push to GitHub
   - Connect to Vercel
   - Configure environment variables
   - Deploy

3. **Register Mini-App** (15 min)
   - Configure MiniKit
   - Submit to Base app store
   - Test in production

4. **Setup Automation** (20 min)
   - Configure price oracle updates
   - Setup league automation
   - Configure monitoring

## Common Issues

### Wallet won't connect
- Check WalletConnect project ID is correct
- Try a different browser
- Clear cache and reload

### Contract calls fail
- Ensure you're on Base network
- Check you have ETH for gas
- Verify contract addresses match deployed contracts

### Prices not updating
- Check API route is accessible
- Verify oracle connection
- Check console for errors

## Need Help?

- 📖 Read the [full README](./README.md)
- 🚀 Check [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 Open an issue on GitHub
- 💬 Join our Discord (coming soon)

---

Happy building! 🏆
