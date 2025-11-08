# 🔧 Troubleshooting Guide for Beginners

**Having issues? Don't worry - everyone encounters problems!** This guide will help you fix common issues step by step.

---

## 📋 How to Use This Guide

1. **Find your error** in the table of contents
2. **Read the explanation** to understand what's wrong
3. **Follow the solution** step by step
4. **Test it works** before moving on

**Still stuck?** Jump to the "Get Help" section at the bottom.

---

## Table of Contents

**Installation Issues:**
- [Homebrew won't install](#homebrew-wont-install)
- [Node.js command not found](#nodejs-command-not-found)
- [Git command not found](#git-command-not-found)
- [npm install fails](#npm-install-fails)

**Account & API Issues:**
- [Can't create GitHub account](#cant-create-github-account)
- [GitHub asks for token not password](#github-asks-for-token-not-password)
- [Upstash won't create database](#upstash-wont-create-database)
- [Can't find API keys](#cant-find-api-keys)

**Development Issues:**
- [npm run dev doesn't work](#npm-run-dev-doesnt-work)
- [Port 3000 already in use](#port-3000-already-in-use)
- [App shows blank page](#app-shows-blank-page)
- [Environment variables not working](#environment-variables-not-working)

**Deployment Issues:**
- [Can't push to GitHub](#cant-push-to-github)
- [Vercel build fails](#vercel-build-fails)
- [App works locally but not on Vercel](#app-works-locally-but-not-on-vercel)
- [Vercel shows 404 error](#vercel-shows-404-error)

**Farcaster Integration:**
- [Manifest not loading](#manifest-not-loading)
- [Account association fails](#account-association-fails)
- [Preview tool shows errors](#preview-tool-shows-errors)

---

## 🍺 Installation Issues

### Homebrew Won't Install

**Error messages you might see:**
```
Failed to connect to raw.githubusercontent.com
xcrun: error: invalid active developer path
```

**What's wrong:**
- No internet connection
- Xcode Command Line Tools not installed
- GitHub is blocked

**Solution:**

1. **Check internet connection:**
   ```bash
   ping google.com
   ```
   Press Control + C to stop. If it says "ping: cannot resolve", fix your internet first.

2. **Install Xcode Command Line Tools:**
   ```bash
   xcode-select --install
   ```
   A popup will appear - click "Install"

3. **Try Homebrew again:**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

4. **If still stuck:**
   - Restart your Mac
   - Try on a different Wi-Fi network
   - Check if GitHub is accessible: https://github.com

---

### Node.js Command Not Found

**Error messages:**
```
zsh: command not found: node
bash: node: command not found
```

**What's wrong:**
- Node.js not installed
- Terminal needs restart
- Path not configured

**Solution:**

1. **Check if Node is actually installed:**
   ```bash
   brew list node
   ```
   If it says "Error: No such keg", Node isn't installed.

2. **Install Node:**
   ```bash
   brew install node
   ```

3. **Close and reopen Terminal**

4. **Test again:**
   ```bash
   node --version
   ```

5. **If still not working, add to PATH:**
   ```bash
   echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

---

### Git Command Not Found

**Error messages:**
```
zsh: command not found: git
```

**What's wrong:**
Same as Node.js - not installed or path issue

**Solution:**

```bash
# Install git
brew install git

# Close and reopen Terminal
# Test
git --version
```

---

### npm install Fails

**Error messages:**
```
npm ERR! code EACCES
npm ERR! network timeout
npm ERR! 404 Not Found
```

**What's wrong:**
- Permission issues
- Network problems
- Wrong directory

**Solution:**

1. **Check you're in the right folder:**
   ```bash
   pwd
   ```
   Should show: `/Users/yourname/Desktop/projects/portfolio-league`

2. **If not, navigate there:**
   ```bash
   cd ~/Desktop/projects/portfolio-league
   ```

3. **Check package.json exists:**
   ```bash
   ls package.json
   ```
   Should show: `package.json`

4. **Try installing again:**
   ```bash
   npm install
   ```

5. **If EACCES error, fix permissions:**
   ```bash
   sudo chown -R $USER ~/.npm
   npm install
   ```

6. **If network error:**
   - Check internet connection
   - Try again in 5 minutes
   - Use different Wi-Fi

7. **Nuclear option (start fresh):**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## 👤 Account & API Issues

### Can't Create GitHub Account

**Problems:**
- Email already used
- Username taken
- Verification email not arriving

**Solution:**

1. **Email already used:**
   - Use a different email
   - Or try to log in (maybe you already have account?)
   - Try password reset

2. **Username taken:**
   - Add numbers: `yourname123`
   - Add underscore: `your_name`
   - Try variations

3. **No verification email:**
   - Check spam folder
   - Wait 10 minutes
   - Request new verification email
   - Try different email provider

---

### GitHub Asks for Token Not Password

**Error messages:**
```
Username for 'https://github.com': yourname
Password for 'https://yourname@github.com': 
remote: Support for password authentication was removed
```

**What's wrong:**
GitHub no longer accepts passwords for command-line operations. You need a Personal Access Token (PAT).

**Solution:**

1. **Go to:** https://github.com/settings/tokens

2. **Click "Generate new token (classic)"**

3. **Fill in:**
   - Note: "Portfolio League Deploy"
   - Expiration: 90 days
   - Select scopes: Check "repo"

4. **Click "Generate token"**

5. **IMPORTANT: Copy the token NOW**
   It looks like: `ghp_xxxxxxxxxxxxxxxxxxxx`
   You can't see it again!

6. **Save it somewhere safe**

7. **When git asks for password, paste the token**

8. **To avoid entering it every time:**
   ```bash
   git config --global credential.helper osxkeychain
   ```

---

### Upstash Won't Create Database

**Problems:**
- Signup fails
- Database creation hangs
- Can't find REST API section

**Solution:**

1. **Signup issues:**
   - Try GitHub login instead of email
   - Check email verification
   - Try different browser

2. **Database creation:**
   - Try different region (US-East or EU-West)
   - Use "Regional" instead of "Global" if failing
   - Refresh page and try again

3. **Can't find REST API:**
   - Click on your database name
   - Scroll down past "Details" section
   - Look for "REST API" heading
   - If not there, check you're on database page (not list)

---

### Can't Find API Keys

**Upstash:**
- Dashboard → Your Database → Scroll to "REST API"
- Copy both URL and Token

**OnchainKit:**
- https://portal.cdp.coinbase.com
- Click your project
- "API Keys" tab
- If no keys, click "Create API Key"

**Neynar:**
- https://neynar.com
- Dashboard (top right)
- "API Keys" section
- Create one if none exist

**Can't find the portal?**
- Clear browser cookies
- Try incognito mode
- Use different browser
- Contact support

---

## 💻 Development Issues

### npm run dev Doesn't Work

**Error messages:**
```
Error: Cannot find module 'next'
Error: EADDRINUSE: address already in use
```

**Solutions by error:**

**"Cannot find module":**
```bash
# Install dependencies
npm install

# If that fails, clean install
rm -rf node_modules package-lock.json
npm install
```

**"Address already in use" (Port 3000):**
```bash
# Option 1: Stop other server
# Press Control + C in other Terminal windows

# Option 2: Use different port
npm run dev -- -p 3001
# Then open: http://localhost:3001
```

**"Permission denied":**
```bash
# Fix permissions
chmod +x node_modules/.bin/next
npm run dev
```

**Just hangs (no output):**
```bash
# Kill Node processes
killall node
# Try again
npm run dev
```

---

### Port 3000 Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**What's wrong:**
Another program is using port 3000.

**Solution:**

**Option 1: Find and stop the program**
```bash
# Find what's using port 3000
lsof -ti:3000

# Kill it (replace PID with number from above)
kill -9 PID
```

**Option 2: Use different port**
```bash
npm run dev -- -p 3001
```
Then open `http://localhost:3001`

**Option 3: Stop all Node**
```bash
killall node
npm run dev
```

---

### App Shows Blank Page

**What you see:**
- White screen
- No content
- Console errors (Press F12 or Command+Option+I to check)

**Solution:**

1. **Check Terminal for errors:**
   Look for red error messages

2. **Check browser console:**
   - Press Command + Option + I (Mac)
   - Click "Console" tab
   - Look for red errors

3. **Common causes:**

   **Missing environment variables:**
   ```bash
   # Check .env.local exists
   ls .env.local
   
   # If not, create it
   cp .env.example .env.local
   # Then fill in your API keys
   ```

   **Syntax error in code:**
   - Look at Terminal for error location
   - Check that file for typos
   - Look for missing brackets or quotes

   **Browser cache:**
   - Hard refresh: Command + Shift + R
   - Or clear browser cache

4. **Try clean start:**
   ```bash
   # Stop server (Control + C)
   # Clear build cache
   rm -rf .next
   # Start again
   npm run dev
   ```

---

### Environment Variables Not Working

**Symptoms:**
- API errors
- "undefined" values
- Blank sections

**Solution:**

1. **Check file exists:**
   ```bash
   ls -la .env.local
   ```

2. **Check file format:**
   ```bash
   cat .env.local
   ```
   Should look like:
   ```
   UPSTASH_REDIS_REST_URL=https://...
   NEXT_PUBLIC_ONCHAINKIT_API_KEY=...
   ```

3. **Common mistakes:**

   **Extra spaces:**
   ❌ `KEY = value`
   ✅ `KEY=value`

   **Quotes (usually not needed):**
   ❌ `KEY="value"`
   ✅ `KEY=value`

   **Wrong variable names:**
   - Must match exactly
   - Case-sensitive
   - Check .env.example for correct names

4. **Restart development server:**
   ```bash
   # Stop with Control + C
   npm run dev
   ```
   Changes to .env.local require restart!

---

## 🚀 Deployment Issues

### Can't Push to GitHub

**Error messages:**
```
remote: Repository not found
remote: Permission denied
fatal: Authentication failed
```

**Solutions by error:**

**"Repository not found":**
```bash
# Check remote URL
git remote -v

# Should show:
# origin  https://github.com/YOUR_USERNAME/portfolio-league.git

# If wrong, fix it:
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/portfolio-league.git
```

**"Permission denied":**
- Use Personal Access Token (see [GitHub Asks for Token](#github-asks-for-token-not-password))
- Make sure repo is yours
- Check you're logged into correct GitHub account

**"Authentication failed":**
- Use token instead of password
- Check token has "repo" permission
- Generate new token if expired

**"Nothing to commit":**
```bash
# Check if files are staged
git status

# Add files
git add .
git commit -m "Your message"
git push
```

---

### Vercel Build Fails

**Error in Vercel:**
```
Build failed
Module not found
Environment variable missing
```

**Solution:**

1. **Check build logs:**
   - Vercel dashboard
   - Click deployment
   - Read full error message

2. **Common causes:**

   **Missing environment variables:**
   - Go to Vercel → Settings → Environment Variables
   - Add missing variables
   - Redeploy

   **Dependency issues:**
   - Make sure package.json is in GitHub
   - Make sure package-lock.json is in GitHub
   - Try local build first: `npm run build`

   **Syntax errors:**
   - Check local build works
   - Fix any TypeScript errors
   - Commit and push fixes

3. **Force clean build:**
   - Deployments tab
   - Three dots menu
   - "Redeploy"
   - Check "Clear cache and redeploy"

---

### App Works Locally But Not on Vercel

**Problem:**
- Local: ✅ Works perfectly
- Vercel: ❌ Errors or blank

**What's different:**
- Environment variables
- Build process
- Node version

**Solution:**

1. **Compare environment variables:**
   ```bash
   # Local (.env.local)
   cat .env.local
   ```
   vs
   - Vercel → Settings → Environment Variables

   **Make sure they match exactly!**

2. **Check Node version:**
   - Vercel uses Node 18 by default
   - Your Mac might use different version
   - Usually not an issue unless using very new features

3. **Check build locally:**
   ```bash
   npm run build
   npm run start
   ```
   If this fails, fix errors before deploying

4. **Common gotchas:**

   **NEXT_PUBLIC_ prefix:**
   - Variables used in browser MUST start with `NEXT_PUBLIC_`
   - Example: `NEXT_PUBLIC_APP_URL`
   - Without prefix, they're only available on server

   **Hardcoded localhost:**
   - Search code for `localhost:3000`
   - Should use `process.env.NEXT_PUBLIC_APP_URL`

---

### Vercel Shows 404 Error

**Problem:**
All pages show "404 - Page Not Found"

**Causes:**
- Wrong root directory
- Build output issue
- Routing problem

**Solution:**

1. **Check root directory:**
   - Vercel → Settings → General
   - Root Directory should be: `./`
   - NOT `./app` or `./src`

2. **Check framework:**
   - Should say "Next.js"
   - If not, click Edit
   - Select "Next.js"

3. **Check build output:**
   - Look at build logs
   - Should say "Generating static pages"
   - Should show page routes

4. **Redeploy:**
   - Deployments tab
   - Redeploy latest
   - Check "Clear cache"

---

## 🔗 Farcaster Integration

### Manifest Not Loading

**Error:**
```
Failed to load manifest
404 Not Found
```

**Testing:**
Visit: `https://your-app.vercel.app/.well-known/farcaster.json`

**Should see:** JSON data
**Actually see:** 404 or error

**Solution:**

1. **Check file exists:**
   ```bash
   ls app/.well-known/farcaster.json/route.ts
   ```

2. **Check next.config.js:**
   Should have headers for `.well-known/farcaster.json`

3. **Check minikit.config.ts:**
   - Must have valid values
   - No empty strings in accountAssociation (yet)

4. **Redeploy:**
   ```bash
   git push
   ```
   Wait 2 minutes for Vercel

5. **Test again:**
   `https://your-app.vercel.app/.well-known/farcaster.json`

---

### Account Association Fails

**Error:**
"Failed to verify" or "Invalid signature"

**Solution:**

1. **Make sure app is deployed:**
   - URL must be accessible
   - Manifest must load
   - No 404 errors

2. **Disable Vercel Protection:**
   - Settings → Deployment Protection
   - Turn OFF "Vercel Authentication"

3. **Use correct URL:**
   - Enter just domain: `your-app.vercel.app`
   - NOT `https://your-app.vercel.app`
   - NOT `https://your-app.vercel.app/`

4. **Try again:**
   - Clear browser cache
   - Use incognito mode
   - Try different browser

5. **Check Warpcast connection:**
   - Make sure logged in
   - Account must be active
   - Try mobile app if desktop fails

---

### Preview Tool Shows Errors

**At base.dev/preview:**
- ❌ Manifest not loaded
- ❌ Account association failed
- ❌ Preview won't load

**Solution:**

Work through each error:

1. **Manifest error:**
   - See [Manifest Not Loading](#manifest-not-loading)
   - Fix and test again

2. **Account association error:**
   - See [Account Association Fails](#account-association-fails)
   - Make sure accountAssociation in minikit.config.ts is filled
   - Redeploy after changes

3. **Preview won't load:**
   - Check browser console (F12)
   - Look for CORS errors
   - Check app works at Vercel URL
   - Try different browser

4. **Everything shows green:**
   - ✅ You're good to go!
   - App is ready to use

---

## 🆘 Still Stuck?

### Before Asking for Help

Gather this information:

1. **What were you trying to do?**
   - Specific step from guide
   - What command you ran

2. **What happened?**
   - Exact error message (copy/paste)
   - Screenshot if helpful

3. **What have you tried?**
   - List solutions you attempted
   - What happened with each

4. **Your setup:**
   - macOS version
   - Node version: `node --version`
   - npm version: `npm --version`

### Where to Get Help

**Base Discord** (Best for mini-app questions)
- https://discord.gg/buildonbase
- #mini-apps channel
- #onchainkit channel

**Vercel Discord** (Deployment issues)
- https://vercel.com/discord
- #help channel

**GitHub Discussions** (Project-specific)
- Your repository
- Create new discussion
- Include info from "Before Asking" above

**Stack Overflow** (General coding)
- Search first (often already answered)
- Tag: next.js, vercel, base
- Include minimal code example

### How to Ask Good Questions

**❌ Bad question:**
"It doesn't work help!"

**✅ Good question:**
"I'm getting 'Module not found' error when running npm run dev. I've tried npm install and deleting node_modules. Error shows: [exact error]. Using macOS 13.1, Node v18.0.0. Screenshots attached."

**Template:**
```
**Problem:** [One sentence description]

**What I'm trying to do:** [Specific step]

**Error message:** 
```
[Exact error - copy/paste]
```

**What I've tried:**
1. [First solution attempt]
2. [Second solution attempt]

**My setup:**
- macOS: [version]
- Node: [version]
- Browser: [name and version]

**Screenshots:** [If helpful]
```

---

## ✅ Prevention Tips

**To avoid issues:**

1. **Read carefully:**
   - Don't skip steps
   - Don't rush
   - Follow order exactly

2. **Check your work:**
   - Copy/paste commands (don't type)
   - Verify URLs and keys
   - Test after each major step

3. **Keep notes:**
   - Write down your URLs
   - Save API keys securely
   - Track what you've done

4. **Use version control:**
   - Commit often
   - Write clear commit messages
   - Can rollback if needed

5. **Stay organized:**
   - One project, one folder
   - Clear naming
   - Don't rename files

6. **Keep learning:**
   - Read error messages
   - Google errors
   - Learn from mistakes

---

## 🎯 Success Checklist

**Everything working if:**

✅ `npm run dev` starts server
✅ http://localhost:3000 shows app
✅ Can select assets
✅ No console errors (F12)
✅ Code on GitHub
✅ Deployed to Vercel
✅ Vercel URL loads
✅ Manifest loads
✅ Account association verified
✅ Preview tool shows green
✅ No errors in Vercel logs

**If all checked, you're done! 🎉**

---

**Remember:** Every developer gets errors. What matters is learning to fix them!

**You've got this! 💪**
