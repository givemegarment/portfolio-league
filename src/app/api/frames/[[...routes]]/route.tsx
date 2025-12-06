/** @jsxImportSource frog/jsx */
import { Button, Frog } from 'frog';
import { handle } from 'frog/vercel';
import { 
  BASE_URL, 
  ASSET_COLORS, 
  formatAddress, 
  formatScore, 
  getScoreColor,
  fetchLeaderboard,
  fetchPortfolio,
  getWeekInfo,
} from '@/lib/frames';

// State type for the app
type State = {
  page: number;
};

// Create Frog app
const app = new Frog<{ State: State }>({
  basePath: '/api/frames',
  title: 'Portfolio League',
  initialState: { page: 0 },
  imageOptions: {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', weight: 400, source: 'google' },
      { name: 'Inter', weight: 700, source: 'google' },
    ],
  },
});

// ============ HOME FRAME ============
app.frame('/', async (c) => {
  const weekInfo = await getWeekInfo();
  
  return c.res({
    image: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#050507',
          padding: '60px',
        }}
      >
        {/* Background gradients */}
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
              <span style={{ fontSize: '48px' }}>🏆</span>
            </div>
            <span style={{ color: 'white', fontSize: '56px', fontWeight: 800 }}>
              Portfolio League
            </span>
          </div>

          {/* Tagline */}
          <div style={{ display: 'flex', fontSize: '64px', fontWeight: 800, marginBottom: '24px' }}>
            <span style={{ color: 'white' }}>Pick. Compete. </span>
            <span style={{ color: '#10b981' }}>Win.</span>
          </div>

          {/* Description */}
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '28px', textAlign: 'center', maxWidth: '800px' }}>
            Select 3 crypto assets each week. Compete against other traders. Top 10% share the prize pool.
          </span>

          {/* Week Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginTop: '40px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '16px 32px',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '24px' }}>
              Season {weekInfo.season} • Week {weekInfo.week}
            </span>
            <span style={{ color: '#10b981', fontSize: '24px', fontWeight: 700 }}>
              $1,000 Prize Pool
            </span>
          </div>
        </div>
      </div>
    ),
    intents: [
      <Button action="/leaderboard">🏆 Leaderboard</Button>,
      <Button action="/join">🎯 Join Now</Button>,
      <Button.Link href={BASE_URL}>Open App</Button.Link>,
    ],
  });
});

// ============ LEADERBOARD FRAME ============
app.frame('/leaderboard', async (c) => {
  const { deriveState } = c;
  const state = deriveState((prev) => prev);
  const page = state.page || 0;
  
  const leaderboard = await fetchLeaderboard(10);
  const weekInfo = await getWeekInfo();
  
  // Get 5 players for current page
  const startIdx = page * 5;
  const players = leaderboard.slice(startIdx, startIdx + 5);
  const hasMore = leaderboard.length > startIdx + 5;
  const hasPrev = page > 0;

  return c.res({
    image: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#050507',
          padding: '48px',
        }}
      >
        {/* Background */}
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

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '36px' }}>🏆</span>
            <span style={{ color: 'white', fontSize: '32px', fontWeight: 700 }}>Leaderboard</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '20px' }}>
            Season {weekInfo.season} • Week {weekInfo.week}
          </span>
        </div>

        {/* Players List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          {players.length === 0 ? (
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '24px' }}>No entries yet this week</span>
            </div>
          ) : (
            players.map((player, idx) => {
              const actualRank = startIdx + idx + 1;
              const medal = actualRank === 1 ? '🥇' : actualRank === 2 ? '🥈' : actualRank === 3 ? '🥉' : '';
              const bgColor = actualRank === 1 ? 'rgba(247,147,26,0.15)' : 'rgba(255,255,255,0.05)';

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: bgColor,
                    borderRadius: '16px',
                    padding: '16px 24px',
                  }}
                >
                  <span style={{ width: '50px', fontSize: '24px', textAlign: 'center' }}>
                    {medal || `#${actualRank}`}
                  </span>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0052FF 0%, #7c3aed 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 700,
                      marginLeft: '12px',
                    }}
                  >
                    {player.user.slice(2, 4).toUpperCase()}
                  </div>
                  <span style={{ color: 'white', fontSize: '20px', fontFamily: 'monospace', marginLeft: '16px', flex: 1 }}>
                    {formatAddress(player.user)}
                  </span>
                  <span style={{ color: getScoreColor(player.score), fontSize: '22px', fontWeight: 700, fontFamily: 'monospace' }}>
                    {formatScore(player.score)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Page indicator */}
        {leaderboard.length > 5 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px' }}>
              Page {page + 1} of {Math.ceil(leaderboard.length / 5)}
            </span>
          </div>
        )}
      </div>
    ),
    intents: [
      hasPrev && <Button action="/leaderboard" value="prev">← Prev</Button>,
      hasMore && <Button action="/leaderboard" value="next">Next →</Button>,
      <Button action="/">🏠 Home</Button>,
      <Button.Link href={BASE_URL}>Open App</Button.Link>,
    ].filter(Boolean),
  });
});

