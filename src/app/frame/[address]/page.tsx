import { Metadata } from 'next';
import { redirect } from 'next/navigation';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio-league.vercel.app';

type Props = {
  params: Promise<{ address: string }>;
};

// Fetch portfolio data from Redis via API
async function getPortfolioData(address: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/portfolio?address=${address}`, {
      next: { revalidate: 60 },
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch {
    return null;
  }
}

// Fetch leaderboard to get rank and score
async function getLeaderboardPosition(address: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/leaderboard`, {
      next: { revalidate: 60 },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    // Find the user in the leaderboard
    if (Array.isArray(data)) {
      const entry = data.find(
        (item: { user: string }) => item.user.toLowerCase() === address.toLowerCase()
      );
      if (entry) {
        return {
          rank: entry.rank,
          score: entry.score,
        };
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  
  // Get portfolio data
  const portfolioData = await getPortfolioData(address);
  const leaderboardData = await getLeaderboardPosition(address);
  
  // Build OG image URL with portfolio allocations
  const ogParams = new URLSearchParams();
  ogParams.set('address', address);
  
  if (portfolioData?.portfolio?.allocations) {
    ogParams.set('allocations', JSON.stringify(portfolioData.portfolio.allocations));
  }
  
  if (leaderboardData?.score !== undefined) {
    ogParams.set('score', String(leaderboardData.score));
  }
  
  if (leaderboardData?.rank !== undefined) {
    ogParams.set('rank', String(leaderboardData.rank));
  }
  
  if (portfolioData?.weekInfo) {
    ogParams.set('week', String(portfolioData.weekInfo.week));
    ogParams.set('season', String(portfolioData.weekInfo.season?.replace('s', '') || '1'));
  }
  
  const ogImageUrl = `${BASE_URL}/api/og/portfolio?${ogParams.toString()}`;
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  
  // Build description based on score
  let description = `Check out this crypto portfolio on Portfolio League. Think you can beat it? Join the competition!`;
  if (leaderboardData?.score !== undefined) {
    const scoreStr = leaderboardData.score >= 0 
      ? `+${leaderboardData.score.toFixed(2)}%` 
      : `${leaderboardData.score.toFixed(2)}%`;
    description = `${shortAddress}'s portfolio is ${scoreStr} this week on Portfolio League! Think you can beat it?`;
  }
  
  const title = `${shortAddress}'s Portfolio | Portfolio League`;
  const frameUrl = `${BASE_URL}/frame/${address}`;

  return {
    title,
    description,
    metadataBase: new URL(BASE_URL),
    openGraph: {
      title,
      description,
      type: 'website',
      url: frameUrl,
      siteName: 'Portfolio League',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${shortAddress}'s Portfolio Allocation`,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
      site: '@portfolioleague',
      creator: '@portfolioleague',
    },
    // Farcaster Frame meta tags
    other: {
      'fc:frame': 'vNext',
      'fc:frame:image': ogImageUrl,
      'fc:frame:image:aspect_ratio': '1.91:1',
      'fc:frame:button:1': 'Join Competition →',
      'fc:frame:button:1:action': 'link',
      'fc:frame:button:1:target': BASE_URL,
      'fc:frame:button:2': 'View Leaderboard',
      'fc:frame:button:2:action': 'link',
      'fc:frame:button:2:target': `${BASE_URL}/leaderboard`,
    },
  };
}

export default async function FramePage({ params }: Props) {
  const { address } = await params;
  
  // Redirect to main app with referral - this page is primarily for meta tags
  redirect(`/?ref=${address}`);
}









