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

type Allocation = { symbol: string; percentage: number };

type Challenge = {
  id: string;
  challengerAddress: string;
  challengedAddress: string | null;
  season: string;
  week: number;
  status: 'open' | 'accepted' | 'completed' | 'expired';
  challengerScore: number | null;
  challengedScore: number | null;
  winnerId: string | null;
  challengerPortfolio?: { allocations: Allocation[] };
  challengedPortfolio?: { allocations: Allocation[] };
};

/**
 * Generate challenge OG image
 */
async function generateChallengeImage(challenge: Challenge) {
  const shortChallenger = `${challenge.challengerAddress.slice(0, 6)}...${challenge.challengerAddress.slice(-4)}`;
  const shortChallenged = challenge.challengedAddress 
    ? `${challenge.challengedAddress.slice(0, 6)}...${challenge.challengedAddress.slice(-4)}`
    : '???';

  const isCompleted = challenge.status === 'completed';
  const isAccepted = challenge.status === 'accepted';
  const isOpen = challenge.status === 'open';

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
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,82,255,0.3) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(244,63,94,0.2) 0%, transparent 70%)',
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              <span style={{ fontSize: '24px' }}>⚔️</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: 'white', fontSize: '24px', fontWeight: 700 }}>
                Portfolio Challenge
              </span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                Season {challenge.season.replace('s', '')} • Week {challenge.week}
              </span>
            </div>
          </div>

          {/* Status badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: isCompleted 
                ? 'rgba(16,185,129,0.2)' 
                : isAccepted 
                ? 'rgba(245,158,11,0.2)'
                : 'rgba(0,82,255,0.2)',
              borderRadius: '20px',
              padding: '8px 16px',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isCompleted ? '#10b981' : isAccepted ? '#f59e0b' : '#0052FF',
              }}
            />
            <span
              style={{
                color: isCompleted ? '#10b981' : isAccepted ? '#f59e0b' : '#0052FF',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              {isCompleted ? 'Completed' : isAccepted ? 'In Progress' : 'Open Challenge'}
            </span>
          </div>
        </div>

        {/* VS Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '40px',
            flex: 1,
          }}
        >
          {/* Challenger */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              flex: 1,
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0052FF 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '28px',
                fontWeight: 700,
              }}
            >
              {challenge.challengerAddress.slice(2, 4).toUpperCase()}
            </div>
            <span
              style={{
                color: 'white',
                fontSize: '18px',
                fontWeight: 600,
                fontFamily: 'monospace',
              }}
            >
              {shortChallenger}
            </span>
            
            {/* Portfolio bar */}
            {challenge.challengerPortfolio?.allocations && (
              <div
                style={{
                  display: 'flex',
                  width: '200px',
                  height: '24px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                {challenge.challengerPortfolio.allocations.map((a, idx) => (
                  <div
                    key={a.symbol}
                    style={{
                      width: `${a.percentage}%`,
                      height: '100%',
                      backgroundColor: ASSET_COLORS[a.symbol] || '#666',
                      marginLeft: idx > 0 ? '2px' : 0,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Score */}
            {challenge.challengerScore !== null && (
              <span
                style={{
                  color: challenge.challengerScore >= 0 ? '#10b981' : '#f43f5e',
                  fontSize: '24px',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                }}
              >
                {challenge.challengerScore >= 0 ? '+' : ''}{challenge.challengerScore.toFixed(2)}%
              </span>
            )}

            {/* Winner badge */}
            {isCompleted && challenge.winnerId === challenge.challengerAddress && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #F7931A 0%, #FFD700 100%)',
                  borderRadius: '8px',
                  padding: '4px 12px',
                  color: '#000',
                  fontSize: '14px',
                  fontWeight: 700,
                }}
              >
                🏆 WINNER
              </div>
            )}
          </div>

          {/* VS */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '28px',
              fontWeight: 700,
            }}
          >
            VS
          </div>

          {/* Challenged */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              flex: 1,
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: challenge.challengedAddress 
                  ? 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)'
                  : 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: challenge.challengedAddress ? '28px' : '32px',
                fontWeight: 700,
              }}
            >
              {challenge.challengedAddress 
                ? challenge.challengedAddress.slice(2, 4).toUpperCase()
                : '?'
              }
            </div>
            <span
              style={{
                color: challenge.challengedAddress ? 'white' : 'rgba(255,255,255,0.4)',
                fontSize: '18px',
                fontWeight: 600,
                fontFamily: 'monospace',
              }}
            >
              {shortChallenged}
            </span>

            {/* Portfolio bar */}
            {challenge.challengedPortfolio?.allocations && (
              <div
                style={{
                  display: 'flex',
                  width: '200px',
                  height: '24px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                {challenge.challengedPortfolio.allocations.map((a, idx) => (
                  <div
                    key={a.symbol}
                    style={{
                      width: `${a.percentage}%`,
                      height: '100%',
                      backgroundColor: ASSET_COLORS[a.symbol] || '#666',
                      marginLeft: idx > 0 ? '2px' : 0,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Score */}
            {challenge.challengedScore !== null && (
              <span
                style={{
                  color: challenge.challengedScore >= 0 ? '#10b981' : '#f43f5e',
                  fontSize: '24px',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                }}
              >
                {challenge.challengedScore >= 0 ? '+' : ''}{challenge.challengedScore.toFixed(2)}%
              </span>
            )}

            {/* Winner badge */}
            {isCompleted && challenge.winnerId === challenge.challengedAddress && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #F7931A 0%, #FFD700 100%)',
                  borderRadius: '8px',
                  padding: '4px 12px',
                  color: '#000',
                  fontSize: '14px',
                  fontWeight: 700,
                }}
              >
                🏆 WINNER
              </div>
            )}

            {/* Accept prompt for open challenges */}
            {isOpen && (
              <div
                style={{
                  background: 'rgba(0,82,255,0.2)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: '#0052FF',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Waiting for challenger...
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {isOpen ? (
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>
              👇 Think you can beat this portfolio? Accept the challenge!
            </span>
          ) : isAccepted ? (
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>
              ⏳ Challenge in progress • Winner determined at week end
            </span>
          ) : (
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>
              🏁 Challenge complete • Join Portfolio League for more competitions!
            </span>
          )}
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
 * GET - Render challenge Frame
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const challengeId = params.id;
  const { searchParams } = new URL(req.url);

  try {
    // Fetch challenge data
    const challengeRes = await fetch(`${BASE_URL}/api/challenge?id=${challengeId}`, {
      cache: 'no-store',
    });

    if (!challengeRes.ok) {
      // Return error frame
      const html = `<!DOCTYPE html>
<html>
<head>
  <title>Challenge Not Found</title>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${BASE_URL}/api/og/portfolio?address=Challenge+Not+Found" />
  <meta property="fc:frame:button:1" content="🎯 Create Your Own Challenge" />
  <meta property="fc:frame:button:1:action" content="link" />
  <meta property="fc:frame:button:1:target" content="${BASE_URL}" />
</head>
<body><h1>Challenge not found</h1></body>
</html>`;
      return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
    }

    const challenge: Challenge = await challengeRes.json();

    // Check if this is an image request
    if (searchParams.get('image') === 'true') {
      return generateChallengeImage(challenge);
    }

    // Build buttons based on challenge status
    const buttons: string[] = [];
    
    if (challenge.status === 'open') {
      buttons.push(`
        <meta property="fc:frame:button:1" content="👊 Accept Challenge" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content="${BASE_URL}?challenge=${challengeId}" />
      `);
      buttons.push(`
        <meta property="fc:frame:button:2" content="🎯 Create Your Own" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta property="fc:frame:button:2:target" content="${BASE_URL}" />
      `);
    } else {
      buttons.push(`
        <meta property="fc:frame:button:1" content="🎯 Join Competition" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content="${BASE_URL}" />
      `);
      buttons.push(`
        <meta property="fc:frame:button:2" content="🏆 View Leaderboard" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta property="fc:frame:button:2:target" content="${BASE_URL}#leaderboard" />
      `);
    }

    const imageUrl = `${BASE_URL}/api/frame/challenge/${challengeId}?image=true&t=${Date.now()}`;
    const shortChallenger = `${challenge.challengerAddress.slice(0, 6)}...${challenge.challengerAddress.slice(-4)}`;

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Challenge from ${shortChallenger} - Portfolio League</title>
  <meta property="og:title" content="Portfolio Challenge from ${shortChallenger}" />
  <meta property="og:description" content="Think you can beat this portfolio? Accept the challenge!" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  ${buttons.join('\n')}
</head>
<body>
  <h1>Portfolio Challenge</h1>
  <p>Challenge from ${shortChallenger}</p>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Challenge frame error:', error);
    return NextResponse.json({ error: 'Failed to generate frame' }, { status: 500 });
  }
}

