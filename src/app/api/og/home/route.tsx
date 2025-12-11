import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#050507',
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Background gradient effects */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            right: '-150px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,82,255,0.4) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            left: '-150px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #0052FF 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
              </svg>
            </div>
            <span style={{ color: 'white', fontSize: '56px', fontWeight: 800 }}>
              Imitatio
            </span>
          </div>

          {/* Tagline */}
          <div
            style={{
              display: 'flex',
              fontSize: '72px',
              fontWeight: 800,
              marginBottom: '24px',
            }}
          >
            <span style={{ color: 'white' }}>Pick.</span>
            <span style={{ color: 'white', marginLeft: '20px' }}>Compete.</span>
            <span
              style={{
                marginLeft: '20px',
                background: 'linear-gradient(135deg, #10b981 0%, #0052FF 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Win.
            </span>
          </div>

          {/* Description */}
          <span
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '28px',
              textAlign: 'center',
              maxWidth: '800px',
            }}
          >
            Select 3 crypto assets each week. Compete against other traders.
            Top 10% share the prize pool.
          </span>

          {/* Stats Row */}
          <div
            style={{
              display: 'flex',
              gap: '48px',
              marginTop: '48px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '16px',
                padding: '20px 40px',
              }}
            >
              <span style={{ color: '#10b981', fontSize: '36px', fontWeight: 700 }}>$1,000</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>Prize Pool</span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '16px',
                padding: '20px 40px',
              }}
            >
              <span style={{ color: '#0052FF', fontSize: '36px', fontWeight: 700 }}>Weekly</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>Competitions</span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '16px',
                padding: '20px 40px',
              }}
            >
              <span style={{ color: '#7c3aed', fontSize: '36px', fontWeight: 700 }}>Base</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>Blockchain</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '18px',
          }}
        >
          imitatio.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        'Content-Type': 'image/png',
      },
    }
  );
}

