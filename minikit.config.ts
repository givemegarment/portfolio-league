// Mini-app configuration for Base App Directory
// Follow: https://docs.base.org/mini-apps/quickstart/create-new-miniapp

const ROOT_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio-league.vercel.app';

export const minikitConfig = {
  // Account association - generate at https://base.dev/sign-manifest
  // After deploying, visit the sign manifest tool and paste your domain
  accountAssociation: {
    header: '', // Fill after signing manifest
    payload: '', // Fill after signing manifest  
    signature: '', // Fill after signing manifest
  },
  
  miniapp: {
    version: '1',
    name: 'Portfolio League',
    subtitle: 'Crypto Portfolio Competition',
    description: 'Pick 3 crypto assets each week. Compete against other traders. Top 10% share the $1,000 prize pool. Built on Base.',
    
    // Images - ensure these files exist in /public
    iconUrl: `${ROOT_URL}/icon-512.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: '#050507',
    heroImageUrl: `${ROOT_URL}/splash.png`,
    screenshotUrls: [
      `${ROOT_URL}/splash.png`,
    ],
    
    // URLs
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    
    // Categorization
    primaryCategory: 'gaming',
    tags: ['trading', 'competition', 'defi', 'portfolio', 'crypto'],
    
    // Open Graph metadata
    tagline: 'Pick. Compete. Win.',
    ogTitle: 'Portfolio League - Crypto Portfolio Competition',
    ogDescription: 'Pick 3 assets, compete weekly, win prizes. The ultimate social crypto game on Base.',
    ogImageUrl: `${ROOT_URL}/og.svg`,
  },
} as const;

export default minikitConfig;

