# Portfolio League - Quick Reference Card
**Print this page and keep it handy!**

---

## 🔑 Your Important Information

| Item | Your Value |
|------|-----------|
| GitHub Username | _________________ |
| Vercel App URL | _________________ |
| Farcaster Username | _________________ |
| Upstash Redis URL | _________________ |
| Upstash Redis Token | _________________ |
| OnchainKit API Key | _________________ |
| Neynar API Key | _________________ |

---

## 💻 Essential Terminal Commands

### Navigate to Project
```bash
cd ~/Desktop/projects/portfolio-league
```

### Start Development Server (test locally)
```bash
npm run dev
# Then open: http://localhost:3000
# Stop with: Control + C
```

### Upload Changes to GitHub
```bash
git add .
git commit -m "Description of changes"
git push
```

### Install New Dependencies
```bash
npm install
```

---

## 🌐 Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Your App** | https://your-app.vercel.app | Your live mini-app |
| **Vercel Dashboard** | https://vercel.com/dashboard | Manage deployments |
| **GitHub Repo** | https://github.com/YOUR_USERNAME/portfolio-league | Your code |
| **Base Preview** | https://base.dev/preview | Test mini-app |
| **Account Association** | https://build.base.org/account-association | Farcaster setup |
| **Upstash Console** | https://console.upstash.com | Database management |
| **CDP Portal** | https://portal.cdp.coinbase.com | API keys |

---

## 🔧 Common Tasks

### Change Prize Amount
1. Open `app/api/league/current/route.ts`
2. Find: `const prizePool = 1000;`
3. Change to desired amount
4. Save and push to GitHub

### Add New Asset
1. Open `app/page.tsx`
2. Find `const ASSETS = [...]`
3. Add: `{ id: 'NEW', name: 'New Asset', icon: '🔷', color: 'text-blue-500' }`
4. Save and push to GitHub

### Check Logs
1. Go to Vercel Dashboard
2. Click your project
3. Click "Logs" tab
4. See errors and requests

### Redeploy After Changes
**Automatic:** Just push to GitHub
```bash
git push
```
**Manual:** Vercel Dashboard → Deployments → Click "..." → Redeploy

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| **App won't load** | Check Vercel logs, verify API keys |
| **Can't push to GitHub** | Use Personal Access Token instead of password |
| **Build fails** | Check environment variables in Vercel |
| **Wallet won't connect** | Verify NEXT_PUBLIC_ONCHAINKIT_API_KEY is set |
| **Changes not showing** | Clear browser cache, wait for redeploy |
| **API errors** | Check Redis is working, verify URLs |

---

## 📁 Important Files

| File | What It Does |
|------|--------------|
| `app/page.tsx` | Main app interface |
| `minikit.config.ts` | Farcaster configuration |
| `.env.local` | Your API keys (local only) |
| `app/api/*/route.ts` | Backend logic |
| `components/` | Reusable UI pieces |
| `contracts/` | Smart contracts |

---

## 🚀 Deploy Checklist

- [ ] All accounts created
- [ ] API keys obtained  
- [ ] Code on GitHub
- [ ] Environment variables in Vercel
- [ ] Vercel protection disabled
- [ ] Account association added
- [ ] Tested in preview tool
- [ ] Live and working

---

## 🎯 Daily Maintenance

**Every Day:**
- Check app is working: Visit your URL
- Review Vercel logs for errors
- Check Upstash usage (stay under limits)

**Weekly:**
- Update leaderboard
- Verify oracle prices working
- Check Redis data

**Monthly:**
- Review and rotate API keys
- Update dependencies: `npm update`
- Check for Base updates

---

## 📞 Get Help

- **Discord:** https://discord.gg/buildonbase
- **Base Docs:** https://docs.base.org
- **Vercel Support:** https://vercel.com/support
- **Documentation:** Read MACOS_BEGINNER_GUIDE.md

---

## 🎓 Learning Resources

**Video Tutorials:**
- Search YouTube: "Base mini-apps tutorial"
- Search YouTube: "Next.js beginner guide"

**Documentation:**
- Next.js: https://nextjs.org/docs
- React: https://react.dev
- Tailwind CSS: https://tailwindcss.com/docs

**Communities:**
- Base Discord: https://discord.gg/buildonbase
- Farcaster: https://warpcast.com
- r/BaseDev on Reddit

---

## ⚡ Pro Tips

1. **Save Often** - Push to GitHub regularly
2. **Test Locally First** - Use `npm run dev` before deploying
3. **Read Error Messages** - They usually tell you what's wrong
4. **Google Is Your Friend** - Most errors have been solved before
5. **Join Communities** - Ask questions in Discord
6. **Document Changes** - Keep notes on what you modify
7. **Backup** - GitHub IS your backup, push often!

---

**Version:** 1.0
**Last Updated:** 2025

Keep this card handy for quick reference! 📌
