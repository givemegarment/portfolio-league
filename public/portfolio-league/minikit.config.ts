const ROOT_URL = process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app";

export const minikitConfig = {
  accountAssociation: {
    // Will be filled after deployment - see deployment guide
    header: "",
    payload: "",
    signature: ""
  },
  miniapp: {
    version: "1",
    name: "Portfolio League",
    subtitle: "Social Crypto Portfolio Game",
    description: "Weekly leagues where players pick 3-asset baskets. Top performers win prizes!",
    screenshotUrls: [
      `${ROOT_URL}/screenshots/main.png`,
      `${ROOT_URL}/screenshots/portfolio.png`,
      `${ROOT_URL}/screenshots/leaderboard.png`
    ],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#0052FF",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["trading", "crypto", "game", "portfolio", "competition"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Compete. Win. Earn.",
    ogTitle: "Portfolio League - Social Crypto Trading Game",
    ogDescription: "Pick your 3-asset portfolio and compete weekly for prizes",
    ogImageUrl: `${ROOT_URL}/og-image.png`,
  },
} as const;
