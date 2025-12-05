# Base App Directory Submission Checklist

Quick checklist for submitting Portfolio League to [base.dev/apps](https://www.base.dev/apps).

---

## Pre-Submission Requirements

### 1. App Must Be Live
- [ ] Deployed to Vercel (or other hosting)
- [ ] All features working
- [ ] API routes responding
- [ ] No console errors

### 2. Required Assets

| Asset | Specs | Status |
|-------|-------|--------|
| App Icon | 512x512 PNG | [ ] Create `public/icon-512.png` |
| Cover Image | 1200x630 PNG | [ ] Create `public/splash.png` |
| OG Image | 1200x630 | [x] Exists at `public/og.svg` |
| Screenshots | 1280x720 (optional) | [ ] Add to `public/screenshots/` |

### 3. Farcaster Manifest
- [x] `.well-known/farcaster.json` route created
- [ ] Update with your actual domain after deployment
- [ ] Test: `https://YOUR-DOMAIN/.well-known/farcaster.json`

---

## Submission Steps

### Step 1: Go to Base.dev
Navigate to [base.dev/apps](https://www.base.dev/apps)

### Step 2: Connect Wallet
Click connect and use your main wallet.

### Step 3: Click "Submit App"
Look for the submission button (may require scrolling).

### Step 4: Fill Out Form

**App Name:**
```
Portfolio League
```

**URL:**
```
https://your-app.vercel.app
```

**Short Description (150 chars):**
```
Social crypto portfolio game. Pick 3 assets weekly, compete on the leaderboard, win prizes. Built on Base.
```

**Full Description:**
```
Portfolio League is a gamified portfolio competition where players select 3 crypto assets (BTC, ETH, SOL, or USDC) each week. Performance is tracked via on-chain oracles, and the top 10% of performers share the weekly prize pool.

Features:
• Weekly competitions with real prizes
• Real-time leaderboard
• On-chain price tracking via Chainlink
• Season badges (NFTs) for participants
• Farcaster social integration

Built with Next.js, OnchainKit, and deployed on Base.
```

**Category:**
- Primary: Gaming
- Secondary: DeFi

**Tags:**
```
gaming, portfolio, trading, competition, social
```

### Step 5: Upload Assets
- Upload your 512x512 icon
- Upload your 1200x630 cover image
- Add any screenshots

### Step 6: Submit
Click submit and wait for review.

---

## After Submission

### Review Timeline
- Typical: 1-2 weeks
- You may receive questions or requests for changes

### If Approved
- App appears in Base App Directory
- Share the news on Farcaster/Twitter
- Monitor for user feedback

### If Changes Requested
- Review feedback carefully
- Make requested changes
- Resubmit

---

## Tips for Approval

1. **Make sure app is fully functional** - Test all features before submitting
2. **Professional assets** - High-quality icon and screenshots help
3. **Clear description** - Explain what the app does simply
4. **No broken links** - Every link should work
5. **Mobile responsive** - Test on mobile devices
6. **Fast loading** - Optimize images, minimize bundle size

---

## Quick Links

- [Base App Directory](https://www.base.dev/apps)
- [Base Documentation](https://docs.base.org)
- [OnchainKit Docs](https://onchainkit.xyz)
- [Farcaster Mini-Apps Guide](https://docs.farcaster.xyz/developers/frames/v2)

---

**Ready to submit? Go to [base.dev/apps](https://www.base.dev/apps)** 🚀



