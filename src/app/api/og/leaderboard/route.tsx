import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';
export const contentType = 'image/png';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio-league.vercel.app';

type LeaderboardEntry = {
  rank: number;
  user: string;
  score: number;
};

export async function GET(req: NextRequest) {
  // Fetch top 5 from leaderboard
  let topPlayers: LeaderboardEntry[] = [];
  
  try {
    const response = await fetch(`${BASE_URL}/api/leaderboard?limit=5`, {
      next: { revalidate: 60 },
    });
    if (response.ok) {
      topPlayers = await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
  }

  // Fallback data if no players
  if (topPlayers.length === 0) {
    topPlayers = [
      { rank: 1, user: '0x0000...0000', score: 0 },
    ];
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#050507',
          padding: '48px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Background gradient effects */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(247,147,26,0.3) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,82,255,0.2) 0%, transparent 70%)',
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0052FF 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: 'white', fontSize: '28px', fontWeight: 700 }}>
                Portfolio League
              </span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>
                Weekly Leaderboard
              </span>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(247,147,26,0.2)',
              borderRadius: '12px',
              padding: '12px 20px',
              border: '1px solid rgba(247,147,26,0.3)',
            }}
          >
            <span style={{ fontSize: '24px' }}>🏆</span>
            <span style={{ color: '#F7931A', fontSize: '20px', fontWeight: 700 }}>
              Top Performers
            </span>
          </div>
        </div>

        {/* Leaderboard */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            flex: 1,
          }}
        >
          {topPlayers.slice(0, 5).map((player, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            const isThird = idx === 2;
            const medal = isFirst ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : '';
            const bgColor = isFirst 
              ? 'rgba(247,147,26,0.15)' 
              : isSecond 
                ? 'rgba(192,192,192,0.1)' 
                : isThird 
                  ? 'rgba(205,127,50,0.1)' 
                  : 'rgba(255,255,255,0.05)';
            const borderColor = isFirst 
              ? 'rgba(247,147,26,0.3)' 
              : 'rgba(255,255,255,0.1)';

            const shortAddress = player.user.length > 12 
              ? `${player.user.slice(0, 6)}...${player.user.slice(-4)}`
              : player.user;

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: bgColor,
                  borderRadius: '16px',
                  padding: '16px 24px',
                  border: `1px solid ${borderColor}`,
                }}
              >
                {/* Rank */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    fontSize: '24px',
                  }}
                >
                  {medal || `#${player.rank}`}
                </div>

                {/* Avatar */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0052FF 0%, #7c3aed 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 700,
                    marginLeft: '16px',
                  }}
                >
                  {player.user.slice(2, 4).toUpperCase()}
                </div>

                {/* Address */}
                <span
                  style={{
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    marginLeft: '16px',
                    flex: 1,
                  }}
                >
                  {shortAddress}
                </span>

                {/* Score */}
                <span
                  style={{
                    color: player.score >= 0 ? '#10b981' : '#f43f5e',
                    fontSize: '24px',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  {player.score >= 0 ? '+' : ''}{player.score.toFixed(2)}%
                </span>
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
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px' }}>
            Can you make it to the top? 🎯
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #0052FF 0%, #7c3aed 100%)',
              borderRadius: '12px',
              padding: '12px 24px',
            }}
          >
            <span style={{ color: 'white', fontSize: '16px', fontWeight: 600 }}>
              Join Now →
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
        'Content-Type': 'image/png',
      },
    }
  );
}

