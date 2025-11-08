# Portfolio League - Complete macOS Beginner Guide

**Welcome!** This guide will help you deploy Portfolio League mini-app, even if you've never coded before.

**Time needed:** 1-2 hours
**Cost:** $0 (everything is free!)
**Difficulty:** ⭐⭐ (Beginner-friendly)

---

## 📋 What You'll Need

Before we start, make sure you have:
- ✅ A Mac computer with macOS 10.15 or newer
- ✅ Internet connection
- ✅ About 2 hours of time
- ✅ An email address

Don't worry about technical skills - we'll explain everything step by step!

---

## Part 1: Install Required Software (20 minutes)

### Step 1.1: Install Homebrew (Package Manager)

Homebrew helps you install software on Mac easily.

1. **Open Terminal:**
   - Press `Command + Space` to open Spotlight
   - Type "Terminal" and press Enter
   - A black/white window will open - this is Terminal!

2. **Copy and paste this command:**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

3. **Press Enter** and wait (this takes 5-10 minutes)
   - It will ask for your Mac password - type it (you won't see it, that's normal!)
   - Press Enter again

4. **Verify it worked:**
   ```bash
   brew --version
   ```
   You should see something like "Homebrew 4.x.x"

✅ **Success!** Homebrew is installed.

---

### Step 1.2: Install Node.js (JavaScript Runtime)

Node.js lets you run the app on your computer.

1. **In Terminal, type:**
   ```bash
   brew install node
   ```

2. **Wait 2-3 minutes** for it to install

3. **Check it worked:**
   ```bash
   node --version
   ```
   You should see "v18.x.x" or higher

✅ **Success!** Node.js is installed.

---

### Step 1.3: Install Git (Version Control)

Git helps you manage and upload code.

1. **In Terminal, type:**
   ```bash
   brew install git
   ```

2. **Configure Git with your name:**
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```
   Replace with your actual name and email!

3. **Check it worked:**
   ```bash
   git --version
   ```

✅ **Success!** Git is installed.

---

## Part 2: Create Required Accounts (15 minutes)

### Step 2.1: Create GitHub Account

GitHub stores your code online.

1. **Go to:** https://github.com/signup
2. **Enter your email** and follow the steps
3. **Choose the free plan**
4. **Verify your email**

✅ **Write down your GitHub username:** _______________

---

### Step 2.2: Create Vercel Account

Vercel hosts your app for free.

1. **Go to:** https://vercel.com/signup
2. **Click "Continue with GitHub"**
3. **Authorize Vercel** to access GitHub
4. **Complete signup**

✅ **You're logged into Vercel**

---

### Step 2.3: Create Farcaster Account

Farcaster is the social network for your mini-app.

1. **Go to:** https://warpcast.com
2. **Download Warpcast app** on your iPhone/Android
3. **Create account** (follow app instructions)
4. **Write down your username:** _______________

✅ **Farcaster account created**

---

### Step 2.4: Create Upstash Redis Account

Redis stores your app's data.

1. **Go to:** https://console.upstash.com
2. **Sign up** with GitHub or email
3. **Create new database:**
   - Click "Create Database"
   - Name: "portfolio-league"
   - Type: Global
   - Click "Create"

4. **Copy these values** (we'll need them later):
   - Scroll down to "REST API" section
   - Copy `UPSTASH_REDIS_REST_URL`: _______________
   - Copy `UPSTASH_REDIS_REST_TOKEN`: _______________

✅ **Upstash database created**

---

### Step 2.5: Get OnchainKit API Key

OnchainKit connects your app to Base blockchain.

1. **Go to:** https://portal.cdp.coinbase.com
2. **Sign in** with email or Coinbase account
3. **Create new project:**
   - Click "Create Project"
   - Name: "Portfolio League"
   - Click "Create"

4. **Get API Key:**
   - Click on your project
   - Go to "API Keys" tab
   - Click "Create API Key"
   - Copy the key: _______________

✅ **OnchainKit API key obtained**

---

### Step 2.6: Get Neynar API Key (Optional)

Neynar helps with Farcaster features.

1. **Go to:** https://neynar.com
2. **Sign up** with your email
3. **Create API Key:**
   - Go to Dashboard
   - Click "Create API Key"
   - Copy it: _______________

✅ **Neynar API key obtained**

---

## Part 3: Get the Code (10 minutes)

### Step 3.1: Download Portfolio League Code

1. **In Terminal, go to your Desktop:**
   ```bash
   cd ~/Desktop
   ```

2. **Create a projects folder:**
   ```bash
   mkdir projects
   cd projects
   ```

3. **Download the code** (we'll create it from the files I gave you)

4. **Navigate to the folder:**
   ```bash
   cd portfolio-league
   ```

---

### Step 3.2: Install Dependencies

Dependencies are the building blocks the app needs.

1. **In Terminal (make sure you're in portfolio-league folder):**
   ```bash
   npm install
   ```

2. **Wait 3-5 minutes** - lots of text will scroll by, that's normal!

3. **When it's done, you'll see something like:**
   ```
   added 243 packages
   ```

✅ **Dependencies installed**

---

## Part 4: Configure Your App (15 minutes)

### Step 4.1: Create Environment File

This file tells your app how to connect to services.

1. **In Terminal:**
   ```bash
   cp .env.example .env.local
   ```

2. **Open the file in TextEdit:**
   ```bash
   open -a TextEdit .env.local
   ```

3. **A file will open!** Now we'll fill it in.

---

### Step 4.2: Fill in Your API Keys

**Replace these values** with the ones you wrote down earlier:

```env
# Replace with your Upstash values
UPSTASH_REDIS_REST_URL=https://your-redis-url-here
UPSTASH_REDIS_REST_TOKEN=your-redis-token-here

