// Mini-app configuration for Base App Directory
// Follow: https://docs.base.org/mini-apps/quickstart/create-new-miniapp

const ROOT_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imitatio.app';

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
    name: 'Imitatio',
    subtitle: 'Master Portfolio Strategy',
    description: 'Master the art of portfolio strategy. Emulate the best traders, compete weekly, win prizes. The ultimate on-chain portfolio game on Base.',
    
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
    tagline: 'Emulate. Compete. Win.',
    ogTitle: 'Imitatio - Master Portfolio Strategy',
    ogDescription: 'Master portfolio strategy. Emulate the best, compete weekly, win prizes on Base.',
    ogImageUrl: `${ROOT_URL}/og.svg`,
  },
} as const;

export default minikitConfig;












