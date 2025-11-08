# Portfolio League - Visual Walkthrough

This guide shows you what your screen should look like at each step. Use this alongside the main beginner guide!

---

## 🖥️ Step-by-Step Visual Guide

### 1. Opening Terminal (macOS)

**What to do:**
- Press `Command + Space`
- Type "Terminal"
- Press Enter

**What you'll see:**
```
┌─────────────────────────────────────────┐
│ Terminal                                │
├─────────────────────────────────────────┤
│                                         │
│ Last login: Fri Nov 7 10:30:45         │
│ username@MacBook-Pro ~ %               │
│ █                                       │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

The blinking cursor (█) means Terminal is ready for commands!

---

### 2. Installing Homebrew

**What to do:**
Paste the Homebrew install command

**What you'll see:**
```
==> Checking for `sudo` access (which may request your password)...
Password: █
==> This script will install:
/opt/homebrew/bin/brew
...
Press RETURN to continue or any other key to abort:
```

**Action needed:**
1. Type your Mac password (it won't show - that's normal!)
2. Press Enter
3. Press Enter again to confirm
4. Wait 5-10 minutes

**When done:**
```
==> Installation successful!
```

---

### 3. Installing Node.js

**What to do:**
Type `brew install node`

**What you'll see:**
```
==> Downloading node
==> Installing node
🍺  /opt/homebrew/Cellar/node/20.x.x: 2,500 files, 50MB
```

**Verify with:** `node --version`
```
v20.11.0
```

✅ Any version starting with "v18" or higher is good!

---

### 4. Creating GitHub Account

**What you'll see on GitHub:**

```
┌──────────────────────────────────────┐
│  Welcome to GitHub                   │
│  ─────────────────────────────       │
│                                      │
│  Email:  your-email@example.com      │
│          [                    ]      │
│                                      │
│  Password: [                  ]      │
│                                      │
│  Username: [                  ]      │
│                                      │
│         [ Continue ]                 │
└──────────────────────────────────────┘
```

**Tips:**
- Choose a professional username
- Use a strong password
- Verify your email!

---

### 5. Creating Vercel Account

**What you'll see:**

```
┌──────────────────────────────────────┐
│  Sign Up for Vercel                  │
│  ───────────────────────────────     │
│                                      │
│  [ Continue with GitHub ]            │
│                                      │
│  ─── or ───                          │
│                                      │
│  [ Continue with GitLab ]            │
│  [ Continue with Bitbucket ]         │
│  [ Continue with Email ]             │
└──────────────────────────────────────┘
```

**Click:** "Continue with GitHub" (easiest!)

---

### 6. Upstash Redis Dashboard

**What you'll see after creating database:**

```
┌─────────────────────────────────────────────┐
│ portfolio-league                            │
│ ─────────────────────────────────────────   │
│                                             │
│ Region: Global                              │
│ Status: ● Active                            │
│                                             │
│ REST API                                    │
│ ─────────                                   │
│ UPSTASH_REDIS_REST_URL                      │
│ https://us1-ruling-cod-12345.upstash.io     │
│ [📋 Copy]                                    │
│                                             │
│ UPSTASH_REDIS_REST_TOKEN                    │
│ AYZ5ASQgNjE0...                             │
│ [📋 Copy]                                    │
└─────────────────────────────────────────────┘
```

**Important:** Click the 📋 copy buttons!

---

### 7. Local Development Server Running

**What to do:**
Type `npm run dev`

**What you'll see in Terminal:**
```
> portfolio-league@0.1.0 dev
> next dev

  ▲ Next.js 15.0.0
  - Local:        http://localhost:3000
  - Experiments (use with caution):
    · instrumentationHook

 ✓ Ready in 2.5s
 ○ Compiling / ...
 ✓ Compiled / in 1.2s
