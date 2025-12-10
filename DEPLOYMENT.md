# Portfolio League - Deployment Guide

Complete guide to deploy Portfolio League on Vercel and submit to Base App Directory.

---

## Prerequisites

Before deploying, ensure you have:

1. **GitHub Account** - To host your code
2. **Vercel Account** - Free at [vercel.com](https://vercel.com)
3. **API Keys Ready**:
   - OnchainKit API Key (free from [Coinbase CDP](https://portal.cdp.coinbase.com))
   - Upstash Redis (free tier at [upstash.com](https://console.upstash.com))

---

## Phase 1: Vercel Deployment

### Step 1: Push to GitHub

```bash
# Initialize git if not already
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Portfolio League"

# Create repo on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/portfolio-league.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `portfolio-league` repository
4. Vercel auto-detects Next.js - leave settings as default
5. **Before deploying**, configure Environment Variables:

### Step 3: Configure Environment Variables

In Vercel dashboard → Project Settings → Environment Variables, add:

| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` | Yes |
| `NEXT_PUBLIC_ONCHAINKIT_API_KEY` | Your OnchainKit key | Yes |
| `UPSTASH_REDIS_REST_URL` | Your Upstash URL | Yes |
| `UPSTASH_REDIS_REST_TOKEN` | Your Upstash token | Yes |

### Step 4: Deploy

Click **"Deploy"** and wait for build to complete (usually 1-2 minutes).

### Step 5: Verify Deployment

After deployment, verify:

- [ ] Homepage loads correctly
- [ ] Asset selection works
- [ ] Leaderboard loads (may be empty initially)
- [ ] API routes respond:
  - `https://your-app.vercel.app/api/leaderboard`
  - `https://your-app.vercel.app/api/portfolio`

---

## Phase 2: Prepare for Base App Directory

### Required Assets

Before submitting to Base.dev, prepare these assets:

#### 1. App Icon (512x512 PNG)
Save as `public/icon-512.png`

```
- Size: 512 x 512 pixels
- Format: PNG with transparency
- Style: Your app logo on transparent or branded background
```

#### 2. Splash Screen (1200x630 PNG)
Save as `public/splash.png`

```
- Size: 1200 x 630 pixels  
- Format: PNG
- Content: App name, tagline, visual branding
```

#### 3. OG Image (1200x630)
Already exists at `public/og.svg` - consider converting to PNG

#### 4. Screenshots (Optional but recommended)
```
- Size: 1280 x 720 or similar
- Show: Portfolio builder, leaderboard, key features
- Save in: public/screenshots/
```

### Update Farcaster Manifest

After deployment, update the manifest with your actual domain:

1. Edit `src/app/.well-known/farcaster.json/route.ts`
2. Update `NEXT_PUBLIC_SITE_URL` in Vercel to your actual domain
3. Redeploy

---

## Phase 3: Submit to Base App Directory

### Step 1: Access Base.dev

1. Go to [base.dev/apps](https://www.base.dev/apps)
2. Connect your wallet (same wallet you'll use for the app)

### Step 2: Submit Your App

Click **"Submit App"** and fill in:

| Field | Value |
|-------|-------|
| **App Name** | Portfolio League |
| **URL** | `https://your-app.vercel.app` |
| **Description** | Social crypto portfolio competition. Pick 3 assets, compete weekly, win prizes. Built on Base. |
| **Category** | Gaming / DeFi |
| **Icon** | Upload `icon-512.png` |
| **Cover Image** | Upload `splash.png` |

### Step 3: Review Process

- Submissions are reviewed by the Base team
- Timeline: Usually 1-2 weeks
- You may receive feedback or requests for changes
- Once approved, your app appears in the directory

---

## Post-Launch Checklist

After your app is live:

- [ ] Monitor error logs in Vercel dashboard
- [ ] Check Redis usage in Upstash dashboard
- [ ] Announce on Farcaster/Twitter
- [ ] Collect user feedback
- [ ] Plan v2 features based on usage

---

## Troubleshooting

### Build Fails on Vercel
- Check Node.js version (should be 18+)
- Verify all environment variables are set
- Check build logs for specific errors

### API Routes Return 500
- Verify Redis credentials are correct
- Check Vercel Function logs
- Ensure OnchainKit API key is valid

### Farcaster Integration Not Working
- Verify `.well-known/farcaster.json` route returns valid JSON
- Check that `NEXT_PUBLIC_SITE_URL` matches your domain
- Test manifest at: `https://your-app.vercel.app/.well-known/farcaster.json`

### App Rejected from Base Directory
- Ensure app is fully functional
- Check that all links work
- Verify assets meet size requirements
- Review Base's submission guidelines

---

## Resources

- [Vercel Docs](https://vercel.com/docs)
- [Base Documentation](https://docs.base.org)
- [OnchainKit](https://onchainkit.xyz)
- [Upstash Redis](https://upstash.com/docs/redis/overall/getstarted)
- [Farcaster Mini-Apps](https://docs.farcaster.xyz/developers/frames/v2)

---

## Support

Need help? 
- Open an issue on GitHub
- Join the Base Discord
- Check Farcaster for community support

---

**Good luck with your launch!** 🚀





