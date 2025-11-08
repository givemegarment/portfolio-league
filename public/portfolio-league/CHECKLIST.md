# Portfolio League - Deployment Checklist ✅

Use this checklist to ensure smooth deployment of your Portfolio League mini-app.

## Pre-Deployment Checklist

### 1. Accounts Setup
- [ ] Vercel account created and verified
- [ ] Farcaster account created on Warpcast
- [ ] Coinbase Developer Platform account (optional but recommended)
- [ ] Upstash Redis database created
- [ ] Neynar API key obtained (for Farcaster features)

### 2. Local Development
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` file created from `.env.example`
- [ ] All API keys added to `.env.local`
- [ ] Local development server runs (`npm run dev`)
- [ ] No console errors in browser

### 3. Code Review
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Components render correctly
- [ ] API routes respond properly
- [ ] Wallet connection works locally

## Deployment Checklist

### 4. GitHub Setup
- [ ] Repository created on GitHub
- [ ] Code committed and pushed
- [ ] Repository is public or Vercel has access
- [ ] `.gitignore` excludes sensitive files
- [ ] No `.env.local` in repository

### 5. Vercel Deployment
- [ ] Project imported to Vercel
- [ ] Framework preset: Next.js selected
- [ ] Build command: `npm run build`
- [ ] Environment variables added:
  - [ ] `NEXT_PUBLIC_APP_URL`
  - [ ] `NEXT_PUBLIC_CHAIN_ID`
  - [ ] `NEXT_PUBLIC_CDP_API_KEY`
  - [ ] `NEXT_PUBLIC_ONCHAINKIT_API_KEY`
  - [ ] `NEXT_PUBLIC_PAYMASTER_URL`
  - [ ] `UPSTASH_REDIS_REST_URL`
  - [ ] `UPSTASH_REDIS_REST_TOKEN`
  - [ ] `NEYNAR_API_KEY`
- [ ] Initial deployment successful
- [ ] Deployment Protection disabled
- [ ] Preview URL accessible

### 6. Smart Contract Deployment
- [ ] Foundry installed
- [ ] Contract dependencies installed
- [ ] Deploy script configured
- [ ] Contracts deployed to Base (Sepolia or Mainnet)
- [ ] Contract addresses verified on block explorer
- [ ] Environment variables updated with contract addresses:
  - [ ] `NEXT_PUBLIC_LEAGUE_CONTRACT`
  - [ ] `NEXT_PUBLIC_BADGE_NFT_CONTRACT`
- [ ] Vercel redeployed with new variables

### 7. Farcaster Integration
- [ ] App accessible at Vercel URL
- [ ] Visited Base Build Account Association tool
- [ ] Account association generated
- [ ] `minikit.config.ts` updated with association data
- [ ] Changes committed and deployed
- [ ] Manifest endpoint accessible: `/.well-known/farcaster.json`

### 8. Testing
- [ ] Preview at base.dev/preview works
- [ ] Manifest loads correctly
- [ ] Account association verified
- [ ] App launches in preview
- [ ] Wallet connection works
- [ ] Portfolio selection works
- [ ] API endpoints respond:
  - [ ] `/api/league/current`
  - [ ] `/api/oracle/prices`
  - [ ] `/api/leaderboard`
- [ ] No console errors
- [ ] Mobile responsive

### 9. Mini-App Testing
- [ ] Tested in Coinbase Wallet mobile app
- [ ] Tested in Warpcast frames
- [ ] Share card generation works
- [ ] Notifications work (if enabled)
- [ ] Webhook receives events

### 10. Production Readiness
- [ ] Error monitoring setup (e.g., Sentry)
- [ ] Analytics configured (optional)
- [ ] Uptime monitoring active
- [ ] Backup plan for Redis data
- [ ] Smart contracts verified on Basescan
- [ ] Documentation complete
- [ ] Support channels ready

## Post-Deployment Checklist

### 11. Launch Activities
- [ ] Announce on Farcaster
- [ ] Share in relevant Discord servers
- [ ] Post on Twitter/X
- [ ] Submit to Base ecosystem directory
- [ ] Add to mini-app showcases

### 12. Monitoring
- [ ] Check Vercel logs daily
- [ ] Monitor error rates
- [ ] Track user engagement
- [ ] Review Oracle price updates
- [ ] Monitor Redis usage

### 13. Weekly Operations
- [ ] Verify new week starts correctly
- [ ] Check leaderboard calculations
- [ ] Process prize distributions
- [ ] Review participant submissions
- [ ] Update community

### 14. Season Operations
- [ ] Plan season end date
- [ ] Prepare badge minting
- [ ] Calculate final rankings
- [ ] Distribute season rewards
- [ ] Archive season data

## Troubleshooting Quick Reference

### Common Issues

**Build Fails on Vercel**
```bash
# Check: 
- Node.js version (should be 18+)
- Environment variables are set
- All dependencies in package.json
- No syntax errors in code
```

**Wallet Won't Connect**
```bash
# Check:
- OnchainKit API key is valid
- Paymaster URL is correct
- Network is Base (not Ethereum)
- MiniKitProvider wraps app
```

**API Routes 404**
```bash
# Check:
- Route files end in route.ts
- Files in correct /app/api/ structure
- No TypeScript errors in route
- Vercel logs for errors
```

**Manifest Not Loading**
```bash
# Test:
curl https://your-app.vercel.app/.well-known/farcaster.json

# Should return JSON with frame data
# Check next.config.js headers
```

**Oracle Prices Not Updating**
```bash
# Check:
- Chainlink feed addresses correct
- RPC endpoint responding
- Network is Base Mainnet
- Test: curl https://your-app.vercel.app/api/oracle/prices
```

## Support Resources

- **Vercel Issues**: https://vercel.com/support
- **Base Discord**: https://discord.gg/buildonbase
- **OnchainKit Docs**: https://onchainkit.xyz/docs
- **MiniKit Guide**: https://docs.base.org/builderkits/minikit

## Version History

Track your deployments:

```
[ ] v0.1.0 - Initial deployment (Date: _____)
[ ] v0.2.0 - Smart contracts deployed (Date: _____)
[ ] v0.3.0 - Farcaster integration complete (Date: _____)
[ ] v1.0.0 - Public launch (Date: _____)
```

---

**Remember**: Test thoroughly on testnet before mainnet deployment!

**Questions?** Review DEPLOYMENT.md for detailed instructions.