```

**In your browser at http://localhost:3000:**
```
┌────────────────────────────────────────┐
│ Portfolio League        [Connect Wallet]│
│ Week 1 • Season 1                       │
├────────────────────────────────────────┤
│                                         │
│ Current Week: 1                         │
│ Time Remaining: 6d 23h 45m              │
│                                         │
│ Pick Your 3-Asset Portfolio             │
│ ─────────────────────────────────────  │
│                                         │
│  ┌──────┐  ┌──────┐                    │
│  │  ₿   │  │  Ξ   │                    │
│  │ BTC  │  │ ETH  │                    │
│  └──────┘  └──────┘                    │
│                                         │
│  ┌──────┐  ┌──────┐                    │
│  │  ◎   │  │  $   │                    │
│  │ SOL  │  │ USDC │                    │
│  └──────┘  └──────┘                    │
└────────────────────────────────────────┘
```

---

### 8. GitHub Repository Page

**What you'll see after creating repo:**

```
┌─────────────────────────────────────────────┐
│ YOUR_USERNAME / portfolio-league            │
│ Public                                       │
├─────────────────────────────────────────────┤
│                                             │
│ Quick setup — if you've done this before    │
│                                             │
│ HTTPS  [https://github.com/USER/repo.git]  │
│                                             │
│ …or create a new repository on the         │
│ command line                                │
│                                             │
│ git init                                    │
│ git add README.md                           │
│ git commit -m "first commit"                │
│ git remote add origin https://...           │
│ git push -u origin main                     │
└─────────────────────────────────────────────┘
```

**You'll use these commands in Terminal!**

---

### 9. Vercel Import Project

**What you'll see:**

```
┌─────────────────────────────────────────────┐
│ Import Git Repository                       │
├─────────────────────────────────────────────┤
│                                             │
│ Search repositories...                      │
│ [🔍                             ]           │
│                                             │
│ YOUR_USERNAME/portfolio-league              │
│ Public repository                           │
│                            [Import]         │
│                                             │
│ YOUR_USERNAME/other-repo                    │
│ Public repository                           │
│                            [Import]         │
└─────────────────────────────────────────────┘
```

**Click:** Import button next to portfolio-league

---

### 10. Vercel Environment Variables

**What you'll see:**

```
┌─────────────────────────────────────────────┐
│ Configure Project                           │
├─────────────────────────────────────────────┤
│                                             │
│ Environment Variables (optional)            │
│ [Show Advanced Options]                     │
│                                             │
│ Name                                        │
│ [UPSTASH_REDIS_REST_URL            ]       │
│                                             │
│ Value                                       │
│ [https://us1-ruling-cod-12345...   ]       │
│                                             │
│           [Add]                             │
│                                             │
│ ┌─────────────────────────────────────┐    │
│ │ UPSTASH_REDIS_REST_URL              │    │
│ │ UPSTASH_REDIS_REST_TOKEN            │    │
│ │ NEXT_PUBLIC_ONCHAINKIT_API_KEY      │    │
│ └─────────────────────────────────────┘    │
│                                             │
│               [Deploy]                      │
└─────────────────────────────────────────────┘
```

**Add all your environment variables here!**

---

### 11. Vercel Building

**What you'll see:**

```
┌─────────────────────────────────────────────┐
│ Building...                                 │
├─────────────────────────────────────────────┤
│                                             │
│ Building production bundle                  │
│ ████████████████░░░░░░░░░░░ 65%            │
│                                             │
│ Build Logs:                                 │
│ > npm run build                             │
│ > portfolio-league@0.1.0 build              │
│ > next build                                │
│                                             │
│ Collecting page data...                     │
│ Generating static pages (5/10)              │
│ Finalizing page optimization...             │
└─────────────────────────────────────────────┘
```

**Wait 2-3 minutes...**

---

### 12. Vercel Success!

**What you'll see:**

```
┌─────────────────────────────────────────────┐
│ Congratulations! 🎉                         │
├─────────────────────────────────────────────┤
│                                             │
│ Your project has been deployed               │
│                                             │
│ https://portfolio-league-abc123.vercel.app  │
│                                             │
│ [Visit Preview]    [View Deployment Logs]   │
│                                             │
│ Next Steps:                                 │
│ • Connect a custom domain                   │
│ • Set up monitoring                         │
│ • Configure team access                     │
└─────────────────────────────────────────────┘
```

**Your app is LIVE! 🎉**

---

### 13. Base Preview Tool

**What you'll see at base.dev/preview:**

```
┌─────────────────────────────────────────────┐
│ Base Mini App Preview                       │
├─────────────────────────────────────────────┤
│                                             │
│ App URL                                     │
│ [portfolio-league-abc123.vercel.app ]      │
│                                             │
│                    [Preview]                │
│                                             │
│ Results:                                    │
│ ✅ Manifest loaded                          │
│ ✅ Account association verified             │
│ ✅ Frame preview available                  │
│                                             │
│ ┌─────────────────────────────────────┐    │
│ │  [App Preview]                      │    │
│ │                                     │    │
│ │  Portfolio League                   │    │
│ │  Week 1 • Season 1                  │    │
│ └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

**Green checkmarks = Success!**

---

### 14. Your Live App

**What users will see:**

```
┌──────────────────────────────────────────┐
│ Portfolio League          [Connect Wallet]│
│ Week 1 • Season 1                         │
├──────────────────────────────────────────┤
│                                           │
│ ┌────────────────────────────────────┐   │
│ │ Current Week: 1                    │   │
│ │ Time Remaining: 6d 23h 45m         │   │
│ │                                    │   │
│ │ Prize Pool: 1,000 USDC             │   │
│ │ Total Participants: 247 players    │   │
│ └────────────────────────────────────┘   │
│                                           │
│ Pick Your 3-Asset Portfolio               │
│ ───────────────────────────────           │
│                                           │
│ ┌────────┐  ┌────────┐                   │
│ │   ₿    │  │   Ξ    │                   │
│ │  BTC   │  │  ETH   │                   │
│ │Bitcoin │  │Ethereum│                   │
│ └────────┘  └────────┘                   │
│                                           │
│ ┌────────┐  ┌────────┐                   │
│ │   ◎    │  │   $    │                   │
│ │  SOL   │  │  USDC  │                   │
│ │ Solana │  │  Yield │                   │
│ └────────┘  └────────┘                   │
│                                           │
│ Your Selection:                           │
│ [ No assets selected ]                    │
│                                           │
│ [ Connect Wallet to Submit ]              │
│                                           │
│ ─────────────────────────────────────     │
│                                           │
│ Leaderboard                    View All → │
│ ─────────────────────────────────────     │
│                                           │
│ 🥇 0x1234...5678  BTC ETH SOL  +12.5%    │
│ 🥈 0xabcd...efgh  ETH SOL USDC  +9.8%    │
│ 🥉 0x9876...4321  BTC SOL USDC  +8.3%    │
│                                           │
└──────────────────────────────────────────┘
```

---

## 🎨 Color Guide

When working on your app, these are the main colors:

**Base Blue** (Primary): `#0052FF`
```
████ Used for buttons, highlights
```

**Green** (Positive): `#10B981`
```
████ Used for gains, success
```

**Red** (Negative): `#EF4444`
```
████ Used for losses, errors
```

**Gray** (Background): `#1F2937`
```
████ Used for cards, containers
```

---

## 📱 Mobile View

**Your app is responsive! On mobile it looks like:**

```
┌──────────────┐
│Portfolio     │
│League        │
│              │
│Week 1        │
│              │
│  ┌────┐      │
│  │ ₿  │      │
│  │BTC │      │
│  └────┘      │
│              │
│  ┌────┐      │
│  │ Ξ  │      │
│  │ETH │      │
│  └────┘      │
│              │
│  ┌────┐      │
│  │ ◎  │      │
│  │SOL │      │
│  └────┘      │
│              │
│  ┌────┐      │
│  │ $  │      │
│  │USDC│      │
│  └────┘      │
│              │
│[Connect]     │
└──────────────┘
```

**Test on your phone!**

---

## ⚠️ Common Error Messages

### Error: "Module not found"

```
Error: Cannot find module 'next'
```

**What this means:** Dependencies not installed

**Fix:** Run `npm install`

---

### Error: "Port already in use"

```
Error: Port 3000 is already in use
```

**What this means:** Another app is using port 3000

**Fix:** 
1. Stop other dev servers (Control + C)
2. Or use different port: `npm run dev -- -p 3001`

---

### Error: "Invalid API key"

```
Error: 401 Unauthorized
```

**What this means:** API key is wrong or missing

**Fix:** 
1. Check `.env.local` has correct keys
2. Verify keys in Vercel dashboard
3. Redeploy if needed

---

## 🎯 Success Indicators

**You know it's working when you see:**

✅ Terminal shows "Ready in X.Xs"
✅ Browser shows your app (not error page)
✅ Assets can be clicked and selected
✅ Vercel deployment shows green checkmark
✅ Base preview shows "Manifest loaded"
✅ No red errors in browser console (F12 to check)

---

## 📸 Screenshot Guide

**Take screenshots at these stages:**

1. **After first npm run dev** - Proves local works
2. **Vercel success page** - Record your URL
3. **Base preview with green checks** - Verify manifest
4. **Live app in browser** - Final result

**Why?** If something breaks later, you can compare!

---

**Use this guide alongside MACOS_BEGINNER_GUIDE.md for best results!**
