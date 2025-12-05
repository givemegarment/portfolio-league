import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Farcaster Frame requires exact 1.91:1 aspect ratio
export const contentType = 'image/png';

// Asset colors for the portfolio visualization
const ASSET_COLORS: Record<string, string> = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  SOL: '#9945FF',
  USDC: '#2775CA',
};

type Allocation = {
  symbol: string;
  percentage: number;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  // Parse parameters
  const address = searchParams.get('address') || '0x0000...0000';
  const allocationsParam = searchParams.get('allocations');
  const score = searchParams.get('score');
  const rank = searchParams.get('rank');
  const week = searchParams.get('week') || '1';
  const season = searchParams.get('season') || '1';
  
  // Parse allocations
  let allocations: Allocation[] = [];
  if (allocationsParam) {
    try {
      allocations = JSON.parse(decodeURIComponent(allocationsParam));
    } catch {
      allocations = [
        { symbol: 'BTC', percentage: 50 },
        { symbol: 'ETH', percentage: 30 },
        { symbol: 'SOL', percentage: 20 },
      ];
    }
  }

  const shortAddress = address.length > 12 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;

  const hasScore = score !== null && score !== undefined;
  const scoreNum = hasScore ? parseFloat(score) : 0;
  const isPositive = scoreNum >= 0;

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
            background: 'radial-gradient(circle, rgba(0,82,255,0.3) 0%, transparent 70%)',
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
            background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
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
            {/* Logo */}
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
                Season {season} • Week {week}
              </span>
            </div>
          </div>

          {/* Rank badge if available */}
          {rank && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '12px 20px',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px' }}>
                Rank
              </span>
              <span style={{ color: '#F7931A', fontSize: '28px', fontWeight: 700 }}>
                #{rank}
              </span>
            </div>
          )}
        </div>

        {/* User info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0052FF 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 700,
            }}
          >
            {address.slice(2, 4).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                color: 'white',
                fontSize: '24px',
                fontWeight: 600,
                fontFamily: 'monospace',
              }}
            >
              {shortAddress}
            </span>
            {hasScore && (
              <span
                style={{
                  color: isPositive ? '#10b981' : '#f43f5e',
                  fontSize: '20px',
                  fontWeight: 600,
                }}
              >
                {isPositive ? '+' : ''}{scoreNum.toFixed(2)}% return
              </span>
            )}
          </div>
        </div>

        {/* Portfolio visualization */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flex: 1,
          }}
        >
          <span
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            Portfolio Allocation
          </span>

          {/* Allocation bar */}
          <div
            style={{
              display: 'flex',
              height: '48px',
              borderRadius: '24px',
              overflow: 'hidden',
            }}
          >
            {allocations.map((a, idx) => (
              <div
                key={a.symbol}
                style={{
                  width: `${a.percentage}%`,
                  height: '100%',
                  backgroundColor: ASSET_COLORS[a.symbol] || '#666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: idx > 0 ? '4px' : 0,
                }}
              >
                {a.percentage >= 15 && (
                  <span
                    style={{
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 700,
                    }}
                  >
                    {a.symbol}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Allocation details */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              marginTop: '16px',
            }}
          >
            {allocations.map((a) => (
              <div
                key={a.symbol}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '12px 20px',
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: ASSET_COLORS[a.symbol] || '#666',
                  }}
                />
                <span
                  style={{
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 600,
                    fontFamily: 'monospace',
                  }}
                >
                  {a.symbol}
                </span>
                <span
                  style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '18px',
                    fontFamily: 'monospace',
                  }}
                >
                  {a.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px' }}>
            Think you can beat this? 🎯
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
              Join the Competition →
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


