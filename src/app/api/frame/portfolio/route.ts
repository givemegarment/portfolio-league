import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { getCurrentWeek, getWeekKey } from '@/lib/weeks';
import { calculateScore, type StoredPortfolio, type PriceData } from '@/lib/scoring';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio-league.vercel.app';

type FrameButton = {
  label: string;
  action?: 'post' | 'link' | 'post_redirect';
  target?: string;
};

function generateFrameHtml({
  imageUrl,
  buttons,
  postUrl,
  title = 'Portfolio League',
}: {
  imageUrl: string;
  buttons: FrameButton[];
  postUrl?: string;
  title?: string;
}): string {
  const buttonTags = buttons
    .map((btn, idx) => {
      const index = idx + 1;
      let tags = `<meta property="fc:frame:button:${index}" content="${btn.label}" />`;
      if (btn.action) {
        tags += `\n<meta property="fc:frame:button:${index}:action" content="${btn.action}" />`;
      }
      if (btn.target) {
        tags += `\n<meta property="fc:frame:button:${index}:target" content="${btn.target}" />`;
      }
      return tags;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <meta property="og:title" content="${title}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  ${postUrl ? `<meta property="fc:frame:post_url" content="${postUrl}" />` : ''}
  ${buttonTags}
</head>
<body>
  <h1>${title}</h1>
  <img src="${imageUrl}" alt="${title}" />
</body>
</html>`;
}

/**
 * GET - Render portfolio Frame for a specific address
 * /api/frame/portfolio?address=0x...
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    // Show default frame prompting to connect
    const imageUrl = `${BASE_URL}/api/og/portfolio?address=Connect+Wallet`;
    const html = generateFrameHtml({
      imageUrl,
      buttons: [
        { label: '🎯 Join Competition', action: 'link', target: BASE_URL },
        { label: '🏆 View Leaderboard', action: 'link', target: `${BASE_URL}#leaderboard` },
      ],
      title: 'Portfolio League - Join the Competition',
    });
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  let allocations: { symbol: string; percentage: number }[] = [];
  let score: number | null = null;
  let rank: number | null = null;

  // First try to get allocations from URL params (passed when sharing)
  const allocationsParam = searchParams.get('allocations');
  const scoreParam = searchParams.get('score');
  const rankParam = searchParams.get('rank');

  if (allocationsParam) {
    try {
      allocations = JSON.parse(decodeURIComponent(allocationsParam));
      if (scoreParam) score = parseFloat(scoreParam);
      if (rankParam) rank = parseInt(rankParam);
    } catch (e) {
      console.error('Error parsing URL allocations:', e);
    }
  }

  // If no allocations from URL, try Redis as fallback
  if (allocations.length === 0) {
    try {
      const { season, week } = getCurrentWeek();
      const weekKey = getWeekKey(season, week);
      const portfolioJson = await redis.hget<string>(weekKey, address);

      if (portfolioJson) {
        const portfolio: StoredPortfolio = JSON.parse(portfolioJson);
        allocations = portfolio.allocations;

        // Calculate current score if we have entry prices
        if (portfolio.entryPrices && Object.keys(portfolio.entryPrices).length > 0) {
          // Fetch current prices
          const pricesRes = await fetch(`${BASE_URL}/api/prices`);
          if (pricesRes.ok) {
            const pricesData = await pricesRes.json();
            const result = calculateScore(portfolio, pricesData.prices);
            score = result.totalScore;
          }
        }

        // Get rank from leaderboard
        const leaderboardRes = await fetch(`${BASE_URL}/api/leaderboard?limit=100`);
        if (leaderboardRes.ok) {
          const leaderboard = await leaderboardRes.json();
          const entry = leaderboard.find((r: { user: string }) => 
            r.user.toLowerCase() === address.toLowerCase()
          );
          if (entry) {
            rank = entry.rank;
          }
        }
      }
    } catch (e) {
      console.error('Error fetching portfolio from Redis:', e);
    }
  }

  // Build OG image URL
  const ogParams = new URLSearchParams();
  ogParams.set('address', address);
  if (allocations.length > 0) {
    ogParams.set('allocations', JSON.stringify(allocations));
  }
  if (score !== null) {
    ogParams.set('score', score.toString());
  }
  if (rank !== null) {
    ogParams.set('rank', rank.toString());
  }
  ogParams.set('week', week.toString());
  ogParams.set('season', season.replace('s', ''));

  const imageUrl = `${BASE_URL}/api/og/portfolio?${ogParams.toString()}`;

  // Generate frame HTML
  const buttons: FrameButton[] = [];
  
  if (allocations.length > 0) {
    buttons.push({ 
      label: '👊 Challenge Me!', 
      action: 'link', 
      target: `${BASE_URL}?challenge=${address}` 
    });
  }
  
  buttons.push({ 
    label: '🎯 Join Competition', 
    action: 'link', 
    target: BASE_URL 
  });
  
  buttons.push({ 
    label: '🏆 Leaderboard', 
    action: 'link', 
    target: `${BASE_URL}#leaderboard` 
  });

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const html = generateFrameHtml({
    imageUrl,
    buttons,
    title: `${shortAddress}'s Portfolio - Portfolio League`,
  });

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

/**
 * POST - Handle frame button interactions
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Extract FID and button index from Farcaster frame message
    const { untrustedData } = body;
    const buttonIndex = untrustedData?.buttonIndex || 1;
    const fid = untrustedData?.fid;
    
    // For now, redirect based on button clicked
    // In future, we can verify the frame message signature
    
    let redirectUrl = BASE_URL;
    
    if (buttonIndex === 1) {
      // Challenge button
      redirectUrl = `${BASE_URL}?ref=frame`;
    } else if (buttonIndex === 2) {
      // Join button
      redirectUrl = BASE_URL;
    } else if (buttonIndex === 3) {
      // Leaderboard button
      redirectUrl = `${BASE_URL}#leaderboard`;
    }

    // Return redirect frame
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${BASE_URL}/api/og/portfolio" />
  <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
</head>
<body>
  <p>Redirecting to Portfolio League...</p>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Frame POST error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}