# Replace with your OnchainKit API key
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your-onchainkit-key-here

# Replace with your Neynar API key (optional)
NEYNAR_API_KEY=your-neynar-key-here

# Keep these as they are for now
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CHAIN_ID=8453
```

4. **Save the file** (Command + S)
5. **Close TextEdit**

✅ **Environment configured**

---

## Part 5: Test Locally (10 minutes)

Let's make sure everything works on your Mac before deploying!

### Step 5.1: Start the Development Server

1. **In Terminal:**
   ```bash
   npm run dev
   ```

2. **Wait for this message:**
   ```
   ✓ Ready in 2.5s
   ○ Local:   http://localhost:3000
   ```

3. **Open your web browser** and go to:
   ```
   http://localhost:3000
   ```

4. **You should see Portfolio League!** 🎉

---

### Step 5.2: Test the App

1. **You should see:**
   - Portfolio League header
   - Week timer
   - 4 asset options (BTC, ETH, SOL, USDC)
   - Leaderboard preview

2. **Try clicking on assets** - they should highlight

3. **If you see errors:**
   - Check Terminal for red error messages
   - Make sure API keys are correct in `.env.local`
   - Try refreshing the page

✅ **App works locally!**

---

### Step 5.3: Stop the Server

1. **In Terminal, press:** `Control + C`
2. **The server will stop**

---

## Part 6: Upload to GitHub (10 minutes)

Now let's put your code online so Vercel can deploy it!

### Step 6.1: Create GitHub Repository

1. **Go to:** https://github.com/new
2. **Fill in:**
   - Repository name: `portfolio-league`
   - Description: "Social crypto portfolio game mini-app"
   - Make it **Public**
   - Don't check any boxes
3. **Click "Create repository"**

✅ **GitHub repository created**

---

### Step 6.2: Upload Your Code

1. **In Terminal (in your portfolio-league folder):**
   ```bash
   git init
   ```

2. **Add all files:**
   ```bash
   git add .
   ```

3. **Save a snapshot:**
   ```bash
   git commit -m "Initial commit"
   ```

4. **Connect to GitHub** (replace YOUR_USERNAME with your GitHub username):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/portfolio-league.git
   ```

5. **Upload:**
   ```bash
   git branch -M main
   git push -u origin main
   ```

6. **Enter your GitHub username and password** when asked
   - Note: Password might be a "Personal Access Token" - see below if needed

✅ **Code uploaded to GitHub!**

---

**If GitHub asks for a token instead of password:**

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it "Vercel Deploy"
4. Check "repo" box
5. Click "Generate token"
6. Copy the token and use it as your password

---

## Part 7: Deploy to Vercel (15 minutes)

### Step 7.1: Import Project to Vercel

