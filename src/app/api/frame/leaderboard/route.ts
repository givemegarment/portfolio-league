import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio-league.vercel.app';

const ASSET_COLORS: Record<string, string> = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  SOL: '#9945FF',
  USDC: '#2775CA',
};

type LeaderboardEntry = {
  rank: number;
  user: string;
  score: number;
  allocations: { symbol: string; percentage: number }[];
};

/**
 * Generate leaderboard OG image
 */
async function generateLeaderboardImage(entries: LeaderboardEntry[]) {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#050507',
          padding: '40px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Background effects */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,82,255,0.3) 0%, transparent 70%)',
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0052FF 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'white', fontSize: '24px', fontWeight: 700 }}>
              🏆 Top Performers
            </span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
              Portfolio League • Live Rankings
            </span>
          </div>
        </div>

        {/* Leaderboard entries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {entries.slice(0, 5).map((entry) => {
            const isPositive = entry.score >= 0;
            const shortAddress = `${entry.user.slice(0, 6)}...${entry.user.slice(-4)}`;
            
            return (
              <div
                key={entry.rank}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: entry.rank <= 3 ? 'rgba(255,255,255,0.05)' : 'transparent',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  gap: '16px',
                }}
              >
                {/* Rank */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: entry.rank === 1 
                      ? 'linear-gradient(135deg, #F7931A 0%, #FFD700 100%)'
                      : entry.rank === 2
                      ? 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 100%)'
                      : entry.rank === 3
                      ? 'linear-gradient(135deg, #CD7F32 0%, #DBA45D 100%)'
                      : 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: entry.rank <= 3 ? '#000' : 'rgba(255,255,255,0.6)',
                    fontSize: '16px',
                    fontWeight: 700,
                  }}
                >
                  {entry.rank}
                </div>

                {/* Address */}
                <span
                  style={{
                    color: 'white',
                    fontSize: '16px',
                    fontFamily: 'monospace',
                    width: '140px',
                  }}
                >
                  {shortAddress}
                </span>

                {/* Score */}
                <span
                  style={{
                    color: isPositive ? '#10b981' : '#f43f5e',
                    fontSize: '16px',
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    width: '80px',
                  }}
                >
                  {isPositive ? '+' : ''}{entry.score.toFixed(2)}%
                </span>

                {/* Portfolio mini-bar */}
                <div
                  style={{
                    display: 'flex',
                    flex: 1,
                    height: '24px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                  }}
                >
                  {entry.allocations.map((a, idx) => (
                    <div
                      key={a.symbol}
                      style={{
                        width: `${a.percentage}%`,
                        height: '100%',
                        backgroundColor: ASSET_COLORS[a.symbol] || '#666',
                        marginLeft: idx > 0 ? '2px' : 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {a.percentage >= 25 && (
                        <span style={{ color: 'white', fontSize: '10px', fontWeight: 600 }}>
                          {a.symbol}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
            Updated live • Compete for the $1,000 prize pool
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #0052FF 0%, #7c3aed 100%)',
              borderRadius: '8px',
              padding: '8px 16px',
            }}
          >
            <span style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>
              Join Now →
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

/**
 * GET - Render leaderboard Frame
 */
export async function GET(req: NextRequest) {
  try {
    // Fetch leaderboard data
    const leaderboardRes = await fetch(`${BASE_URL}/api/leaderboard?limit=5`, {
      cache: 'no-store',
    });
    
    let entries: LeaderboardEntry[] = [];
    if (leaderboardRes.ok) {
      entries = await leaderboardRes.json();
    }

    // Check if this is an image request
    const { searchParams } = new URL(req.url);
    if (searchParams.get('image') === 'true') {
      return generateLeaderboardImage(entries);
    }

    // Return Frame HTML
    const imageUrl = `${BASE_URL}/api/frame/leaderboard?image=true&t=${Date.now()}`;
    
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Portfolio League Leaderboard</title>
  <meta property="og:title" content="Portfolio League - Top Performers" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="🎯 Join Competition" />
  <meta property="fc:frame:button:1:action" content="link" />
  <meta property="fc:frame:button:1:target" content="${BASE_URL}" />
  <meta property="fc:frame:button:2" content="🔄 Refresh" />
  <meta property="fc:frame:button:2:action" content="post" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api/frame/leaderboard" />
</head>
<body>
  <h1>Portfolio League Leaderboard</h1>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Leaderboard frame error:', error);
    return NextResponse.json({ error: 'Failed to generate frame' }, { status: 500 });
  }
}

/**
 * POST - Handle refresh button
 */
export async function POST() {
  // Just return the same frame with fresh data
  const imageUrl = `${BASE_URL}/api/frame/leaderboard?image=true&t=${Date.now()}`;
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="🎯 Join Competition" />
  <meta property="fc:frame:button:1:action" content="link" />
  <meta property="fc:frame:button:1:target" content="${BASE_URL}" />
  <meta property="fc:frame:button:2" content="🔄 Refresh" />
  <meta property="fc:frame:button:2:action" content="post" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api/frame/leaderboard" />
</head>
<body></body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