// Handle leaderboard pagination
app.frame('/leaderboard', async (c) => {
  const { buttonValue, deriveState } = c;
  
  deriveState((prev) => {
    if (buttonValue === 'next') {
      prev.page = (prev.page || 0) + 1;
    } else if (buttonValue === 'prev') {
      prev.page = Math.max(0, (prev.page || 0) - 1);
    }
  });
  
  // Re-render with updated state
  const state = c.deriveState((s) => s);
  const page = state.page || 0;
  const leaderboard = await fetchLeaderboard(10);
  const weekInfo = await getWeekInfo();
  
  const startIdx = page * 5;
  const players = leaderboard.slice(startIdx, startIdx + 5);
  const hasMore = leaderboard.length > startIdx + 5;
  const hasPrev = page > 0;

  return c.res({
    image: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#050507',
          padding: '48px',
        }}
      >
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '36px' }}>🏆</span>
            <span style={{ color: 'white', fontSize: '32px', fontWeight: 700 }}>Leaderboard</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '20px' }}>
            Season {weekInfo.season} • Week {weekInfo.week}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          {players.map((player, idx) => {
            const actualRank = startIdx + idx + 1;
            const medal = actualRank === 1 ? '🥇' : actualRank === 2 ? '🥈' : actualRank === 3 ? '🥉' : '';
            const bgColor = actualRank === 1 ? 'rgba(247,147,26,0.15)' : 'rgba(255,255,255,0.05)';

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: bgColor,
                  borderRadius: '16px',
                  padding: '16px 24px',
                }}
              >
                <span style={{ width: '50px', fontSize: '24px', textAlign: 'center' }}>
                  {medal || `#${actualRank}`}
                </span>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0052FF 0%, #7c3aed 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 700,
                    marginLeft: '12px',
                  }}
                >
                  {player.user.slice(2, 4).toUpperCase()}
                </div>
                <span style={{ color: 'white', fontSize: '20px', fontFamily: 'monospace', marginLeft: '16px', flex: 1 }}>
                  {formatAddress(player.user)}
                </span>
                <span style={{ color: getScoreColor(player.score), fontSize: '22px', fontWeight: 700, fontFamily: 'monospace' }}>
                  {formatScore(player.score)}
                </span>
              </div>
            );
          })}
        </div>

        {leaderboard.length > 5 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px' }}>
              Page {page + 1} of {Math.ceil(leaderboard.length / 5)}
            </span>
          </div>
        )}
      </div>
    ),
    intents: [
      hasPrev && <Button action="/leaderboard" value="prev">← Prev</Button>,
      hasMore && <Button action="/leaderboard" value="next">Next →</Button>,
      <Button action="/">🏠 Home</Button>,
      <Button.Link href={BASE_URL}>Open App</Button.Link>,
    ].filter(Boolean),
  });
});