1. **Go to:** https://vercel.com/new
2. **You'll see "Import Git Repository"**
3. **Find your `portfolio-league` repo** and click "Import"

---

### Step 7.2: Configure Deployment

1. **Framework Preset:** Should say "Next.js" (auto-detected)
2. **Root Directory:** Leave as is
3. **Build Command:** Leave as is (`npm run build`)

---

### Step 7.3: Add Environment Variables

This is important! Click "Environment Variables" to expand.

**Add these one by one:**

1. **Name:** `UPSTASH_REDIS_REST_URL`
   - **Value:** (paste your Upstash URL)
   - Click "Add"

2. **Name:** `UPSTASH_REDIS_REST_TOKEN`
   - **Value:** (paste your Upstash token)
   - Click "Add"

3. **Name:** `NEXT_PUBLIC_ONCHAINKIT_API_KEY`
   - **Value:** (paste your OnchainKit key)
   - Click "Add"

4. **Name:** `NEYNAR_API_KEY`
   - **Value:** (paste your Neynar key)
   - Click "Add"

5. **Name:** `NEXT_PUBLIC_CHAIN_ID`
   - **Value:** `8453`
   - Click "Add"

**Important:** Don't add `NEXT_PUBLIC_APP_URL` yet - we'll do that after deployment!

---

### Step 7.4: Deploy!

1. **Click "Deploy"** button
2. **Wait 2-3 minutes** - you'll see a build log
3. **When done, you'll see:** "Congratulations! 🎉"

4. **Copy your app URL** - it looks like:
   ```
   https://portfolio-league-abc123.vercel.app
   ```
   Write it down: _______________

✅ **App is live!**

---

### Step 7.5: Add App URL as Environment Variable

1. **In Vercel dashboard:**
   - Go to your project
   - Click "Settings" tab
   - Click "Environment Variables"

2. **Add new variable:**
   - Name: `NEXT_PUBLIC_APP_URL`
   - Value: (your Vercel URL from above)
   - Select all environments (Production, Preview, Development)
   - Click "Save"

3. **Redeploy:**
   - Go to "Deployments" tab
   - Click "..." menu on latest deployment
   - Click "Redeploy"
   - Confirm

✅ **App URL configured!**

---

## Part 8: Disable Vercel Protection (5 minutes)

**Important:** For mini-apps to work, we need to disable Vercel's authentication.

1. **In Vercel dashboard:**
   - Go to your project
   - Click "Settings" tab
   - Click "Deployment Protection" in sidebar

2. **Toggle OFF:**
   - Find "Vercel Authentication"
   - Toggle it to **OFF**
   - Click "Save"

✅ **Protection disabled**

---

## Part 9: Configure Farcaster (10 minutes)

### Step 9.1: Generate Account Association

1. **Go to:** https://build.base.org/account-association

2. **Enter your Vercel URL** (without https://):
   ```
   portfolio-league-abc123.vercel.app
   ```

3. **Click "Submit"**

4. **Click "Verify"** button that appears

5. **Follow the instructions** to sign with your Farcaster account
   - This might open Warpcast app
   - Approve the signature

6. **Copy the generated JSON** - it looks like:
   ```json
   {
     "header": "eyJ...",
     "payload": "eyJ...",
     "signature": "MH..."
   }
   ```

✅ **Account association generated!**

---

### Step 9.2: Update Your Config File

1. **On your Mac, open Terminal**

2. **Navigate to project:**
   ```bash
   cd ~/Desktop/projects/portfolio-league
   ```

3. **Open config file:**
   ```bash
   open -a TextEdit minikit.config.ts
   ```

4. **Find this section:**
   ```typescript
   accountAssociation: {
     header: "",
     payload: "",
     signature: ""
   },
   ```

5. **Replace with your values:**
   ```typescript
   accountAssociation: {
     header: "eyJ...",  // Paste your header
     payload: "eyJ...", // Paste your payload
     signature: "MH..." // Paste your signature
   },
   ```

6. **Save the file** (Command + S)

---

### Step 9.3: Upload Changes

1. **In Terminal:**
   ```bash
   git add minikit.config.ts
   git commit -m "Add account association"
   git push
   ```

2. **Wait 2 minutes** - Vercel will automatically redeploy

✅ **Farcaster configured!**

---

## Part 10: Test Your Mini-App! (10 minutes)

### Step 10.1: Test in Preview Tool

1. **Go to:** https://base.dev/preview

2. **Enter your Vercel URL:**
   ```
   https://portfolio-league-abc123.vercel.app
   ```

3. **Click "Preview"**

4. **Check that:**
   - ✅ Manifest loads
   - ✅ App launches
   - ✅ You can see the interface

---

### Step 10.2: Test in Browser

1. **Open your Vercel URL** in a browser

2. **You should see:**
   - Portfolio League interface
   - Week timer
   - Asset selection
   - Leaderboard

3. **Try:**
   - Clicking on assets
   - Seeing them highlight
   - Viewing the leaderboard

✅ **Mini-app works!**

---

## 🎉 Congratulations! You Did It!

Your Portfolio League mini-app is now LIVE!

**Your app URL:** https://portfolio-league-abc123.vercel.app

---

## 📱 Next Steps

### Share Your App

1. **On Farcaster/Warpcast:**
   - Create a new cast
   - Add your app URL
   - Share with friends!

2. **In Base Discord:**
   - Join: https://discord.gg/buildonbase
   - Share in #mini-apps channel

---

### Add Features (Later)

Want to customize? You can:
- Change the assets available
- Modify prize amounts
- Update colors and branding
- Add more leagues

See [DEPLOYMENT.md](./DEPLOYMENT.md) for smart contract deployment (v2 features).

---

## 🆘 Troubleshooting

### "Command not found" Error

**Problem:** Terminal doesn't recognize a command

**Solution:**
1. Make sure you installed everything in Part 1
2. Close and reopen Terminal
3. Try the command again

---

### App Shows Errors When Loading

**Problem:** Red error messages on your app

**Solution:**
1. Check Vercel dashboard → Logs
2. Verify all API keys are correct
3. Make sure environment variables are saved
4. Try redeploying

---

### Can't Push to GitHub

**Problem:** Git asks for password but it doesn't work

**Solution:**
1. You need a Personal Access Token (PAT)
2. Go to: https://github.com/settings/tokens
3. Generate new token with "repo" access
4. Use token as password

---

### Vercel Build Fails

**Problem:** Deployment fails with errors

**Solution:**
1. Check that all environment variables are set
2. Look at build logs in Vercel
3. Make sure `.env.local` is NOT in GitHub (it shouldn't be)
4. Try deploying again

---

### Manifest Not Loading

**Problem:** Farcaster can't find your manifest

**Solution:**
1. Test URL: https://your-app.vercel.app/.well-known/farcaster.json
2. Should show JSON, not error
3. Check that account association is correct
4. Redeploy if needed

---

## 📚 Learn More

- **Vercel Documentation:** https://vercel.com/docs
- **Base Documentation:** https://docs.base.org
- **OnchainKit Docs:** https://onchainkit.xyz
- **Video Tutorials:** Search YouTube for "Base mini-apps"

---

## 💬 Get Help

**Stuck? Don't worry!**

1. **Read error messages carefully** - they often tell you what's wrong
2. **Google the error** - someone else has probably solved it
3. **Ask in Discord:** https://discord.gg/buildonbase
4. **Check documentation** in this project

---

## ✅ Checklist Summary

Print this and check off as you go:

- [ ] Installed Homebrew
- [ ] Installed Node.js
- [ ] Installed Git
- [ ] Created GitHub account
- [ ] Created Vercel account
- [ ] Created Farcaster account
- [ ] Created Upstash database
- [ ] Got OnchainKit API key
- [ ] Got Neynar API key
- [ ] Downloaded project code
- [ ] Installed dependencies
- [ ] Created .env.local file
- [ ] Added API keys to .env.local
- [ ] Tested app locally
- [ ] Created GitHub repository
- [ ] Uploaded code to GitHub
- [ ] Imported to Vercel
- [ ] Added environment variables
- [ ] Deployed to Vercel
- [ ] Disabled Vercel protection
- [ ] Generated account association
- [ ] Updated minikit.config.ts
- [ ] Pushed changes
- [ ] Tested in preview tool
- [ ] Tested in browser
- [ ] Shared on Farcaster

---

**You're now a mini-app developer!** 🎉

Keep experimenting, learning, and building cool things!