// ============ JOIN FRAME ============
app.frame('/join', async (c) => {
  const weekInfo = await getWeekInfo();

  return c.res({
    image: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#050507',
          padding: '60px',
        }}
      >
        {/* Background */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontSize: '64px', marginBottom: '24px' }}>🎯</span>
          <span style={{ color: 'white', fontSize: '48px', fontWeight: 800, marginBottom: '16px' }}>
            Join Week {weekInfo.week}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '28px', textAlign: 'center', maxWidth: '700px', marginBottom: '40px' }}>
            Pick 3 crypto assets and compete for a share of the $1,000 prize pool!
          </span>

          {/* How it works */}
          <div style={{ display: 'flex', gap: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px 32px' }}>
              <span style={{ color: '#0052FF', fontSize: '36px', fontWeight: 700 }}>1</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px', marginTop: '8px' }}>Pick Assets</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px 32px' }}>
              <span style={{ color: '#7c3aed', fontSize: '36px', fontWeight: 700 }}>2</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px', marginTop: '8px' }}>Set Allocation</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px 32px' }}>
              <span style={{ color: '#10b981', fontSize: '36px', fontWeight: 700 }}>3</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px', marginTop: '8px' }}>Win Prizes</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px' }}>
            Free to play • Top 10% share the prize pool
          </span>
        </div>
      </div>
    ),
    intents: [
      <Button.Link href={BASE_URL}>🚀 Open App & Join</Button.Link>,
      <Button action="/leaderboard">🏆 Leaderboard</Button>,
      <Button action="/">← Back</Button>,
    ],
  });
});

// ============ PORTFOLIO FRAME ============
app.frame('/portfolio/:address', async (c) => {
  const address = c.req.param('address') || '';
  const portfolio = await fetchPortfolio(address);
  const weekInfo = await getWeekInfo();

  if (!portfolio || !portfolio.allocations?.length) {
    return c.res({
      image: (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: '#050507',
            padding: '60px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '64px', marginBottom: '24px' }}>📭</span>
          <span style={{ color: 'white', fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>
            No Portfolio Found
          </span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '24px' }}>
            This address hasn't submitted a portfolio yet
          </span>
        </div>
      ),
      intents: [
        <Button action="/join">🎯 Join Competition</Button>,
        <Button action="/">🏠 Home</Button>,
      ],
    });
  }

  return c.res({
    image: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#050507',
          padding: '48px',
        }}
      >
        {/* Background */}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
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
              <span style={{ color: 'white', fontSize: '24px', fontWeight: 600, fontFamily: 'monospace' }}>
                {formatAddress(address)}
              </span>
              {portfolio.score !== undefined && (
                <span style={{ color: getScoreColor(portfolio.score), fontSize: '20px', fontWeight: 600 }}>
                  {formatScore(portfolio.score)} return
                </span>
              )}
            </div>
          </div>
          {portfolio.rank && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 20px' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px' }}>Rank</span>
              <span style={{ color: '#F7931A', fontSize: '28px', fontWeight: 700 }}>#{portfolio.rank}</span>
            </div>
          )}
        </div>

        {/* Allocation Bar */}
        <div style={{ display: 'flex', height: '48px', borderRadius: '24px', overflow: 'hidden', marginBottom: '24px' }}>
          {portfolio.allocations.map((a, idx) => (
            <div
              key={idx}
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
                <span style={{ color: 'white', fontSize: '16px', fontWeight: 700 }}>{a.symbol}</span>
              )}
            </div>
          ))}
        </div>

        {/* Allocation Details */}
        <div style={{ display: 'flex', gap: '24px', flex: 1 }}>
          {portfolio.allocations.map((a, idx) => (
            <div
              key={idx}
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
              <span style={{ color: 'white', fontSize: '18px', fontWeight: 600, fontFamily: 'monospace' }}>
                {a.symbol}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px', fontFamily: 'monospace' }}>
                {a.percentage}%
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px' }}>
            Season {weekInfo.season} • Week {weekInfo.week}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px' }}>
            portfolio-league.vercel.app
          </span>
        </div>
      </div>
    ),
    intents: [
      <Button action="/leaderboard">🏆 Leaderboard</Button>,
      <Button action="/join">🎯 Challenge</Button>,
      <Button.Link href={`${BASE_URL}?challenge=${address}`}>Open App</Button.Link>,
    ],
  });
});

// Export handlers for Vercel
export const GET = handle(app);
export const POST = handle(app);

